declare module "next" {
  import type {
    Metadata as VinextMetadata,
    Viewport,
  } from "vinext/shims/metadata";

  export type Metadata = Omit<VinextMetadata, "openGraph"> & {
    openGraph?: NonNullable<VinextMetadata["openGraph"]> & {
      section?: string;
      tags?: string[];
    };
  };
  export type { Viewport };
  export type { NextConfig } from "vinext";

  export namespace MetadataRoute {
    type Sitemap = Array<{
      url: string;
      lastModified?: string | Date;
      changeFrequency?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
      priority?: number;
      alternates?: {
        languages?: Record<string, string>;
      };
    }>;

    type Robots = {
      rules:
        | {
            userAgent?: string | string[];
            allow?: string | string[];
            disallow?: string | string[];
            crawlDelay?: number;
          }
        | Array<{
            userAgent?: string | string[];
            allow?: string | string[];
            disallow?: string | string[];
            crawlDelay?: number;
          }>;
      sitemap?: string | string[];
      host?: string;
    };
  }
}

declare module "next/cache" {
  export * from "vinext/shims/cache";
}

declare module "next/dynamic" {
  export { default } from "vinext/shims/dynamic";
}

declare module "next/font/google" {
  import type { FontOptions, FontResult } from "vinext/shims/font-google-base";

  export function IBM_Plex_Mono(options?: FontOptions): FontResult;
  export function IBM_Plex_Sans(options?: FontOptions): FontResult;
}

declare module "next/headers" {
  export * from "vinext/shims/headers";
}

declare module "next/image" {
  import Image from "vinext/shims/image";

  export type ImageLoaderProps = {
    src: string;
    width: number;
    quality?: number;
  };

  export type ImageProps = React.ComponentProps<typeof Image>;
  export { getImageProps } from "vinext/shims/image";
  export default Image;
}

declare module "next/link" {
  export { default, useLinkStatus } from "vinext/shims/link";
}

declare module "next/navigation" {
  export * from "vinext/shims/navigation";
}

declare module "next/script" {
  export { default } from "vinext/shims/script";
  export type { ScriptProps } from "vinext/shims/script";
}

declare module "next/server" {
  export * from "vinext/shims/server";
}
