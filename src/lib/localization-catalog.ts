import { createZdpLocalizationRuntime } from "@zdp/localization-runtime";
import type { ZdpLocalizationRuntimeOptions } from "@zdp/localization-runtime";
import type {
  CatalogSnapshot,
  MessageContent,
  MessageParamType,
  MessageSchema,
} from "@zdp/localization-core";
import homeSchemaSource from "../../messages/_schema/home.json";
import homeEnSource from "../../messages/en/home.json";
import homeKoSource from "../../messages/ko/home.json";
import { defaultLocale, siteLocales } from "./site-locales";

type SourceSchemaEntry = {
  params?: Record<string, MessageParamType>;
  description?: string;
  owner?: string;
};

type SourceSchema = {
  scope: string;
  keys: Record<string, SourceSchemaEntry>;
};

type SourceMessages = Record<string, string>;

const homeSchema = readSourceSchema(homeSchemaSource);
const homeEnMessages = readSourceMessages(homeEnSource);
const homeKoMessages = readSourceMessages(homeKoSource);

export const publicLocalizationSnapshot: CatalogSnapshot = {
  defaultLocale,
  locales: [...siteLocales],
  schemas: createSchemas(homeSchema),
  contents: [
    ...createContents("en", homeSchema.scope, homeEnMessages),
    ...createContents("ko", homeSchema.scope, homeKoMessages),
  ],
};

export function createPublicLocalizationRuntime(
  options: Partial<ZdpLocalizationRuntimeOptions> = {},
) {
  return createZdpLocalizationRuntime(publicLocalizationSnapshot, {
    locale: defaultLocale,
    ...options,
  });
}

function createSchemas(source: SourceSchema): MessageSchema[] {
  return Object.entries(source.keys)
    .map(([key, entry]) => ({
      scope: source.scope,
      key,
      params: entry.params,
      description: entry.description,
      owner: entry.owner,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function createContents(
  locale: string,
  scope: string,
  messages: SourceMessages,
): MessageContent[] {
  return Object.entries(messages)
    .map(([key, message]) => ({
      locale,
      scope,
      key,
      message,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function readSourceSchema(value: unknown): SourceSchema {
  if (!isRecord(value) || typeof value.scope !== "string" || !isRecord(value.keys)) {
    throw new Error("Invalid localization schema for home.");
  }

  const keys: Record<string, SourceSchemaEntry> = {};

  for (const [key, entry] of Object.entries(value.keys)) {
    if (!isRecord(entry)) {
      throw new Error(`Invalid localization schema entry: ${key}`);
    }

    keys[key] = {
      params: readParams(entry.params),
      description: typeof entry.description === "string" ? entry.description : undefined,
      owner: typeof entry.owner === "string" ? entry.owner : undefined,
    };
  }

  return {
    scope: value.scope,
    keys,
  };
}

function readSourceMessages(value: unknown): SourceMessages {
  if (!isRecord(value)) {
    throw new Error("Invalid Korean localization messages for home.");
  }

  const messages: SourceMessages = {};

  for (const [key, message] of Object.entries(value)) {
    if (typeof message !== "string") {
      throw new Error(`Invalid Korean localization message: ${key}`);
    }

    messages[key] = message;
  }

  return messages;
}

function readParams(value: unknown): Record<string, MessageParamType> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error("Localization params must be an object.");
  }

  const params: Record<string, MessageParamType> = {};

  for (const [name, type] of Object.entries(value)) {
    if (!isMessageParamType(type)) {
      throw new Error(`Invalid localization param '${name}'.`);
    }

    params[name] = type;
  }

  return params;
}

function isMessageParamType(value: unknown): value is MessageParamType {
  return value === "string" || value === "number" || value === "boolean" || value === "date";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
