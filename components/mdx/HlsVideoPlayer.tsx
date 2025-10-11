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

      player = new Plyr(video, {
        iconUrl: "/plyr.svg",
        controls: controls ? plyrControls : [],
        autoplay: Boolean(autoPlay),
        muted: Boolean(muted),
        fullscreen: {
          enabled: true,
          fallback: true,
          // Disable iosNative to prevent conflicts with playsinline
          iosNative: false,
        },
      });

      // iOS: Custom fullscreen handler using video.js approach
      if (deviceIsIOS) {
        player.on("ready", () => {
          fullscreenButton = document.querySelector(
            '[data-plyr="fullscreen"]'
          ) as HTMLElement | null;

          if (fullscreenButton) {
            const handleFullscreenClick = (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();

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
                  videoWithWebkit.webkitEnterFullscreen!();
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
        preload="metadata"
        {...rest}
      >
        {children}
        <p>Your browser does not support embedded videos.</p>
      </video>
    </div>
  );
}

export default HlsVideoPlayer;
