import handler from "vinext/server/app-router-entry";

type ExecutionContextLike = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
};

type AssetFetcher = {
  fetch(request: Request): Promise<Response> | Response;
};

type Env = {
  ASSETS: AssetFetcher;
};

export default {
  fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContextLike
  ): Promise<Response> | Response {
    return handler.fetch(request, env, ctx);
  },
};
