import handler from "vinext/server/app-router-entry";
import { handleImageOptimization } from "vinext/server/image-optimization";

type ExecutionContextLike = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
};

type AssetFetcher = {
  fetch(request: Request): Promise<Response> | Response;
};

type ImageOutputFormat =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "image/avif"
  | "rgb"
  | "rgba";

type ImagesBinding = {
  input(stream: ReadableStream): {
    transform(options: { width?: number }): {
      output(options: {
        format: ImageOutputFormat;
        quality: number;
      }): Promise<{ response(): Response }>;
    };
  };
};

type Env = {
  ASSETS: AssetFetcher;
  IMAGES: ImagesBinding;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContextLike
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      return handleImageOptimization(request, {
        fetchAsset: async (path, sourceRequest) =>
          env.ASSETS.fetch(new Request(new URL(path, sourceRequest.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body)
            .transform(width > 0 ? { width } : {})
            .output({
              format: format as ImageOutputFormat,
              quality,
            });

          return result.response();
        },
      });
    }

    return handler.fetch(request, env, ctx);
  },
};
