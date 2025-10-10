"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PlyrInstance = import("plyr").default;

type HlsInstance = import("hls.js").default | null;

export interface HlsVideoPlayerProps
  extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  /**
   * Override Plyr controls array. Defaults to standard playback controls.
   */
  plyrControls?: string[];
  /**
   * When true, skip setting up Plyr and render a bare video element.
   */
  nativeOnly?: boolean;
}

const DEFAULT_CONTROLS: string[] = [
  "play-large",
  "play",
  "progress",
  "current-time",
  "mute",
  "volume",
  "captions",
  "settings",
  "pip",
  "airplay",
  "fullscreen",
];

/**
 * Minimal Plyr + Hls.js integration inspired by a production marketing site.
 * The component dynamically loads both libraries on the client, hands off to
 * native HLS when available (Safari), and falls back to Hls.js everywhere else.
 */
export function HlsVideoPlayer({
  src,
  className,
  autoPlay,
  muted,
  poster,
  playsInline = true,
  controls = true,
  title,
  children,
  plyrControls = DEFAULT_CONTROLS,
  nativeOnly = false,
  ...rest
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // iOS detection utility
  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  // Safari detection utility
  const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  };

  useEffect(() => {
    if (!videoRef.current || nativeOnly) return;

    let isMounted = true;
    let player: PlyrInstance | null = null;
    let hls: HlsInstance = null;

    const setupPlayer = async () => {
      const video = videoRef.current;

      if (!video) return;

      video.muted = Boolean(muted);
      video.playsInline = playsInline;
      video.controls = controls;

      const [{ default: Plyr }, { default: HlsClass }] = await Promise.all([
        import("plyr"),
        import("hls.js"),
      ]);

      if (!isMounted || !videoRef.current) return;

      const isHlsSource = /\.m3u8($|\?)/.test(src);
      const canUseNativeHls = video.canPlayType(
        "application/vnd.apple.mpegurl"
      );

      if (isHlsSource) {
        if (canUseNativeHls) {
          video.src = src;
        } else if (HlsClass.isSupported()) {
          const Loader = class extends HlsClass.DefaultConfig.loader {
            resolveURL(url: string, baseUrl: string) {
              if (/^https?:/i.test(url)) {
                return new URL(url).href;
              }

              const base = new URL(baseUrl);
              const resolved = new URL(url, base);
              return resolved.href;
            }

            load(
              context: import("hls.js").LoaderContext,
              config: import("hls.js").LoaderConfiguration,
              callbacks: import("hls.js").LoaderCallbacks<
                import("hls.js").LoaderContext
              >
            ) {
              if (context.url && "baseurl" in context && context.baseurl) {
                context.url = this.resolveURL(
                  context.url,
                  context.baseurl as string
                );
              }

              return super.load(context, config, callbacks);
            }
          };

          hls = new HlsClass({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            loader: Loader,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(HlsClass.Events.ERROR, (_event, data) => {
            if (!hls) return;

            if (data.fatal) {
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  hls = null;
                  break;
              }
            }
          });
        } else {
          // Basic fallback: hand source to the element and let the browser try.
          video.src = src;
        }
      } else {
        video.src = src;
      }

      const deviceIsIOS = isIOS();
      const deviceIsSafari = isSafari();

      player = new Plyr(video, {
        iconUrl: "/plyr.svg",
        controls: controls ? plyrControls : [],
        autoplay: Boolean(autoPlay),
        muted: Boolean(muted),
        // iOS-specific configuration
        fullscreen: {
          enabled: true,
          fallback: true,
          iosNative: deviceIsIOS && !deviceIsSafari, // Only use iosNative on iOS non-Safari browsers
        },
      });

      // Custom fullscreen handling for iOS Safari
      if (deviceIsIOS && deviceIsSafari) {
        const handleFullscreenRequest = () => {
          // Ensure video is playing before attempting fullscreen
          if (player && video) {
            // Check if video is paused and try to play first
            if (video.paused && !player.playing) {
              video
                .play()
                .then(() => {
                  // After video starts playing, attempt fullscreen
                  attemptIOSFullscreen(video);
                })
                .catch(() => {
                  // If play fails, still try fullscreen
                  attemptIOSFullscreen(video);
                });
            } else {
              attemptIOSFullscreen(video);
            }
          }
        };

        // Function to attempt various fullscreen methods on iOS
        const attemptIOSFullscreen = (videoElement: HTMLVideoElement) => {
          const videoWithWebkit = videoElement as HTMLVideoElement & {
            webkitEnterFullscreen?: () => void;
            webkitRequestFullscreen?: () => void;
          };

          // Method 1: Try webkitEnterFullscreen (iOS Safari specific)
          if (videoWithWebkit.webkitEnterFullscreen) {
            try {
              videoWithWebkit.webkitEnterFullscreen();
              return;
            } catch (error) {
              console.warn("webkitEnterFullscreen failed:", error);
            }
          }

          // Method 2: Try standard requestFullscreen
          if (videoElement.requestFullscreen) {
            try {
              videoElement.requestFullscreen();
              return;
            } catch (error) {
              console.warn("requestFullscreen failed:", error);
            }
          }

          // Method 3: Try webkit prefixed version
          if (videoWithWebkit.webkitRequestFullscreen) {
            try {
              videoWithWebkit.webkitRequestFullscreen();
              return;
            } catch (error) {
              console.warn("webkitRequestFullscreen failed:", error);
            }
          }

          console.warn("No fullscreen method available on this iOS device");
        };

        // Override Plyr's fullscreen behavior for iOS Safari
        player.on("enterfullscreen", handleFullscreenRequest);

        // Also listen for clicks on the fullscreen button directly
        const fullscreenButton = video.parentElement?.querySelector(
          '[data-plyr="fullscreen"]'
        );
        if (fullscreenButton) {
          fullscreenButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFullscreenRequest();
          });
        }
      }

      if (autoPlay) {
        const maybePromise = player.play();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.catch(() => {
            /* ignore autoplay failures */
          });
        }
      }
    };

    setupPlayer();

    return () => {
      isMounted = false;
      if (player) {
        player.destroy();
      }
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [src, autoPlay, controls, muted, nativeOnly, playsInline, plyrControls]);

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-xl", className)}
    >
      <video
        ref={videoRef}
        poster={poster}
        title={title}
        aria-label={title ?? "Video player"}
        playsInline={playsInline}
        {...rest}
      >
        {children}
        <p>Your browser does not support embedded videos.</p>
      </video>
    </div>
  );
}

export default HlsVideoPlayer;
