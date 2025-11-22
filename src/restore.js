import * as path from 'path';

import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';

import * as utils from './utils.js';
import { getDownloadUrl, resolveVersion } from './gitlabUtils.js';

const { logger } = utils;

async function downloadAndExtract(version) {
  const downloadUrl = getDownloadUrl(version);
  logger.info(`download url: ${downloadUrl}`);

  const downloadPath = await toolCache.downloadTool(downloadUrl);
  logger.info(`download path: ${downloadPath}`);

  const installDir = await utils.getInstallDir();
  const buildcacheFolder = await toolCache.extractZip(downloadPath, installDir);
  logger.info(`unpacked folder ${buildcacheFolder}`);
}

async function install() {
  const { getCacheDir, zipInnerDir } = utils;

  const cacheDir = await getCacheDir();

  // do symbolic links
  const buildcacheBinFolder = path.resolve(cacheDir, 'bin');
  const buildcacheBinPath = path.join(buildcacheBinFolder, zipInnerDir);

  await exec.exec('ln', ['-s', buildcacheBinPath, path.join(buildcacheBinFolder, 'clang')]);
  await exec.exec('ln', ['-s', buildcacheBinPath, path.join(buildcacheBinFolder, 'clang++')]);

  core.addPath(buildcacheBinFolder);
}

async function restore(version) {
  const { getCacheDir, getCacheKeys } = utils;

  try {
    const cacheDir = await getCacheDir();
    const { withInput, unique } = getCacheKeys(version);

    const restoredWith = await cache.restoreCache([cacheDir], unique, [withInput]);
    if (restoredWith) {
      logger.info(`restored from cache key "${restoredWith}".`);
      return true;
    } else {
      logger.warning(`no cache for key ${unique} or ${withInput} - cold cache or invalid key`);
    }
  } catch (e) {
    logger.error(`caching not working: ${e}`);
  }
  return false;
}

async function run() {
  try {
    const version = await resolveVersion();
    if (!await restore(version)) {
      await downloadAndExtract(version);
    }

    await install();

    await utils.printStats();
    await utils.zeroStats();
  } catch (e) {
    logger.error(`failure during restore: ${e}`);

    core.setFailed(e);
  }
}

run();
export default run;
