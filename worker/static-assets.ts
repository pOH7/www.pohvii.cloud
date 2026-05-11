type AssetFetcher = {
  fetch(request: Request): Promise<Response> | Response;
};

type Env = {
  ASSETS: AssetFetcher;
};

export default {
  fetch(request: Request, env: Env): Promise<Response> | Response {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      url.pathname = "/en/";
      return Response.redirect(url.toString(), 307);
    }

    return env.ASSETS.fetch(request);
  },
};
