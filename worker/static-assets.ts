type AssetFetcher = {
  fetch(request: Request): Promise<Response> | Response;
};

type Env = {
  ASSETS: AssetFetcher;
};

export default {
  fetch(request: Request, env: Env): Promise<Response> | Response {
    return env.ASSETS.fetch(request);
  },
};
