const { execSync } = require('child_process');
const { createInterface } = require('readline/promises');
const semver = require('semver');
const fs = require('fs/promises');
const path = require('path');

async function checkGitClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim() !== '') {
      throw new Error('There are uncommitted changes in the repository. Please commit or stash them before proceeding.');
    }
  } catch (error) {
    throw new Error(`Git status check failed: ${error.message}`);
  }
}

async function confirmAction(rl, message) {
  const answer = await rl.question(`${message} (y/N) `);
  return answer.trim().toLowerCase() === 'y';
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    await checkGitClean();

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageData = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageData);
    const currentVersion = packageJson.version;

    const versionType = await rl.question('Select version type (1: major, 2: minor, 3: patch, default: patch): ');

    const incType = versionType.trim() === '1' ? 'major' : versionType.trim() === '2' ? 'minor' : 'patch';

    const defaultVersion = semver.inc(currentVersion, incType);
    const input = await rl.question(`Enter new version (default: ${defaultVersion}): `);
    const newVersion = input.trim() || defaultVersion;

    if (!semver.valid(newVersion)) {
      throw new Error(`Invalid version format: ${newVersion}`);
    }

    const confirm = await confirmAction(rl, `Confirm release v${newVersion}?`);
    if (!confirm) {
      console.log('Release cancelled.');
      return;
    }

    packageJson.version = newVersion;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    execSync('git add package.json');
    execSync(`git commit -m "chore: release v${newVersion}" --allow-empty`);
    execSync(`git tag v${newVersion}`);
    execSync('git push --follow-tags');

    console.log(`\n✅ Successfully released version v${newVersion}!`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
