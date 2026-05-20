"use client";
import { Button } from "@/components/ui/button";
import {
  SquareArrowOutUpRight,
  Play,
  Loader2,
  Redo2,
  Undo2,

} from "lucide-react";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { useRouter, usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import { RootState } from "@/store/store";
import { toast } from "sonner";


import Announcement from "@/components/Announcement";
import { PptxPresentationModel } from "@/types/pptx_models";
import HeaderNav from "../../components/HeaderNab";
import PDFIMAGE from "@/public/pdf.svg";
import PPTXIMAGE from "@/public/pptx.svg";
import Image from "next/image";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { usePresentationUndoRedo } from "../hooks/PresentationUndoRedo";
import ToolTip from "@/components/ToolTip";
import { clearPresentationData } from "@/store/slices/presentationGeneration";
import { clearHistory } from "@/store/slices/undoRedoSlice";

const Header = ({
  presentation_id,
  currentSlide,
}: {
  presentation_id: string;
  currentSlide?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();


  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  const { onUndo, onRedo, canUndo, canRedo } = usePresentationUndoRedo();

  const get_presentation_pptx_model = async (id: string): Promise<PptxPresentationModel> => {
    const response = await fetch(`/api/presentation_to_pptx_model?id=${id}`);
    const pptx_model = await response.json();
    return pptx_model;
  };

  const handleExportPptx = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);
      // Save the presentation data before exporting
      trackEvent(MixpanelEvent.Header_UpdatePresentationContent_API_Call);
      await PresentationGenerationApi.updatePresentationContent(presentationData);
      trackEvent(MixpanelEvent.Header_GetPptxModel_API_Call);
      const pptx_model = await get_presentation_pptx_model(presentation_id);
      if (!pptx_model) {
        throw new Error("Failed to get presentation PPTX model");
      }
      trackEvent(MixpanelEvent.Header_ExportAsPPTX_API_Call);
      const pptx_path = await PresentationGenerationApi.exportAsPPTX(pptx_model);
      if (pptx_path) {
        // window.open(pptx_path, '_self');
        downloadLink(pptx_path);
      } else {
        throw new Error("No path returned from export");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setShowLoader(false);
      toast.error("Having trouble exporting!", {
        description:
          "We are having trouble exporting your presentation. Please try again.",
      });
    } finally {
      setShowLoader(false);
    }
  };

  const handleExportPdf = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);
      // Save the presentation data before exporting
      trackEvent(MixpanelEvent.Header_UpdatePresentationContent_API_Call);
      await PresentationGenerationApi.updatePresentationContent(presentationData);

      trackEvent(MixpanelEvent.Header_ExportAsPDF_API_Call);
      const response = await fetch('/api/export-as-pdf', {
        method: 'POST',
        body: JSON.stringify({
          id: presentation_id,
          title: presentationData?.title,
        })
      });

      if (response.ok) {
        const { path: pdfPath } = await response.json();
        // window.open(pdfPath, '_blank');
        downloadLink(pdfPath);
      } else {
        throw new Error("Failed to export PDF");
      }

    } catch (err) {
      console.error(err);
      toast.error("Having trouble exporting!", {
        description:
          "We are having trouble exporting your presentation. Please try again.",
      });
    } finally {
      setShowLoader(false);
    }
  };
  const handleReGenerate = () => {
    dispatch(clearPresentationData());
    dispatch(clearHistory())
    trackEvent(MixpanelEvent.Header_ReGenerate_Button_Clicked, { pathname });
    router.push(`/presentation?id=${presentation_id}&stream=true`);
  };
  const downloadLink = (path: string) => {
    // if we have popup access give direct download if not redirect to the path
    if (window.opener) {
      window.open(path, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = path;
      link.download = path.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
    }
  };

  const ExportOptions = ({ mobile }: { mobile: boolean }) => (
    <div className={`space-y-2 max-md:mt-4 ${mobile ? "" : "bg-white"} rounded-lg`}>
      <Button
        onClick={() => {
          trackEvent(MixpanelEvent.Header_Export_PDF_Button_Clicked, { pathname });
          handleExportPdf();
        }}
        variant="ghost"
        className={`pb-4 border-b rounded-none border-zinc-800 w-full flex justify-start text-foreground ${mobile ? "bg-card py-6 border-none rounded-lg" : ""}`} >
        <Image src={PDFIMAGE} alt="pdf export" width={30} height={30} />
        Export as PDF
      </Button>
      <Button
        onClick={() => {
          trackEvent(MixpanelEvent.Header_Export_PPTX_Button_Clicked, { pathname });
          handleExportPptx();
        }}
        variant="ghost"
        className={`w-full flex justify-start text-foreground ${mobile ? "bg-card py-6" : ""}`}
      >
        <Image src={PPTXIMAGE} alt="pptx export" width={30} height={30} />
        Export as PPTX
      </Button>


    </div>
  );

  const MenuItems = ({ mobile }: { mobile: boolean }) => (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* undo redo */}
      <Button 
        onClick={handleReGenerate} 
        disabled={isStreaming || !presentationData} 
        variant="ghost"
        className="text-white hover:bg-white/10 border border-white/20 rounded-xl px-4 py-2 disabled:opacity-50 transition-all duration-300"
      >
        Re-Generate
      </Button>
      <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
        <ToolTip content="Undo">
          <button 
            disabled={!canUndo} 
            className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-all duration-200" 
            onClick={onUndo}
          >
            <Undo2 className="w-5 h-5" />
          </button>
        </ToolTip>
        <div className="w-[1px] h-4 bg-white/20" />
        <ToolTip content="Redo">
          <button 
            disabled={!canRedo} 
            className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-all duration-200" 
            onClick={onRedo}
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </ToolTip>
      </div>

      {/* Present Button */}
      <Button
        onClick={() => {
          const to = `?id=${presentation_id}&mode=present&slide=${currentSlide || 0}`;
          trackEvent(MixpanelEvent.Navigation, { from: pathname, to });
          router.push(to);
        }}
        variant="ghost"
        className="border border-white/40 font-bold text-white rounded-xl transition-all duration-300 hover:bg-white hover:text-black group"
      >
        <Play className="w-4 h-4 mr-1 stroke-white group-hover:stroke-black" />
        Present
      </Button>

      {/* Desktop Export Button with Popover */}

      <div style={{
        zIndex: 100
      }} className="hidden lg:block relative ">
        <Popover open={open} onOpenChange={setOpen} >
          <PopoverTrigger asChild>
            <Button className={`border py-5 text-foreground font-bold rounded-xl transition-all duration-300 hover:shadow-md hover:bg-white hover:text-black w-full ${mobile ? "" : "bg-card border-zinc-800"}`}>
              <SquareArrowOutUpRight className="w-4 h-4 mr-1" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[250px] space-y-2 py-3 px-2 ">
            <ExportOptions mobile={false} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Export Section */}
      <div className="lg:hidden flex flex-col w-full">
        <ExportOptions mobile={true} />
      </div>
    </div>
  );

  return (
    <>
      <OverlayLoader
        show={showLoader}
        text="Exporting presentation..."
        showProgress={true}
        duration={40}
      />
      <div

        className="bg-background border-b border-zinc-800 w-full sticky top-0 z-50">

        <Announcement />
        <Wrapper className="flex items-center justify-between py-1">
          <Link href="/dashboard" className="min-w-[162px]">
            <img
              className="h-16"
              src="/logo-white.png"
              alt="Presentation AI"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4 2xl:gap-6">
            {isStreaming && (
              <Loader2 className="animate-spin text-white font-bold w-6 h-6" />
            )}


            <MenuItems mobile={false} />
            <HeaderNav />
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-4">
            <HeaderNav />

          </div>
        </Wrapper>

      </div>
    </>
  );
};

export default Header;
