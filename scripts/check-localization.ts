import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface ZdpLocalizationCliEnvelope {
  readonly format: "zdp.localization.cli-result@1";
  readonly command: string;
  readonly status: "ok" | "error";
  readonly message: string;
  readonly details?: ZdpLocalizationCliDetails;
}

type ZdpLocalizationCliDetails =
  | ZdpLocalizationCheckDetails
  | ZdpLocalizationCompileDetails
  | ZdpLocalizationErrorDetails;

interface ZdpLocalizationCheckDetails {
  readonly kind: "check";
  readonly messageCount: number;
  readonly scopeCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
}

interface ZdpLocalizationCompileDetails {
  readonly kind: "compile";
  readonly chunkCount: number;
  readonly fallbackCount: number;
  readonly manifestFile: string;
  readonly manifest?: {
    readonly totals?: {
      readonly fallbackCount?: unknown;
    };
  };
}

interface ZdpLocalizationErrorDetails {
  readonly kind: "error";
  readonly error: string;
}

interface ZdpLocalizationRunResult {
  readonly envelope: ZdpLocalizationCliEnvelope;
  readonly stderr: string;
}

const cliPath =
  "../../platform/zdp-platform-localization/packages/cli/src/index.ts";
const configPath = "localization.config.ts";

const checkResult = await runZdpLocalizationCli(["check"]);

if (checkResult.envelope.status !== "ok") {
  failWithCliResult("ZDP localization check failed.", checkResult);
}

const checkDetails = requireDetails(checkResult.envelope, "check");

if (checkDetails.errorCount !== 0) {
  fail(`ZDP localization check reported ${checkDetails.errorCount} error(s).`);
}

if (checkDetails.warningCount !== 0) {
  fail(
    `ZDP localization check reported ${checkDetails.warningCount} warning(s).`
  );
}

const tempRoot = await mkdtemp(join(tmpdir(), "zdp-web-public-localization-"));

try {
  const compileResult = await runZdpLocalizationCli([
    "compile",
    "--out-dir",
    join(tempRoot, "chunks"),
    "--types-out",
    join(tempRoot, "types/index.d.ts"),
    "--strict-missing"
  ]);

  if (compileResult.envelope.status !== "ok") {
    failWithCliResult(
      "ZDP production localization compile failed.",
      compileResult
    );
  }

  const compileDetails = requireDetails(compileResult.envelope, "compile");
  const manifestFallbackCount =
    typeof compileDetails.manifest?.totals?.fallbackCount === "number"
      ? compileDetails.manifest.totals.fallbackCount
      : undefined;

  if (compileDetails.fallbackCount !== 0) {
    fail(
      `ZDP production localization compile used ${compileDetails.fallbackCount} fallback message(s).`
    );
  }

  if (manifestFallbackCount === undefined) {
    fail("ZDP production manifest did not report totals.fallbackCount.");
  }

  if (manifestFallbackCount !== 0) {
    fail(
      `ZDP production manifest recorded ${String(
        manifestFallbackCount
      )} fallback message(s).`
    );
  }

  console.log(
    [
      `ZDP localization check passed for ${checkDetails.messageCount} messages across ${checkDetails.scopeCount} scope(s).`,
      `${compileDetails.chunkCount} production chunk(s), 0 fallback messages.`
    ].join(" ")
  );
} finally {
  await rm(tempRoot, {
    force: true,
    recursive: true
  });
}

async function runZdpLocalizationCli(
  args: string[]
): Promise<ZdpLocalizationRunResult> {
  const result = await runBufferedCommand([
    "bun",
    cliPath,
    ...args,
    "--json",
    "--config",
    configPath
  ]);

  if (result.exitCode !== 0 && result.stdout.trim().length === 0) {
    fail(
      [
        `ZDP localization CLI exited with ${result.exitCode} before producing JSON.`,
        result.stderr.trim()
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  return {
    envelope: parseZdpLocalizationEnvelope(result.stdout),
    stderr: result.stderr
  };
}

async function runBufferedCommand(command: readonly string[]): Promise<{
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
}> {
  return await new Promise((resolveCommand, reject) => {
    const child = spawn(command[0] ?? "", command.slice(1), {
      shell: false
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolveCommand({
        exitCode: exitCode ?? 1,
        stderr,
        stdout
      });
    });
  });
}

function parseZdpLocalizationEnvelope(
  stdout: string
): ZdpLocalizationCliEnvelope {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stdout);
  } catch {
    fail(`ZDP localization CLI did not produce valid JSON:\n${stdout}`);
  }

  if (!isRecord(parsed)) {
    fail("ZDP localization CLI JSON output must be an object.");
  }

  if (parsed.format !== "zdp.localization.cli-result@1") {
    fail(
      `Unexpected ZDP localization CLI JSON format: ${String(parsed.format)}`
    );
  }

  if (typeof parsed.command !== "string") {
    fail("ZDP localization CLI JSON output is missing command.");
  }

  if (parsed.status !== "ok" && parsed.status !== "error") {
    fail(`Unexpected ZDP localization CLI status: ${String(parsed.status)}`);
  }

  if (typeof parsed.message !== "string") {
    fail("ZDP localization CLI JSON output is missing message.");
  }

  return {
    format: parsed.format,
    command: parsed.command,
    status: parsed.status,
    message: parsed.message,
    details: normalizeDetails(parsed.details)
  };
}

function normalizeDetails(
  value: unknown
): ZdpLocalizationCliDetails | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value) || typeof value.kind !== "string") {
    fail("ZDP localization CLI details must be an object with a kind.");
  }

  if (value.kind === "check") {
    return {
      kind: "check",
      messageCount: requireNumber(value, "messageCount"),
      scopeCount: requireNumber(value, "scopeCount"),
      errorCount: requireNumber(value, "errorCount"),
      warningCount: requireNumber(value, "warningCount")
    };
  }

  if (value.kind === "compile") {
    return {
      kind: "compile",
      chunkCount: requireNumber(value, "chunkCount"),
      fallbackCount: requireNumber(value, "fallbackCount"),
      manifestFile: requireString(value, "manifestFile"),
      manifest: isRecord(value.manifest)
        ? {
            totals: isRecord(value.manifest.totals)
              ? {
                  fallbackCount: value.manifest.totals.fallbackCount
                }
              : undefined
          }
        : undefined
    };
  }

  if (value.kind === "error") {
    return {
      kind: "error",
      error: requireString(value, "error")
    };
  }

  fail(`Unsupported ZDP localization CLI details kind: ${value.kind}`);
}

function requireDetails<TKind extends ZdpLocalizationCliDetails["kind"]>(
  envelope: ZdpLocalizationCliEnvelope,
  kind: TKind
): Extract<ZdpLocalizationCliDetails, { kind: TKind }> {
  if (!envelope.details || envelope.details.kind !== kind) {
    fail(
      `Expected ZDP localization CLI '${envelope.command}' details kind '${kind}', got '${envelope.details?.kind ?? "none"}'.`
    );
  }

  return envelope.details as Extract<
    ZdpLocalizationCliDetails,
    { kind: TKind }
  >;
}

function requireNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];

  if (typeof value !== "number") {
    fail(`ZDP localization CLI details field '${key}' must be a number.`);
  }

  return value;
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== "string") {
    fail(`ZDP localization CLI details field '${key}' must be a string.`);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function failWithCliResult(
  message: string,
  result: ZdpLocalizationRunResult
): never {
  fail(
    [
      message,
      result.envelope.message,
      result.stderr.trim().length > 0 ? result.stderr.trim() : ""
    ]
      .filter(Boolean)
      .join("\n")
  );
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
