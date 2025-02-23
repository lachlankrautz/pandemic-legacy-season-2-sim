import { Logger as WinstonLogger, createLogger, format, transports } from "winston";
import { Writable } from "node:stream";

/**
 * Overriding the winston type to remove the return type
 */
interface LeveledLogMethodNoReturn {
  // It is actually any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (message: string, ...meta: any[]): void;

  // It is actually any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (message: any): void;

  (infoObject: object): void;
}

export type Logger = {
  setLevel: (level: WinstonLogger["level"]) => void;
  isDebugEnabled: () => boolean;
  info: LeveledLogMethodNoReturn;
  warn: LeveledLogMethodNoReturn;
  debug: LeveledLogMethodNoReturn;
  error: LeveledLogMethodNoReturn;
};

export const makeLogger = (): Logger => {
  const logger: WinstonLogger = createLogger({
    level: "info",
    format: format.combine(
      format.colorize(),
      format.align(),
      format.printf((info) => `${info.level}: ${info.message}`),
    ),
    transports: [new transports.Console()],
  });

  return {
    setLevel: (level) => {
      logger.level = level;
    },
    isDebugEnabled: () => logger.isDebugEnabled(),
    info: (...args) => {
      logger.info(...args);
    },
    warn: (...args) => {
      logger.warn(...args);
    },
    debug: (...args) => {
      logger.debug(...args);
    },
    error: (...args) => {
      logger.error(...args);
    },
  };
};

const nullStream = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  },
});

export const makeNullLogger = (): Logger => {
  const logger: WinstonLogger = createLogger({
    level: "info",
    format: format.combine(
      format.colorize(),
      format.align(),
      format.printf((info) => `${info.level}: ${info.message}`),
    ),
    transports: [new transports.Stream({ stream: nullStream })],
  });

  return {
    setLevel: (level) => {
      logger.level = level;
    },
    isDebugEnabled: () => logger.isDebugEnabled(),
    info: (...args) => {
      logger.info(...args);
    },
    warn: (...args) => {
      logger.warn(...args);
    },
    debug: (...args) => {
      logger.debug(...args);
    },
    error: (...args) => {
      logger.error(...args);
    },
  };
};
