import fs from "node:fs";
import path from "node:path";

const redirectConfigPath = path.join(
  process.cwd(),
  ".wrangler",
  "deploy",
  "config.json"
);

fs.rmSync(redirectConfigPath, { force: true });
