const cache = require('@actions/cache');
const utils = require('./lib');

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
      const cacheDir = await getCacheDir();
      const { unique } = getCacheKeys();

      logger.info(`saving cache with key "${unique}".`);

      await cache.saveCache([cacheDir], unique);
    } catch (e) {
      logger.warning(`caching not working: ${e}`);
    }
  }
}

run();
export default run;
