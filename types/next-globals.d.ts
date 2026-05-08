import type { ReactNode } from "react";

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
    children: ReactNode;
    params: Promise<RouteParams<Path>>;
  };
}

export {};
