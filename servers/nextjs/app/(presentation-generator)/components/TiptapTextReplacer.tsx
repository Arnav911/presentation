"use client";

import React, { useRef, useEffect, useState, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import TiptapText from "./TiptapText";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Underline from "@tiptap/extension-underline";

const extensions = [StarterKit, Markdown, Underline];

interface TiptapTextReplacerProps {
  children: ReactNode;
  slideData?: any;
  slideIndex?: number;
  onContentChange?: (
    content: string,
    path: string,
    slideIndex?: number
  ) => void;
  editable?: boolean;
}

const TiptapTextReplacer: React.FC<TiptapTextReplacerProps> = ({
  children,
  slideData,
  slideIndex,
  onContentChange = () => {},
  editable = true,
}) => {

  

  const containerRef = useRef<HTMLDivElement>(null);
  // Track created React roots to update content when slideData changes
  const rootsRef = useRef<
    Map<HTMLElement, { root: any; dataPath: string;  fallbackText: string }>
  >(new Map());
  const replaceTextElementsRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const replaceTextElements = () => {
      // Get all elements in the container
      const allElements = container.querySelectorAll("*");

      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;

        // Skip if already has an editor OR is inside an editor
        if (
          htmlElement.classList.contains("tiptap-text-editor") ||
          htmlElement.querySelector(".tiptap-text-editor") ||
          htmlElement.closest(".tiptap-text-editor")
        ) {
          return;
        }

        // Skip if element is inside an ignored element tree
        if (isInIgnoredElementTree(htmlElement)) return;

        // Get direct text content (not from child elements)
        const directTextContent = getDirectTextContent(htmlElement);
        const trimmedText = directTextContent.trim();

        // Check if element has meaningful text content
        if (!trimmedText || trimmedText.length < 1) return;
        
        // Skip elements that contain other elements with text (to avoid double processing)
        if (hasTextChildren(htmlElement)) return;
        
        // Skip certain element types that shouldn't be editable
        if (shouldSkipElement(htmlElement)) return;

        // Get all computed styles to preserve them
        const allClasses = Array.from(htmlElement.classList);
        const allStyles = htmlElement.getAttribute("style");

        const dataPath = findDataPath(slideData, trimmedText);

        // Instead of replacing the element, we mount the editor *inside* it
        // Check computed style to decide on positioning
        const isInline = window.getComputedStyle(htmlElement).display === 'inline';
        
        htmlElement.innerHTML = "";
        
        const tiptapContainer = document.createElement("div");
        tiptapContainer.className = "tiptap-text-editor";
        tiptapContainer.style.width = "100%";
        tiptapContainer.style.minHeight = "1em";
        tiptapContainer.style.display = isInline ? "inline-block" : "block";
        tiptapContainer.style.pointerEvents = "auto";
        htmlElement.appendChild(tiptapContainer);

        // Render TiptapText
        const root = ReactDOM.createRoot(tiptapContainer);
        const initialContent = dataPath.path
          ? getValueByPath(slideData, dataPath.path) ?? trimmedText
          : trimmedText;
        rootsRef.current.set(tiptapContainer, {
          root,
          dataPath: dataPath.path,
        
          fallbackText: trimmedText,
        });
        root.render(
          <TiptapText
            content={initialContent}
            editable={editable}
            onContentChange={(content: string) => {
              // Always trigger change if edited, even if path is uncertain for now
              if (dataPath.path && onContentChange) {
                onContentChange(content, dataPath.path, slideIndex);
              }
            }}
            placeholder="Enter text..."
          />
        );
      });
    };

    replaceTextElementsRef.current = replaceTextElements;

    // Run immediately in case DOM is ready
    let observerTimer: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(observerTimer);
      observerTimer = setTimeout(() => replaceTextElementsRef.current(), 50);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
    }

    // Replace text elements after a short delay as a safety fallback
    const timer = setTimeout(() => replaceTextElementsRef.current(), 800);
    replaceTextElementsRef.current();

    return () => {
      clearTimeout(timer);
      clearTimeout(observerTimer);
      observer.disconnect();
    };
  }, [slideData, slideIndex, editable]);
  
  // When slideData changes, update existing editors' content using the stored dataPath
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    rootsRef.current.forEach(({ root, dataPath, fallbackText }, tiptapContainer) => {
      // Check if the container is still in the document
      if (!document.contains(tiptapContainer)) {
        rootsRef.current.delete(tiptapContainer);
        return;
      }

      const newContent = dataPath ? getValueByPath(slideData, dataPath) ?? fallbackText : fallbackText;
      root.render(
        <TiptapText
          content={newContent}
          editable={editable}
          onContentChange={(content: string) => {
            if (dataPath && onContentChange) {
              onContentChange(content, dataPath, slideIndex);
            }
          }}
          placeholder="Enter text..."
        />
      );
    });
  }, [slideData, slideIndex, editable]);
  // helper functions
    // Function to check if element is inside an ignored element tree
    const isInIgnoredElementTree = (element: HTMLElement): boolean => {
      // List of element types that should be ignored entirely with all their children
      const ignoredElementTypes = [
        "TABLE",
        "TBODY",
        "THEAD",
        "TFOOT",
        "TR",
        "TD",
        "TH", // Table elements
        "SVG",
        "G",
        "PATH",
        "CIRCLE",
        "RECT",
        "LINE", // SVG elements
        "CANVAS", // Canvas element
        "VIDEO",
        "AUDIO", // Media elements
        "IFRAME",
        "EMBED",
        "OBJECT", // Embedded content
        "SELECT",
        "OPTION",
        "OPTGROUP", // Select dropdown elements
        "SCRIPT",
        "STYLE",
        "NOSCRIPT", // Script/style elements
      ];

      // List of class patterns that indicate ignored element trees
      const ignoredClassPatterns = [
        "tooltip", // UI components
        "wysiwyg", // Editor components
        "menu",
        "dropdown",
        "calendar",
        "datepicker", // Date picker components
      ];

      // Check if current element or any parent is in ignored list
      let currentElement: HTMLElement | null = element;
      while (currentElement) {
        // Check element type
        if (ignoredElementTypes.includes(currentElement.tagName)) {
          return true;
        }

        // Check class patterns
        const className =
          currentElement.className.length > 0
            ? currentElement.className.toLowerCase()
            : "";
        if (
          ignoredClassPatterns.some((pattern) => className.includes(pattern))
        ) {
          return true;
        }
        if (currentElement.id.includes("mermaid")) {
          return true;
        }

        // Check for specific attributes that indicate non-text content
        if (
          currentElement.hasAttribute("contenteditable") ||
          currentElement.hasAttribute("data-chart") ||
          currentElement.hasAttribute("data-visualization") ||
          currentElement.hasAttribute("data-interactive")
        ) {
          return true;
        }

        currentElement = currentElement.parentElement;
      }
      return false;
    };

    // Resolve nested values by path like "a.b[0].c"
    const getValueByPath = (obj: any, path: string): any => {
      if (!obj || !path) return undefined;
      const tokens = path
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter(Boolean);
      let current: any = obj;
      for (const token of tokens) {
        if (current == null) return undefined;
        current = current[token as keyof typeof current];
      }
      return current;
    };

    // Helper function to get only direct text content (not from children)
    const getDirectTextContent = (element: HTMLElement): string => {
      let text = "";
      const childNodes = Array.from(element.childNodes);
      for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent || "";
        }
      }
      return text;
    };

    // Helper function to check if element has child elements with text
    const hasTextChildren = (element: HTMLElement): boolean => {
      const children = Array.from(element.children) as HTMLElement[];
      return children.some((child) => {
        const childText = getDirectTextContent(child).trim();
        return childText.length > 0;
      });
    };

    // Helper function to determine if element should be skipped
    const shouldSkipElement = (element: HTMLElement): boolean => {
      // Skip form elements
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(element.tagName)) {
        return true;
      }

      // Skip elements with certain roles or types
      if (
        element.hasAttribute("role") ||
        element.hasAttribute("aria-label") ||
        element.hasAttribute("data-testid")
      ) {
        return true;
      }

      // Skip elements that contain interactive content (simplified since we now use isInIgnoredElementTree)
      if (
        element.querySelector(
          "img, svg, button, input, textarea, select, a[href]"
        )
      ) {
        return true;
      }

      // Skip container elements check removed to allow text nodes with flex/grid classes to be editable

      // Skip extremely short elements that are empty or whitespace
      const text = getDirectTextContent(element).trim();
      if (text.length < 1) return true;

      return false;
    };

    // Helper function to find data path for text content
    const findDataPath = (
      data: any,
      targetText: string,
      path = ""
    ): {
      path: string;
      originalText: string;
    } => {
      if (!data || typeof data !== "object")
        return { path: "", originalText: "" };

      const cleanText = (t: string) => t.replace(/[*_#~`]/g, "").replace(/\s+/g, " ").trim();
      const normalizedTarget = cleanText(targetText);

      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === "string") {
          if (cleanText(value) === normalizedTarget) {
            return { path: currentPath, originalText: value };
          }
        }

        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const result = findDataPath(
              value[i],
              targetText,
              `${currentPath}[${i}]`
            );
            if (result.path) return result;
          }
        } else if (typeof value === "object" && value !== null) {
          const result = findDataPath(value, targetText, currentPath);
          if (result.path) return result;
        }
      }
      return { path: "", originalText: "" };
    };


  return (
    <div ref={containerRef} className="tiptap-text-replacer h-full">
      {children}
    </div>
  );
};

export default TiptapTextReplacer;
