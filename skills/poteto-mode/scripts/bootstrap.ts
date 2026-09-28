import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const scriptsDirectory = import.meta.dirname;
const nodeModulesDirectory = join(scriptsDirectory, "node_modules");
const commanderPackagePath = join(
  nodeModulesDirectory,
  "commander",
  "package.json"
);
const installKeyPath = join(
  nodeModulesDirectory,
  ".poteto-mode-tools-install-key"
);

function currentInstallKey(): string {
  return createHash("sha256")
    .update(readFileSync(join(scriptsDirectory, "package.json")))
    .update("\0")
    .update(readFileSync(join(scriptsDirectory, "pnpm-lock.yaml")))
    .digest("hex");
}

export function ensureDependenciesInstalled(): void {
  const installKey = currentInstallKey();
  if (
    existsSync(commanderPackagePath) &&
    existsSync(installKeyPath) &&
    readFileSync(installKeyPath, "utf8").trim() === installKey
  ) {
    return;
  }

  const result = spawnSync(
    "pnpm",
    ["install", "--frozen-lockfile"],
    { cwd: scriptsDirectory }
  );
  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(
      `pnpm install --frozen-lockfile exited with status ${result.status}`
    );
  }
  if (!existsSync(commanderPackagePath)) {
    throw new Error(
      "pnpm install --frozen-lockfile completed without installing commander"
    );
  }

  writeFileSync(installKeyPath, `${installKey}\n`);

  const restarted = spawnSync(
    process.execPath,
    [...process.execArgv, ...process.argv.slice(1)],
    { cwd: process.cwd(), env: process.env, stdio: "inherit" }
  );
  process.exit(restarted.status ?? 1);
}
