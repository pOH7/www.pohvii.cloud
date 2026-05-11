import assert from "node:assert/strict";
import { test } from "node:test";

import worker from "../worker/static-assets.ts";

void test("static assets worker redirects the root path to the English homepage", async () => {
  const assetRequests: string[] = [];

  const response = await worker.fetch(new Request("https://example.test/"), {
    ASSETS: {
      fetch(request: Request) {
        assetRequests.push(new URL(request.url).pathname);
        return new Response("not found", { status: 404 });
      },
    },
  });

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://example.test/en/");
  assert.deepEqual(assetRequests, []);
});
