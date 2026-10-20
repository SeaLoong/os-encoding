const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const releaseScript = fs.readFileSync(path.join(__dirname, '../scripts/release.js'), 'utf8');

describe('release script', function () {
  this.timeout(30000);

  let root;
  let repository;
  let remote;
  let gitEnv;

  function git(args, cwd = repository) {
    return execFileSync('git', args, { cwd, env: gitEnv, encoding: 'utf8', stdio: 'pipe' }).trim();
  }

  async function runRelease(version) {
    const answers = ['3', version, 'y'];
    const messages = [];
    const releaseProcess = {
      cwd: () => repository,
      stdin: {},
      stdout: {},
      exitCode: 0,
      exit(code) {
        this.exitCode = code;
      },
    };

    await vm.runInNewContext(releaseScript, {
      require(name) {
        if (name === 'child_process') {
          return {
            execFileSync(command, args, options) {
              assert.strictEqual(command, 'git');
              return execFileSync(command, args, { ...options, cwd: repository, env: gitEnv, stdio: 'pipe' });
            },
          };
        }
        if (name === 'readline/promises') {
          return { createInterface: () => ({ question: async () => answers.shift(), close() {} }) };
        }
        return require(name);
      },
      console: { log: (message) => messages.push(message), error: (message) => messages.push(message) },
      process: releaseProcess,
    });

    return { exitCode: releaseProcess.exitCode, messages: messages.join('\n') };
  }

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'os-encoding-release-'));
    repository = path.join(root, 'repository');
    remote = path.join(root, 'remote.git');
    fs.mkdirSync(repository);
    const gitConfig = path.join(root, 'gitconfig');
    fs.writeFileSync(gitConfig, '');
    gitEnv = {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: gitConfig,
      GIT_AUTHOR_NAME: 'Release Test',
      GIT_AUTHOR_EMAIL: 'release-test@example.com',
      GIT_COMMITTER_NAME: 'Release Test',
      GIT_COMMITTER_EMAIL: 'release-test@example.com',
    };
    git(['init', '--bare', remote]);
    git(['init', '--initial-branch=main']);
    fs.writeFileSync(path.join(repository, 'package.json'), JSON.stringify({ version: '0.0.5' }) + '\n');
    git(['add', 'package.json']);
    git(['commit', '-m', 'Initial version']);
    git(['remote', 'add', 'origin', remote]);
    git(['push', '--set-upstream', 'origin', 'main']);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function assertUnchanged(head) {
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(repository, 'package.json'), 'utf8')).version, '0.0.5');
    assert.strictEqual(git(['rev-parse', 'HEAD']), head);
    assert.strictEqual(git(['status', '--porcelain']), '');
  }

  for (const version of ['0.0.5', '0.0.4', 'v0.0.6', '0.0.6+build', 'not-a-version']) {
    it(`rejects ${version} before changing files or commits`, async () => {
      const head = git(['rev-parse', 'HEAD']);
      const result = await runRelease(version);
      assert.strictEqual(result.exitCode, 1, result.messages);
      assertUnchanged(head);
    });
  }

  it('rejects an existing local tag before changing files or commits', async () => {
    git(['tag', 'v0.0.6']);
    const head = git(['rev-parse', 'HEAD']);
    const result = await runRelease('0.0.6');
    assert.strictEqual(result.exitCode, 1, result.messages);
    assertUnchanged(head);
  });

  it('rejects an existing remote tag before changing files or commits', async () => {
    git(['tag', 'v0.0.6']);
    git(['push', 'origin', 'refs/tags/v0.0.6']);
    git(['tag', '--delete', 'v0.0.6']);
    const head = git(['rev-parse', 'HEAD']);
    const result = await runRelease('0.0.6');
    assert.strictEqual(result.exitCode, 1, result.messages);
    assertUnchanged(head);
  });

  it('rejects a branch without an upstream before changing files or commits', async () => {
    git(['branch', '--unset-upstream']);
    const head = git(['rev-parse', 'HEAD']);
    const result = await runRelease('0.0.6');
    assert.strictEqual(result.exitCode, 1, result.messages);
    assertUnchanged(head);
  });

  it('rejects remote commits missing locally before changing files or commits', async () => {
    const head = git(['rev-parse', 'HEAD']);
    git(['commit', '--allow-empty', '-m', 'Remote change']);
    git(['push', 'origin', 'main']);
    git(['reset', '--hard', head]);
    const result = await runRelease('0.0.6');
    assert.strictEqual(result.exitCode, 1, result.messages);
    assertUnchanged(head);
  });

  it('allows local commits and pushes only the release tag with the branch', async () => {
    git(['commit', '--allow-empty', '-m', 'Local change']);
    git(['tag', '-a', 'v99.0.0', '-m', 'Unrelated local tag']);
    const result = await runRelease('0.0.6');
    assert.strictEqual(result.exitCode, 0, result.messages);
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(repository, 'package.json'), 'utf8')).version, '0.0.6');
    assert.strictEqual(git(['rev-parse', 'HEAD']), git(['rev-parse', 'refs/heads/main'], remote));
    assert.notStrictEqual(git(['ls-remote', '--tags', 'origin', 'refs/tags/v0.0.6']), '');
    assert.strictEqual(git(['ls-remote', '--tags', 'origin', 'refs/tags/v99.0.0']), '');
    assert.match(result.messages, /GitHub Actions/);
  });
});
