import * as path from 'path';
import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';
import * as utils from './utils.js';

const { logger } = utils;

const _gitlabUrl = 'https://gitlab.com/bits-n-bites/buildcache/-/releases';

async function getLatestUrl() {
  try {
    const resp = await fetch(`${_gitlabUrl}/permalink/latest`, { redirect: 'manual' });
    const location = resp.headers.get('location');

    logger.info(`got gitlab latest release url: ${location}`);

    return location;
  } catch (error) {
    return undefined;
  }
}

async function download() {
  const filename = 'buildcache-macos.zip';

  const version = core.getInput('version');
  let downloadUrl = `${_gitlabUrl}/${version}/downloads/${filename}`;
  if (!version || version === 'latest') {
    const url = await getLatestUrl();
    if (!url) throw Error('fetch latest release info error');

    downloadUrl = `${url}/downloads/${filename}`;
  }

  logger.info(`download url: ${downloadUrl}`);

  const downloadPath = await toolCache.downloadTool(downloadUrl);
  logger.info(`download path: ${downloadPath}`);

  return downloadPath;
}

async function install(downloadPath) {
  const { getInstallDir, zipInnerDir } = utils;

  const installDir = await getInstallDir();
  const buildcacheFolder = await toolCache.extractZip(downloadPath, installDir);
  logger.info(`unpacked folder ${buildcacheFolder}`);

  // do symbolic links
  const buildcacheBinFolder = path.resolve(buildcacheFolder, zipInnerDir, 'bin');
  const buildcacheBinPath = path.join(buildcacheBinFolder, zipInnerDir);

  await exec.exec('ln', ['-s', buildcacheBinPath, path.join(buildcacheBinFolder, 'clang')]);
  await exec.exec('ln', ['-s', buildcacheBinPath, path.join(buildcacheBinFolder, 'clang++')]);

  core.addPath(buildcacheBinFolder);
}

async function restore() {
  const { getCacheDir, getCacheKeys } = utils;

  try {
    const cacheDir = await getCacheDir();
    const { withInput, unique } = getCacheKeys();

    const restoredWith = await cache.restoreCache([cacheDir], unique, [withInput]);
    if (restoredWith) {
      logger.info(`restored from cache key "${restoredWith}".`);
    } else {
      logger.warning(`no cache for key ${unique} or ${withInput} - cold cache or invalid key`);
    }
  } catch (e) {
    logger.error(`caching not working: ${e}`);
  }
}

async function run() {
  try {
    const downloadPath = await download();
    await install(downloadPath);

    await restore();

    await utils.printStats();
    await utils.zeroStats();
  } catch (e) {
    logger.error(`failure during restore: ${e}`);

    core.setFailed(e);
  }
}

run();
export default run;
