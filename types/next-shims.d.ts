import type React from "react";

type RouteSegmentParam<Segment extends string> =
  Segment extends `[...${infer Param}]`
    ? { [Key in Param]: string[] }
    : Segment extends `[[...${infer Param}]]`
      ? { [Key in Param]?: string[] }
      : Segment extends `[${infer Param}]`
        ? { [Key in Param]: string }
        : object;

type RouteParams<Path extends string> = string extends Path
  ? Record<string, string | string[]>
  : Path extends `${infer Head}/${infer Tail}`
    ? RouteSegmentParam<Head> & RouteParams<Tail>
    : RouteSegmentParam<Path>;

type PageSearchParams = Record<string, string | string[] | undefined>;

declare global {
  type PageProps<Path extends string = string> = {
    params: Promise<RouteParams<Path>>;
    searchParams: Promise<PageSearchParams>;
  };

  type LayoutProps<Path extends string = string> = {
    children: React.ReactNode;
    params: Promise<RouteParams<Path>>;
  };
}

declare module "next" {
  export type { Metadata, Viewport } from "vinext/shims/metadata";
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

export {};
