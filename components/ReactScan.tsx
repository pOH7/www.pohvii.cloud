"use client";

// react-scan must be imported before react
import { scan } from "react-scan";
import { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    scan({
      // Enable/disable scanning (recommended for dev only)
      enabled: process.env.NODE_ENV === "development",

      // Show the toolbar
      showToolbar: true,

      // Animation speed: "slow" | "fast" | "off"
      animationSpeed: "fast",

      // Log renders to console (adds overhead)
      log: false,

      // Track unnecessary renders (gray outlines)
      trackUnnecessaryRenders: false,

      // Callbacks (optional)
      // onRender: (fiber, renders) => {
      //   // Custom logic when component renders
      //   console.log('Component rendered:', fiber, renders);
      // },
    });
  }, []);

  return null;
}
