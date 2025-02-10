import { randomUUID } from "crypto";
import path from "path";
import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

// Marshal environment variables to strongly typed config
// Do not directly access environment variables outside this config module
// https://12factor.net/config
export type Config = {
  seed: string;
  saveDir: string;
};

const envSchema = Type.Object({
  SEED: Type.Optional(Type.String()),
});

type Env = Static<typeof envSchema>;

export const parseEnvToConfig = (env: Record<string, string | undefined>): Config | never => {
  const validEnv: Env = Value.Parse(envSchema, env);
  return {
    seed: validEnv.SEED || randomUUID(),
    saveDir: path.resolve(import.meta.dirname, "../../saves"),
  };
};

export const getConfig = (): Config | never => {
  return parseEnvToConfig(process.env);
};
