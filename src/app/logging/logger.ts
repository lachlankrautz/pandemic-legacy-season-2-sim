import { type Logger as WinstonLogger, createLogger, format, transports } from "winston";

export type Logger = {
  [K in keyof Pick<WinstonLogger, "info" | "error" | "debug" | "warn">]: (
    ...args: Parameters<WinstonLogger[K]>
  ) => void;
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
