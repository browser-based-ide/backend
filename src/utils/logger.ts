import winston from "winston";

const customLevels = {
    levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        trace: "white",
        debug: "green",
        info: "green",
        warn: "yellow",
        error: "red",
        fatal: "red",
    },
};

const formatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
    }),
);

class Logger {
    private logger: winston.Logger;

    constructor() {
        const transport = new winston.transports.File({
                filename: "logs/error.log",
                level: process.env.LOG_LEVEL || "error",
                format: formatter,
            }),
            isDevEnvironment = process.env.NODE_ENV === "production" ? false : true;
        this.logger = winston.createLogger({
            level: isDevEnvironment ? "trace" : "error",
            levels: customLevels.levels,
            transports: transport,
        });
        winston.addColors(customLevels.colors);
    }

    trace(msg: string, meta?: unknown) {
        this.logger.log("trace", msg, meta);
        this._logToConsole("trace", msg, meta, false);
    }

    debug(msg: string, meta?: unknown) {
        this.logger.debug(msg, meta);
        this._logToConsole("debug", msg, meta, false);
    }

    info(msg: string, meta?: unknown) {
        this.logger.info(msg, meta);
        this._logToConsole("info", msg, meta, false);
    }

    warn(msg: string, meta?: unknown) {
        this.logger.warn(msg, meta);
        this._logToConsole("warn", msg, meta, false);
    }

    error(msg: string, meta?: unknown) {
        this.logger.error(msg, meta);
        this._logToConsole("error", msg, meta, true);
    }

    fatal(msg: string, meta?: unknown) {
        this.logger.log("fatal", msg, meta);
        this._logToConsole("fatal", msg, meta, true);
    }

    private _logToConsole(level: string, msg: string, meta?: unknown, isError?: boolean) {
        if (isError || process.env.LOG_LEVEL?.toLowerCase() === level) {
            console.log(msg);
            if (meta) {
                console.log(meta);
            }
        }
    }
}

export const logger = new Logger();
