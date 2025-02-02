import { type Logger as WinstonLogger, createLogger, format, transports } from "winston";

export type Logger = WinstonLogger;

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
