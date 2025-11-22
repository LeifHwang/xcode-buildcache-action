import * as path from 'path';

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

//
//
export const actionName = 'xcode-buildcache';
export const zipInnerDir = 'buildcache';

//
//
export class logger {
  static info(message) {
    core.info(`${actionName}: ${message}`);
  }

  static warning(message) {
    core.warning(`${actionName}: ${message}`);
  }

  static error(message) {
    core.error(`${actionName}: ${message}`);
  }
}

//
//
export function getEnvVar(key, defaultValue) {
  return process.env[key] ?? defaultValue;
}

//
//
export async function getInstallDir() {
  const installDir = getEnvVar('GITHUB_WORKSPACE', '');
  await io.mkdirP(installDir);

  return installDir;
}

export async function getCacheDir() {
  const installDir = await getInstallDir();

  return path.resolve(installDir, zipInnerDir);
}

export function getCacheKeys(version) {
  let withInput = actionName;

  const inputKey = core.getInput('cache_key');
  if (inputKey) {
    withInput = `${actionName}-${inputKey}`;
  }

  const unique = `${withInput}-${version}`;

  return { withInput, unique };
}

//
//
export async function printStats() {
  const env = { ...process.env };
  delete env?.BUILDCACHE_IMPERSONATE;

  const { stdout } = await exec.getExecOutput(zipInnerDir, ['-s'], { env });

  const get = (name, def) => {
    return stdout.match(RegExp(`^  ${name}:\\s*(\\d+)$`, 'm'))?.[1] || def;
  };

  return {
    entries: parseInt(get(`Entries in cache`, '-1')),
    misses: parseInt(get(`Misses`, '-1'))
  };
}
export async function zeroStats() {
  const env = { ...process.env };
  delete env?.BUILDCACHE_IMPERSONATE;

  await exec.exec(zipInnerDir, ['-z'], { env });
}
