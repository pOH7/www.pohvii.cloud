import type Lenis from "lenis";

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export interface LenisScrollEvent {
  scroll: number;
  limit: number;
  velocity: number;
  direction: number;
  progress: number;
}

export {};
