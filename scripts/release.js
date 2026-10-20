const { execFileSync } = require('child_process');
const { createInterface } = require('readline/promises');
const semver = require('semver');
const fs = require('fs/promises');
const path = require('path');

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function checkGitClean() {
  if (git(['status', '--porcelain']) !== '') {
    throw new Error('There are uncommitted changes in the repository. Please commit or stash them before proceeding.');
  }
}

function checkGitUpstream() {
  let remote;
  let upstream;

  try {
    const branch = git(['symbolic-ref', '--quiet', '--short', 'HEAD']);
    remote = git(['config', '--get', `branch.${branch}.remote`]);
    upstream = git(['config', '--get', `branch.${branch}.merge`]);
  } catch {
    throw new Error('Release from a branch with a configured upstream.');
  }

  git(['fetch', '--no-tags', remote, upstream]);
  if (git(['rev-list', '--count', 'HEAD..FETCH_HEAD']) !== '0') {
    throw new Error('The branch is behind or has diverged from its upstream. Synchronize it before releasing.');
  }

  return { remote, upstream };
}

async function confirmAction(rl, message) {
  const answer = await rl.question(`${message} (y/N) `);
  return answer.trim().toLowerCase() === 'y';
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    checkGitClean();
    const { remote, upstream } = checkGitUpstream();

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageData = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageData);
    const currentVersion = packageJson.version;

    if (typeof currentVersion !== 'string' || semver.valid(currentVersion) !== currentVersion) {
      throw new Error(`Invalid current package version: ${currentVersion}`);
    }

    const versionType = await rl.question('Select version type (1: major, 2: minor, 3: patch, default: patch): ');

    const incType = versionType.trim() === '1' ? 'major' : versionType.trim() === '2' ? 'minor' : 'patch';

    const defaultVersion = semver.inc(currentVersion, incType);
    const input = await rl.question(`Enter new version (default: ${defaultVersion}): `);
    const newVersion = input.trim() || defaultVersion;

    if (semver.valid(newVersion) !== newVersion) {
      throw new Error(`Invalid version: ${newVersion}. Use a canonical npm version without a v prefix or build metadata.`);
    }
    if (!semver.gt(newVersion, currentVersion)) {
      throw new Error(`New version ${newVersion} must be greater than ${currentVersion}.`);
    }

    const tag = `v${newVersion}`;
    if (git(['tag', '--list', tag]) !== '' || git(['ls-remote', '--tags', remote, `refs/tags/${tag}`]) !== '') {
      throw new Error(`Tag ${tag} already exists locally or on ${remote}.`);
    }

    const confirm = await confirmAction(rl, `Confirm release ${tag}?`);
    if (!confirm) {
      console.log('Release cancelled.');
      return;
    }

    checkGitClean();
    packageJson.version = newVersion;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    git(['add', 'package.json']);
    git(['commit', '-m', `chore: release ${tag}`]);
    git(['tag', '-a', tag, '-m', `Version ${newVersion}`]);
    git(['push', '--atomic', remote, `HEAD:${upstream}`, `refs/tags/${tag}:refs/tags/${tag}`]);

    console.log(`\n✅ Pushed ${tag}. Check GitHub Actions for the npm publication result.`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
