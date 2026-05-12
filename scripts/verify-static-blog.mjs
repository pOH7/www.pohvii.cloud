import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import matter from "gray-matter";

const root = process.cwd();
const maxFreeWorkerGzipKiB = 3 * 1024;
const staticBundleDir = "bundled-static";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePostId(value) {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return "";
}

function toValidDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(0);
}

function getEnglishCodePostFixture() {
  const dir = path.join(root, "content", "blog", "en");

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      if (!raw.includes("```")) return [];

      const fallbackSlug = file.replace(/\.(mdx?|MDX?)$/, "");
      const { data } = matter(raw);
      const title = data.title?.trim() || fallbackSlug;
      const id = normalizePostId(data.id);
      const slug = id ? `${generateSlug(title)}-${id}` : generateSlug(title);

      return [
        {
          title,
          slug,
          date: toValidDate(data.lastModified ?? data.date),
        },
      ];
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
}

function walk(dir, predicate, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".agents" ||
      entry.name === ".next" ||
      entry.name === ".wrangler" ||
      entry.name === ".idea" ||
      entry.name === "dist" ||
      entry.name === "bundled" ||
      entry.name === "skills-lock.json" ||
      entry.name === "playwright-report" ||
      entry.name === "test-results" ||
      entry.name.startsWith("bundled-static")
    ) {
      continue;
    }

    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, predicate, acc);
      continue;
    }

    if (predicate(absolutePath)) acc.push(absolutePath);
  }

  return acc;
}

function sourceFiles() {
  return walk(root, (filePath) =>
    /\.(ts|tsx|js|jsx|mjs|cjs|json|yml|yaml)$/.test(filePath)
  ).filter((filePath) => !filePath.endsWith("scripts/verify-static-blog.mjs"));
}

function assertNoAuthOrApiSurface() {
  assert(!exists("app/api"), "app/api must be removed for the static blog");
  assert(
    !exists("lib/auth.ts") &&
      !exists("lib/auth-client.ts") &&
      !exists("lib/auth-server.ts"),
    "auth libraries must be removed"
  );
  assert(
    !exists("components/auth"),
    "auth UI components must be removed from the static blog"
  );

  const packageJson = readJson("package.json");
  assert(
    !packageJson.dependencies?.["better-auth"] &&
      !packageJson.devDependencies?.["better-auth"],
    "better-auth must be removed from package.json"
  );

  const forbiddenPatterns = [
    "better-auth",
    "/api/auth",
    "api/auth",
    "BETTER_AUTH",
    "AUTH_GITHUB",
    "@/lib/auth",
    "@/lib/auth-client",
    "@/lib/auth-server",
    "AuthButton",
  ];

  const offenders = [];
  for (const filePath of sourceFiles()) {
    const text = fs.readFileSync(filePath, "utf8");
    for (const pattern of forbiddenPatterns) {
      if (text.includes(pattern)) {
        offenders.push(`${path.relative(root, filePath)} contains ${pattern}`);
      }
    }
  }

  assert(
    offenders.length === 0,
    `auth/API references remain:\n${offenders.join("\n")}`
  );
}

function assertNoAppRouteHandlers() {
  const routeHandlers = walk(path.join(root, "app"), (filePath) =>
    /\/route\.(ts|tsx|js|jsx)$/.test(filePath)
  );

  assert(
    routeHandlers.length === 0,
    `App route handlers must be replaced by static assets:\n${routeHandlers
      .map((filePath) => path.relative(root, filePath))
      .join("\n")}`
  );
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  if (result.status !== 0) {
    console.error(output);
    throw new Error(`${command} ${args.join(" ")} failed`);
  }

  return output;
}

function assertBuildProducesStaticAssets() {
  const buildOutput = run("pnpm", ["run", "build"]);
  const englishBlogIndex = "dist/client/en/blog/index.html";
  const englishBlogRsc = "dist/client/en/blog.rsc";

  assert(
    buildOutput.includes("Pre-rendering all routes (output: 'export')"),
    "vinext build must run static export prerendering"
  );
  assert(
    !buildOutput.includes("λ /api/"),
    "build output must not contain API routes"
  );
  assert(
    exists("dist/client/en/index.html") &&
      exists("dist/client/en/blog/index.html") &&
      exists("dist/client/rss.xml") &&
      exists("dist/client/sitemap.xml") &&
      exists("dist/client/robots.txt"),
    "static export must emit HTML and metadata assets into dist/client"
  );

  const expectedArticleCount = fs
    .readdirSync(path.join(root, "content", "blog", "en"))
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md")).length;
  const expectedVisibleArticles = Math.min(expectedArticleCount, 10);
  const blogHtml = readText(englishBlogIndex);
  const blogRsc = readText(englishBlogRsc);
  const renderedArticleCount = (blogHtml.match(/<article data-index=/g) ?? [])
    .length;

  assert(
    renderedArticleCount === expectedVisibleArticles,
    `English blog index must render ${expectedVisibleArticles} visible article cards; got ${renderedArticleCount}`
  );
  assert(
    blogHtml.includes(
      `Showing 1-${expectedVisibleArticles} of ${expectedArticleCount} articles`
    ),
    "English blog index must render the article count summary"
  );
  assert(
    blogRsc.includes(
      `Showing 1-${expectedVisibleArticles} of ${expectedArticleCount} articles`
    ),
    "English blog RSC payload must include blog article data"
  );

  const htmlFilesWithImageOptimizerUrls = walk(
    path.join(root, "dist", "client"),
    (filePath) =>
      filePath.endsWith(".html") &&
      fs.readFileSync(filePath, "utf8").includes("/_vinext/image")
  ).map((filePath) => path.relative(root, filePath));

  assert(
    htmlFilesWithImageOptimizerUrls.length === 0,
    `static export must not emit vinext image optimizer URLs because the static worker cannot serve them:\n${htmlFilesWithImageOptimizerUrls.join(
      "\n"
    )}`
  );

  const codePost = getEnglishCodePostFixture();
  if (!codePost) {
    fail("English content must include a code-block article fixture");
    return;
  }

  const detailHtmlPath = `dist/client/en/blog/${codePost.slug}/index.html`;
  assert(exists(detailHtmlPath), "static export must emit a blog detail page");

  const detailHtml = readText(detailHtmlPath);
  assert(
    detailHtml.includes(codePost.title),
    "English blog detail page must render the article title"
  );
  assert(
    detailHtml.includes("data-mdx-code-block"),
    "English blog detail page must render compiled MDX code blocks"
  );
  assert(
    !detailHtml.includes("WebAssembly.instantiate") &&
      !detailHtml.includes("Code generation from strings"),
    "English blog detail page must not render MDX runtime compilation errors"
  );
}

function assertWorkerDryRunFitsFreePlan() {
  fs.rmSync(path.join(root, staticBundleDir), { recursive: true, force: true });
  run("pnpm", ["run", "prepare:static-deploy"]);

  const output = run("pnpm", [
    "exec",
    "wrangler",
    "deploy",
    "--config",
    "wrangler.jsonc",
    "--env",
    "staging",
    "--dry-run",
    "--outdir",
    staticBundleDir,
  ]);

  assert(
    !output.includes("Using redirected Wrangler configuration"),
    "static deploy must not use Vinext's generated server deploy redirect"
  );

  const bundleRoot = path.join(root, staticBundleDir);
  const bundledFiles = walk(bundleRoot, () => true).map((filePath) =>
    path.relative(bundleRoot, filePath)
  );
  const workerJsFiles = bundledFiles.filter((filePath) =>
    filePath.endsWith(".js")
  );

  assert(
    workerJsFiles.length > 0,
    "wrangler dry-run must emit a Worker script"
  );
  assert(
    bundledFiles.every((filePath) => !filePath.startsWith(`ssr${path.sep}`)),
    "static deploy bundle must not include server-side ssr modules"
  );

  const workerGzipKiB =
    workerJsFiles.reduce((total, filePath) => {
      const absolutePath = path.join(bundleRoot, filePath);
      return total + zlib.gzipSync(fs.readFileSync(absolutePath)).byteLength;
    }, 0) / 1024;

  assert(
    workerGzipKiB <= maxFreeWorkerGzipKiB,
    `Worker script gzip size must fit the ${maxFreeWorkerGzipKiB} KiB free limit; got ${workerGzipKiB.toFixed(
      2
    )} KiB`
  );
}

assertNoAuthOrApiSurface();
assertNoAppRouteHandlers();

if (process.exitCode) process.exit(process.exitCode);

assertBuildProducesStaticAssets();
assertWorkerDryRunFitsFreePlan();

if (!process.exitCode) {
  process.stdout.write("Static blog verification passed.\n");
}
