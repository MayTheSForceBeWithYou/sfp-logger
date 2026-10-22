import * as fs from 'fs-extra';
import { EOL } from 'os';
import chalk = require('chalk');
import stripAnsi = require('strip-ansi');

export enum LoggerLevel {
    TRACE = 10,
    DEBUG = 20,
    INFO = 30,
    WARN = 40,
    ERROR = 50,
    FATAL = 60,
    HIDE = 70,
}

export enum LoggerType {
    CONSOLE = 0,
    FILE = 1,
    VOID = 2,
}

export interface Logger {
    logType: LoggerType | string;
    path?: string;
    log(message: string, logLevel: LoggerLevel): void;
}

export class ConsoleLogger implements Logger {
    public logType: LoggerType = LoggerType.CONSOLE;
    public log(message: string, logLevel: LoggerLevel): void {
        SFPLogger.log(message, logLevel);
    }
}

export class VoidLogger implements Logger {
    public logType: LoggerType = LoggerType.VOID;
    public log(message: string, logLevel: LoggerLevel): void {
        // Do nothing
    }
}

export class FileLogger implements Logger {
    public logType: LoggerType;
    constructor(public path: string) {
        this.logType = LoggerType.FILE;
    }
    public log(message: string, logLevel: LoggerLevel): void {
        message = stripAnsi(message?.toString());
        fs.appendFileSync(this.path, message + EOL, 'utf8');
    }
}

export const COLOR_ERROR = chalk.bold.red;
export const COLOR_WARNING = chalk.keyword('orange');
export const COLOR_INFO = chalk.white;
export const COLOR_TRACE = chalk.gray;
export const COLOR_DEBUG = chalk.blue;
export const COLOR_HEADER = chalk.yellowBright.bold;
export const COLOR_SUCCESS = chalk.green.bold;
export const COLOR_TIME = chalk.magentaBright;
export const COLOR_KEY_MESSAGE = chalk.magentaBright.bold;
// No background colour: `black` + `bold` was unreadable wherever a terminal promotes bold-black
// to bright black, or drops the foreground and leaves dark-on-bright-green (the Azure DevOps log
// viewer does exactly that). A bright foreground alone stays legible on light and dark alike.
export const COLOR_KEY_VALUE = chalk.greenBright.bold;

export default class SFPLogger {
    public static logLevel: LoggerLevel = LoggerLevel.INFO;
    public static isLogsDisabled: boolean = false;

    static enableColor() {
        chalk.level = 2;
    }

    static disableColor() {
        chalk.level = 0;
    }

    static log(message: string, logLevel = LoggerLevel.INFO, logger?: Logger) {
        if (SFPLogger.isLogsDisabled) return;

        if (logLevel == null) logLevel = LoggerLevel.INFO;

        if (logLevel < this.logLevel) return;

        if (logger) {
            logger.log(message, logLevel);
        } else {
            SFPLogger.consoleLog(message, logLevel);
        }
    }

    private static consoleLog(message: string, logLevel: LoggerLevel) {
        switch (logLevel) {
            case LoggerLevel.TRACE:
                console.log(COLOR_TRACE(message));
                break;

            case LoggerLevel.DEBUG:
                console.log(COLOR_DEBUG(message));
                break;

            case LoggerLevel.INFO:
                console.log(message);
                break;

            case LoggerLevel.WARN:
                console.log(COLOR_WARNING(message));
                break;

            case LoggerLevel.ERROR:
                console.log(COLOR_ERROR(message));
                break;
        }
    }

    static disableLogs() {
        SFPLogger.isLogsDisabled = true;
    }

    static printHeaderLine(header: string, color: chalk.Chalk, logLevel: LoggerLevel, logger?: Logger) {
        if (SFPLogger.isLogsDisabled) return;

        if (header == null) header = '';

        const lineLength = 90;
        const leftPadLength = Math.floor((lineLength - header.length) / 2);
        const rightPadLength = lineLength - leftPadLength - header.length;
        const line = '-'.repeat(leftPadLength) + `${header}` + '-'.repeat(rightPadLength);

        if (logger) {
            logger.log(color(line), logLevel);
        } else {
            console.log(color(line));
        }
    }
}
