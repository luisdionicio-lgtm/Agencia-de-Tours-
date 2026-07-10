import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const localNextBin = process.platform === "win32"
  ? join(process.cwd(), "node_modules", ".bin", "next.cmd")
  : join(process.cwd(), "node_modules", ".bin", "next");
const rootNextBin = process.platform === "win32"
  ? join(process.cwd(), "..", "node_modules", ".bin", "next.cmd")
  : join(process.cwd(), "..", "node_modules", ".bin", "next");

if (!existsSync(localNextBin) && !existsSync(rootNextBin)) {
  console.log("Next.js dependencies were not found. Running npm install before build...");
  execSync("npm install", { stdio: "inherit" });
}
