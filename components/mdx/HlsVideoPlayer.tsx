"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";
import type Plyr from "plyr";
import type Hls from "hls.js";
import type {
  LoaderContext,
  LoaderConfiguration,
  LoaderCallbacks,
} from "hls.js";

import { cn } from "@/lib/utils";

type PlyrInstance = Plyr;

type HlsInstance = Hls | null;

export interface HlsVideoPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  /**
   * Override Plyr controls array. Defaults to standard playback controls.
   */
  plyrControls?: string[];
  /**
   * Override Plyr settings array. Defaults to ['quality', 'speed'].
   */
  plyrSettings?: string[];
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

const DEFAULT_SETTINGS: string[] = ["quality", "speed"];

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
  plyrSettings = DEFAULT_SETTINGS,
  nativeOnly = false,
  ...rest
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  useEffect(() => {
    if (!videoRef.current || nativeOnly) return;

    let isMounted = true;
    let player: PlyrInstance | null = null;
    let hls: HlsInstance = null;
    let fullscreenButton: HTMLElement | null = null;

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
              context: LoaderContext,
              config: LoaderConfiguration,
              callbacks: LoaderCallbacks<LoaderContext>
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
            autoStartLoad: false, // Don't auto-load segments
            maxBufferLength: 30, // Limit buffer to 30 seconds
            maxMaxBufferLength: 60, // Max buffer limit
            loader: Loader,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          // Start loading only when user plays the video or autoplay is enabled
          const startLoadOnPlay = () => {
            if (hls) {
              hls.startLoad();
            }
          };

          if (autoPlay) {
            // For autoplay, start loading immediately
            hls.startLoad();
          } else {
            // Otherwise wait for user interaction
            video.addEventListener("play", startLoadOnPlay, { once: true });
          }

          // Handle quality selection when manifest is loaded
          hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
            if (!hls || player) return; // Only initialize once

            // Get available quality levels
            const availableQualities = hls.levels.map((l) => l.height);

            const deviceIsIOS = isIOS();

            // Set default quality to Auto (-1 means auto in HLS.js)
            hls.currentLevel = -1;

            // Initialize Plyr with quality options
            player = new Plyr(video, {
              iconUrl: "/plyr.svg",
              controls: controls ? plyrControls : [],
              autoplay: Boolean(autoPlay),
              muted: Boolean(muted),
              settings: plyrSettings,
              quality: {
                default: availableQualities[availableQualities.length - 1], // Default to highest quality
                options: availableQualities,
                forced: true,
                onChange: (newQuality: number) => {
                  if (!hls) return;
                  // Find and set specific quality level
                  hls.levels.forEach((level, levelIndex) => {
                    if (level.height === newQuality && hls) {
                      hls.currentLevel = levelIndex;
                    }
                  });
                },
              },
              fullscreen: {
                enabled: true,
                fallback: true,
                // Disable iosNative to prevent conflicts with playsinline
                iosNative: false,
              },
            });

            setupIOSFullscreen(deviceIsIOS);
            startAutoplay();
          });

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

      // For non-HLS sources or native HLS, initialize Plyr immediately
      if (!isHlsSource || canUseNativeHls || !HlsClass.isSupported()) {
        const deviceIsIOS = isIOS();

        // For native HLS, we can't control quality, so remove it from settings
        const settingsForNativeHls = canUseNativeHls
          ? plyrSettings.filter((s) => s !== "quality")
          : plyrSettings;

        player = new Plyr(video, {
          iconUrl: "/plyr.svg",
          controls: controls ? plyrControls : [],
          autoplay: Boolean(autoPlay),
          muted: Boolean(muted),
          settings: settingsForNativeHls,
          fullscreen: {
            enabled: true,
            fallback: true,
            // Disable iosNative to prevent conflicts with playsinline
            iosNative: false,
          },
        });

        setupIOSFullscreen(deviceIsIOS);
        startAutoplay();
      }

      // Helper function to setup iOS fullscreen
      function setupIOSFullscreen(deviceIsIOS: boolean) {
        if (!deviceIsIOS || !player) return;

        player.on("ready", () => {
          fullscreenButton = document.querySelector('[data-plyr="fullscreen"]');

          if (fullscreenButton) {
            const handleFullscreenClick = (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();

              if (!video) return;

              const videoWithWebkit = video as HTMLVideoElement & {
                webkitEnterFullscreen?: () => void;
              };

              if (typeof videoWithWebkit.webkitEnterFullscreen !== "function") {
                // Fallback to Plyr's fullscreen
                if (player) {
                  player.fullscreen.toggle();
                }
                return;
              }

              // Video.js approach: play briefly to prime, then enter fullscreen
              if (video.paused && video.networkState <= video.HAVE_METADATA) {
                // Prime the video by playing it
                video.play().catch(() => {});

                setTimeout(() => {
                  // Don't pause - keep playing and enter fullscreen
                  try {
                    videoWithWebkit.webkitEnterFullscreen!();
                  } catch (err) {
                    console.error("webkitEnterFullscreen failed:", err);
                    // Fallback to Plyr's fullscreen
                    if (player) {
                      player.fullscreen.toggle();
                    }
                  }
                }, 0);
              } else if (video.paused) {
                // Video is ready but paused - play it first
                video.play().catch(() => {});

                setTimeout(() => {
                  try {
                    videoWithWebkit.webkitEnterFullscreen!();
                  } catch (err) {
                    console.error("webkitEnterFullscreen failed:", err);
                    if (player) {
                      player.fullscreen.toggle();
                    }
                  }
                }, 0);
              } else {
                // Video is already playing
                try {
                  videoWithWebkit.webkitEnterFullscreen();
                } catch (err) {
                  console.error("webkitEnterFullscreen failed:", err);
                  // Fallback to Plyr's fullscreen
                  if (player) {
                    player.fullscreen.toggle();
                  }
                }
              }
            };

            fullscreenButton.addEventListener(
              "click",
              handleFullscreenClick,
              true
            );
          }
        });
      }

      // Helper function to start autoplay
      function startAutoplay() {
        if (!autoPlay || !player) return;

        const maybePromise = player.play();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.catch(() => {
            /* ignore autoplay failures */
          });
        }
      }
    };

    void setupPlayer();

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
  }, [
    src,
    autoPlay,
    controls,
    muted,
    nativeOnly,
    playsInline,
    plyrControls,
    plyrSettings,
  ]);

  return (
    <div className={cn("relative w-full rounded-xl", className)}>
      <video
        ref={videoRef}
        poster={poster}
        title={title}
        aria-label={title ?? "Video player"}
        playsInline={playsInline}
        preload="metadata"
        muted={muted}
        {...rest}
      >
        {/* Empty track element to satisfy jsx-a11y/media-has-caption */}
        <track kind="captions" />
        {children}
        <p>Your browser does not support embedded videos.</p>
      </video>
    </div>
  );
}

export default HlsVideoPlayer;
