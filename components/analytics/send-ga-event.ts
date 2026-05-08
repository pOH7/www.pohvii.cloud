type DataLayerEvent = {
  event: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function sendGAEvent(event: DataLayerEvent): void;
export function sendGAEvent(command: string, ...args: unknown[]): void;
export function sendGAEvent(
  first: DataLayerEvent | string,
  ...args: unknown[]
) {
  if (typeof window === "undefined") return;

  window.dataLayer ??= [];

  if (typeof first === "string") {
    if (window.gtag) {
      window.gtag(first, ...args);
      return;
    }

    window.dataLayer.push([first, ...args]);
    return;
  }

  window.dataLayer.push(first);
}
