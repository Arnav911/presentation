"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import EmptyStateView from "./EmptyStateView";
import StorylineChat from "./StorylineChat";
import StorylineBoard from "./StorylineBoard";
import { useOutlineStreaming } from "../hooks/useOutlineStreaming";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { clearPresentationData } from "@/store/slices/presentationGeneration";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { Template } from "../types/index";

const OutlinePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { presentation_id, outlines } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  const streamState = useOutlineStreaming(presentation_id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);

  useEffect(() => {
    // Pre-fetch a template to bypass manual selection
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        if (!res.ok) return;
        const layouts = await res.json();
        const businessTemplate = layouts.find((l: any) => l.templateID === 'marketing-agencies' || l.templateID === 'custom') || layouts[0];
        if (businessTemplate) {
          setDefaultTemplate({
            id: businessTemplate.templateID,
            name: businessTemplate.templateName,
            ordered: businessTemplate.settings?.ordered || false,
            slides: businessTemplate.files,
            description: businessTemplate.settings?.description,
            default: true,
            layoutGroup: businessTemplate.templateID
          });
        }
      } catch (err) {
        console.error("Failed to load default template", err);
      }
    };
    fetchTemplates();
  }, []);

  if (!presentation_id) {
    return <EmptyStateView />;
  }

  const handleGenerate = async () => {
    if (!outlines || outlines.length === 0) {
      toast.error("Waiting for outlines");
      return;
    }

    if (!defaultTemplate) {
      toast.error("Still loading core templates. Please wait a second.");
      return;
    }

    setIsGenerating(true);

    try {
      trackEvent(MixpanelEvent.Presentation_Prepare_API_Call);
      const layoutData = {
        name: defaultTemplate.name,
        ordered: defaultTemplate.ordered,
        slides: defaultTemplate.slides
      };

      const response = await PresentationGenerationApi.presentationPrepare({
        presentation_id,
        outlines: outlines,
        layout: layoutData,
      });

      if (response) {
        // Clear presentation generation data explicitly to navigate to presentation editor clean
        dispatch(clearPresentationData());
        router.replace(`/presentation?id=${presentation_id}&stream=true`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Generation Error", {
        description: error.message || "Failed to prepare the presentation",
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-72px)] mt-16 flex w-full max-w-[1440px] mx-auto">
      <OverlayLoader
        show={isGenerating || streamState.isLoading}
        text={isGenerating ? "Setting up layout geometries..." : "Thinking about storylin..."}
        showProgress={isGenerating}
        duration={isGenerating ? 30 : 0}
      />

      <div className="w-[380px] shrink-0 h-full">
        <StorylineChat />
      </div>

      <div className="flex-1 flex justify-center items-center p-8 bg-transparent">
        <StorylineBoard
          outlines={outlines}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default OutlinePage;