import { randomUUID } from "crypto";
import path from "path";

// Marshal environment variables to strongly typed config
// Do not directly access environment variables outside this config module
// https://12factor.net/config
export type Config = {
  seed: string;
  saveDir: string;
};

const config: Config = {
  seed: process.env["SEED"] || randomUUID(),
  saveDir: path.resolve(import.meta.dirname, "../../saves"),
};

export const getConfig = (): Config => {
  return config;
};
