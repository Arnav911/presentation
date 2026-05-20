import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setOutlines } from "@/store/slices/presentationGeneration";
import { jsonrepair } from "jsonrepair";



export const useOutlineStreaming = (presentationId: string | null) => {
  const dispatch = useDispatch();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const [highestActiveIndex, setHighestActiveIndex] = useState<number>(-1);
  const [citations, setCitations] = useState<{ title: string, href: string }[]>([]);
  const [status, setStatus] = useState<string>("");
  const [thinking, setThinking] = useState<string>("");
  
  const prevSlidesRef = useRef<{ content: string }[]>([]);
  const activeIndexRef = useRef<number>(-1);
  const highestIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!presentationId) {
      setIsStreaming(false);
      setIsLoading(false);
      setActiveSlideIndex(null);
      setHighestActiveIndex(-1);
      setCitations([]);
      setStatus("");
      setThinking("");
      prevSlidesRef.current = [];
      activeIndexRef.current = -1;
      highestIndexRef.current = -1;
      return;
    }

    let eventSource: EventSource;
    let accumulatedChunks = "";

    const initializeStream = async () => {
      console.log(`[OutlineStream] Initializing stream for presentation: ${presentationId}`);
      // Clear previous state for a fresh stream
      prevSlidesRef.current = [];
      activeIndexRef.current = -1;
      highestIndexRef.current = -1;
      setCitations([]);
      setStatus("");
      setThinking("");
      
      setIsStreaming(true);
      setIsLoading(true);
      try {
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : '';
        eventSource = new EventSource(
          `${baseUrl}/api/v1/ppt/outlines/stream/${presentationId}`
        );

        eventSource.onopen = () => {
          console.log("[OutlineStream] Connection opened");
        };

        eventSource.addEventListener("citations", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`[OutlineStream] Citations received: ${data.length}`);
            setCitations((prev) => [...prev, ...data]);
          } catch (e) {
            console.error("[OutlineStream] Failed to parse citations:", e);
          }
        });

        eventSource.addEventListener("response", (event) => {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "status":
              console.log("[OutlineStream] Status update:", data.status);
              setStatus(data.status);
              break;
            case "thinking":
              setThinking(prev => prev + (data.thought || ""));
              break;
            case "chunk":
              accumulatedChunks += data.chunk;
              try {
                if (!accumulatedChunks || accumulatedChunks.trim().length === 0) {
                  break;
                }
                const repairedJson = jsonrepair(accumulatedChunks);
                const partialData = JSON.parse(repairedJson);

                if (partialData && typeof partialData === 'object' && partialData.slides && Array.isArray(partialData.slides) && partialData.slides.length > 0) {
                  const nextSlides = partialData.slides;
                  
                  try {
                    const prev = prevSlidesRef.current || [];
                    let changedIndex: number | null = null;
                    const maxLen = Math.max(prev.length, nextSlides.length);
                    for (let i = 0; i < maxLen; i++) {
                      const prevContent = prev[i]?.content;
                      const nextContent = nextSlides[i]?.content;
                      if (nextContent !== prevContent) {
                        changedIndex = i;
                      }
                    }
                    const prevActive = activeIndexRef.current;
                    let nextActive = changedIndex ?? prevActive;
                    if (nextActive < prevActive) {
                      nextActive = prevActive;
                    }
                    activeIndexRef.current = nextActive;
                    setActiveSlideIndex(nextActive);

                    if (nextActive > highestIndexRef.current) {
                      highestIndexRef.current = nextActive;
                      setHighestActiveIndex(nextActive);
                    }
                  } catch (e) {
                    console.error("[OutlineStream] Error calculating changed index:", e);
                  }

                  prevSlidesRef.current = nextSlides;
                  dispatch(setOutlines(nextSlides));
                  setIsLoading(false);
                }
              } catch (error) {
                // JSON isn't complete yet
              }
              break;

            case "complete":
              console.log("[OutlineStream] Stream complete event received");
              try {
                const presentationData = data.presentation;
                const outlinesData = presentationData?.outlines?.slides || [];
                dispatch(setOutlines(outlinesData));
                setIsStreaming(false);
                setIsLoading(false);
                setActiveSlideIndex(null);
                setHighestActiveIndex(-1);
                eventSource.close();
              } catch (error) {
                console.error("Error parsing complete event:", error);
                eventSource.close();
              }
              accumulatedChunks = "";
              break;

            case "closing":
              setIsStreaming(false);
              setIsLoading(false);
              eventSource.close();
              break;
            case "error":
              console.error("[OutlineStream] Error event received:", data.detail);
              setIsStreaming(false);
              setIsLoading(false);
              eventSource.close();
              toast.error('Error in outline streaming', { description: data.detail });
              break;
          }
        });

        eventSource.onerror = () => {
          setIsStreaming(false);
          setIsLoading(false);
          eventSource.close();
          toast.error("Failed to connect to the server.");
        };
      } catch (error) {
        setIsStreaming(false);
        setIsLoading(false);
        toast.error("Failed to initialize connection");
      }
    };
    initializeStream();
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [presentationId, dispatch]);

  return { isStreaming, isLoading, activeSlideIndex, highestActiveIndex, citations, status, thinking };
};
