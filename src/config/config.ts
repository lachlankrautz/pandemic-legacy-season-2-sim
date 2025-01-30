import { randomUUID } from "crypto";

// Marshal environment variables to strongly typed config
// Do not directly access environment variables outside this config module
// https://12factor.net/config
export type Config = {
  seed: string;
};

export const config: Config = {
  seed: process.env["SEED"] || randomUUID(),
};
