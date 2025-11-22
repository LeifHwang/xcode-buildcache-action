import { u as utils, f as resolveVersion, h as cacheExports } from './utils-es.js';
import 'path';
import 'fs';
import 'assert';
import 'os';
import 'crypto';
import 'util';
import 'url';
import 'node:os';
import 'node:util';
import 'node:process';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'net';
import 'tls';
import 'tty';
import 'http';
import 'https';
import 'stream';
import 'node:buffer';
import 'buffer';
import 'node:fs';
import 'querystring';
import 'stream/web';
import 'node:events';
import 'worker_threads';
import 'perf_hooks';
import 'util/types';
import 'async_hooks';
import 'console';
import 'zlib';
import 'string_decoder';
import 'diagnostics_channel';
import 'child_process';
import 'timers';

async function run() {
  const { printStats, logger } = utils;

  const stats = await printStats();
  if (stats.entries === 0) {
    logger.info('not saving empty cache.');
  } else if (stats.misses === 0) {
    logger.info('not saving unmodified cache.');
  } else {
    const { getCacheDir, getCacheKeys } = utils;

    try {
      const version = await resolveVersion();

      const cacheDir = await getCacheDir();
      const { unique } = getCacheKeys(version);

      logger.info(`saving cache with key "${unique}".`);

      await cacheExports.saveCache([cacheDir], unique);
    } catch (e) {
      logger.warning(`caching not working: ${e}`);
    }
  }
}

run();

export { run as default };
