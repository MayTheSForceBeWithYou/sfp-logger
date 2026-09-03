# @n8codes/sfp-logger

Logger used by the sfp CLI. Hard fork of `@flxbl-io/sfp-logger@5.0.1` (originally dxatscale/sfp-logger), API-compatible with that release.

```js
const SFPLogger = require('@n8codes/sfp-logger').default;
const { COLOR_HEADER, LoggerLevel } = require('@n8codes/sfp-logger');

SFPLogger.printHeaderLine('Build', COLOR_HEADER, LoggerLevel.INFO);
SFPLogger.log('hello');
```
