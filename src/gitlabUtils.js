import * as core from '@actions/core';
import * as utils from './utils.js';

const _gitlabUrl = 'https://gitlab.com/bits-n-bites/buildcache/-/releases';

//
//
async function _fetchLatestVersion() {
    const { logger } = utils;

    try {
        const resp = await fetch(`${_gitlabUrl}/permalink/latest`, { redirect: 'manual' });
        const location = resp.headers.get('location');

        logger.info(`got gitlab latest release url: ${location}`);

        const version = location.split('/').pop();
        logger.info(`got gitlab latest release version: ${version}`);

        return version;
    } catch (error) {
        return undefined;
    }
}

/**
 * use input version or fetch the latest version from gitlab
 * @description when input version is null or "latest", fetch the latest version from gitlab 
 * @returns version string value
 */
export async function resolveVersion() {
    let version = core.getInput('version');
    if (!version || version === 'latest') {
        version = await _fetchLatestVersion();
        if (!version) throw Error('fetch latest release version error');
    }

    return version;
}

//
//
export function getDownloadUrl(version, filename = 'buildcache-macos.zip') {
    return `${_gitlabUrl}/${version}/downloads/${filename}`;
}