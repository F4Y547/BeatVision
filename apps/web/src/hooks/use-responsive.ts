"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

export interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  isTouch: boolean;
}

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    breakpoint: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
    height: 768,
    orientation: "landscape",
    isTouch: false,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = "ontouchstart" in window;

      let breakpoint: Breakpoint = "desktop";
      if (width < BREAKPOINTS.tablet) breakpoint = "mobile";
      else if (width < BREAKPOINTS.desktop) breakpoint = "tablet";
      else if (width >= BREAKPOINTS.wide) breakpoint = "wide";

      setState({
        breakpoint,
        isMobile: breakpoint === "mobile",
        isTablet: breakpoint === "tablet",
        isDesktop: breakpoint === "desktop" || breakpoint === "wide",
        width,
        height,
        orientation: width > height ? "landscape" : "portrait",
        isTouch,
      });
    };

    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, []);

  return state;
}

// Hook for detecting if running as PWA
export function useIsPwa(): boolean {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsPwa(isStandalone);
  }, []);

  return isPwa;
}

// Hook for safe area insets (notch devices)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue("--sat") || "0"),
        right: parseInt(style.getPropertyValue("--sar") || "0"),
        bottom: parseInt(style.getPropertyValue("--sab") || "0"),
        left: parseInt(style.getPropertyValue("--sal") || "0"),
      });
    };

    updateSafeArea();
    window.addEventListener("resize", updateSafeArea);
    return () => window.removeEventListener("resize", updateSafeArea);
  }, []);

  return safeArea;
}
