"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useEffect } from "react";
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

export function WebVitals() {
  useEffect(() => {
    // Function to send metrics to Google Analytics
    function sendToGA(metric: Metric) {
      sendGAEvent({
        event: "web_vital",
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value
        ),
        event_category: "Web Vitals",
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Track Core Web Vitals
    onCLS(sendToGA);
    onINP(sendToGA);
    onLCP(sendToGA);
    onFCP(sendToGA);
    onTTFB(sendToGA);
  }, []);

  return null;
}
