import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  clearPresentationData,
  setPresentationData,
  setStreaming,
} from "@/store/slices/presentationGeneration";
import { jsonrepair } from "jsonrepair";
import { toast } from "sonner";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";

export const usePresentationStreaming = (
  presentationId: string,
  stream: string | null,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void,
  fetchUserSlides: () => void
) => {
  const dispatch = useDispatch();
  const previousSlidesLength = useRef(0);
  // Track a fingerprint of the last slide's content to detect in-progress updates
  const previousLastSlideFingerprint = useRef("");
  // Keep the latest callback in a ref so we never need it in useEffect deps.
  // If we added the raw callback to deps, an inline `() => {}` from the parent
  // would create a new reference on every render (Redux dispatch → re-render),
  // which would tear down and recreate the EventSource on every dispatched slide.
  const fetchUserSlidesRef = useRef(fetchUserSlides);
  fetchUserSlidesRef.current = fetchUserSlides;

  useEffect(() => {
    let eventSource: EventSource;
    let accumulatedChunks = "";

    const initializeStream = async () => {
      dispatch(setStreaming(true));
      dispatch(clearPresentationData());

      trackEvent(MixpanelEvent.Presentation_Stream_API_Call);

      eventSource = new EventSource(
        `/api/v1/ppt/presentation/stream/${presentationId}`
      );

      eventSource.addEventListener("response", (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "chunk":
            accumulatedChunks += data.chunk;
            try {
              const repairedJson = jsonrepair(accumulatedChunks);
              const partialData = JSON.parse(repairedJson);

              if (partialData.slides && partialData.slides.length > 0) {
                const currentLength = partialData.slides.length;
                // Fingerprint the last slide so we can detect its content changing
                // even when the total slide count hasn't grown yet
                const lastSlide = partialData.slides[currentLength - 1];
                const lastSlideFingerprint = JSON.stringify(lastSlide).slice(0, 200);

                const countChanged = currentLength !== previousSlidesLength.current;
                const lastSlideChanged = lastSlideFingerprint !== previousLastSlideFingerprint.current;

                if (countChanged || lastSlideChanged) {
                  dispatch(
                    setPresentationData({
                      ...partialData,
                      slides: partialData.slides,
                    })
                  );
                  previousSlidesLength.current = currentLength;
                  previousLastSlideFingerprint.current = lastSlideFingerprint;
                  setLoading(false);
                }
              }
            } catch (error) {
              // JSON isn't complete yet, continue accumulating
            }
            break;

          case "complete":
            try {
              dispatch(setPresentationData(data.presentation));
              dispatch(setStreaming(false));
              setLoading(false);
              eventSource.close();

              // Remove stream parameter from URL
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete("stream");
              window.history.replaceState({}, "", newUrl.toString());
            } catch (error) {
              eventSource.close();
              console.error("Error parsing accumulated chunks:", error);
            }
            accumulatedChunks = "";
            break;

          case "closing":
            dispatch(setPresentationData(data.presentation));
            setLoading(false);
            dispatch(setStreaming(false));
            eventSource.close();

            // Remove stream parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("stream");
            window.history.replaceState({}, "", newUrl.toString());
            break;
          case "error":
            eventSource.close();
            toast.error("Error in outline streaming", {
              description:
                data.detail ||
                "Failed to connect to the server. Please try again.",
            });
            setLoading(false);
            dispatch(setStreaming(false));
            setError(true);
            break;
        }
      });

      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        setLoading(false);
        dispatch(setStreaming(false));
        setError(true);
        eventSource.close();
      };
    };

    if (stream) {
      initializeStream();
    } else {
      fetchUserSlidesRef.current();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  // NOTE: fetchUserSlides is intentionally NOT in deps — it's accessed via ref.
  // An inline `() => {}` from the parent changes reference on every render
  // (each Redux dispatch triggers re-render → new fn ref → useEffect re-runs →
  // EventSource is destroyed and recreated, causing the infinite stream loop).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentationId, stream, dispatch, setLoading, setError]);
};
