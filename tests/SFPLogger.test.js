const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const SFPLogger = require('../lib/SFPLogger.js').default;
const {
    ConsoleLogger,
    VoidLogger,
    FileLogger,
    LoggerLevel,
    LoggerType,
    COLOR_HEADER,
    COLOR_ERROR,
} = require('../lib/SFPLogger.js');

beforeEach(() => {
    SFPLogger.isLogsDisabled = false;
    SFPLogger.logLevel = LoggerLevel.INFO;
});

function tempLogPath() {
    return path.join(os.tmpdir(), `sfp-logger-test-${process.pid}-${Date.now()}-${Math.random()}.log`);
}

test('LoggerType matches 5.0.1 numeric values', () => {
    assert.equal(LoggerType.CONSOLE, 0);
    assert.equal(LoggerType.FILE, 1);
    assert.equal(LoggerType.VOID, 2);
});

test('ConsoleLogger, VoidLogger, and FileLogger expose log()', () => {
    const consoleLogger = new ConsoleLogger();
    const voidLogger = new VoidLogger();
    const fileLogger = new FileLogger(tempLogPath());

    assert.equal(consoleLogger.logType, LoggerType.CONSOLE);
    assert.equal(voidLogger.logType, LoggerType.VOID);
    assert.equal(fileLogger.logType, LoggerType.FILE);
    assert.equal(typeof consoleLogger.log, 'function');
    assert.equal(typeof voidLogger.log, 'function');
    assert.equal(typeof fileLogger.log, 'function');
});

test('FileLogger strips ANSI from file output', () => {
    const logPath = tempLogPath();
    const logger = new FileLogger(logPath);
    SFPLogger.log(COLOR_ERROR('boom'), LoggerLevel.INFO, logger);
    const contents = fs.readFileSync(logPath, 'utf8');
    assert.equal(contents.includes('\u001b'), false);
    assert.match(contents, /boom/);
    fs.unlinkSync(logPath);
});

test('printHeaderLine writes a 90-char padded header without ANSI in files', () => {
    const logPath = tempLogPath();
    const logger = new FileLogger(logPath);
    SFPLogger.printHeaderLine('Build', COLOR_HEADER, LoggerLevel.INFO, logger);
    const line = fs.readFileSync(logPath, 'utf8').replace(/\r?\n$/, '');
    assert.equal(line.includes('\u001b'), false);
    assert.equal(line.length, 90);
    assert.match(line, /Build/);
    fs.unlinkSync(logPath);
});

test('disableLogs short-circuits SFPLogger.log', () => {
    const logPath = tempLogPath();
    const logger = new FileLogger(logPath);
    SFPLogger.disableLogs();
    SFPLogger.log('should not appear', LoggerLevel.INFO, logger);
    assert.equal(fs.existsSync(logPath), false);
});

test('VoidLogger.log is a no-op', () => {
    const voidLogger = new VoidLogger();
    SFPLogger.log('ignored', LoggerLevel.INFO, voidLogger);
});
