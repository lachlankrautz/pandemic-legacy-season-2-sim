import { Logger as WinstonLogger, createLogger, format, transports } from "winston";

export type Logger = Omit<WinstonLogger, "info" | "warn" | "debug" | "error"> & {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export const makeLogger = (): Logger => {
  return createLogger({
    level: "info",
    format: format.combine(
      format.colorize(),
      format.align(),
      format.printf((info) => `${info.level}: ${info.message}`),
    ),
    transports: [new transports.Console()],
  });
};
