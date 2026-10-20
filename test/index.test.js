const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('assert');
const child_process = require('child_process');
const osEncoding = require('../');

const originalPlatform = process.platform;
const originalEnv = { ...process.env };
const originalExecSync = child_process.execSync;

describe('osEncoding', () => {
  let commands;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LANG;
    delete process.env.LC_ALL;
    delete process.env.LC_CTYPE;
    Object.defineProperty(process, 'platform', { value: 'linux' });
    commands = [];
    child_process.execSync = (command, options) => {
      commands.push({ command, options });
      throw new Error('Unexpected command');
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    child_process.execSync = originalExecSync;
  });

  function commandOutput(output) {
    child_process.execSync = (command, options) => {
      commands.push({ command, options });
      return Buffer.from(output);
    };
  }

  describe('environment locale', () => {
    for (const platform of ['win32', 'darwin', 'linux']) {
      it(`reads LANG without a subprocess on ${platform}`, () => {
        Object.defineProperty(process, 'platform', { value: platform });
        process.env.LANG = 'zh_CN.Big5';

        assert.strictEqual(osEncoding(), 'Big5');
        assert.strictEqual(commands.length, 0);
      });
    }

    it('uses LC_ALL before LC_CTYPE and LANG', () => {
      process.env.LC_ALL = 'ja_JP.Shift_JIS';
      process.env.LC_CTYPE = 'zh_CN.GBK';
      process.env.LANG = 'en_US.UTF-8';

      assert.strictEqual(osEncoding(), 'Shift_JIS');
      assert.strictEqual(commands.length, 0);
    });

    it('uses LC_CTYPE before LANG', () => {
      process.env.LC_CTYPE = 'ru_RU.KOI8-R';
      process.env.LANG = 'en_US.UTF-8';

      assert.strictEqual(osEncoding(), 'KOI8-R');
      assert.strictEqual(commands.length, 0);
    });

    it('does not use LANG when LC_CTYPE has no codeset', () => {
      process.env.LC_CTYPE = 'C';
      process.env.LANG = 'zh_CN.Big5';

      assert.strictEqual(osEncoding(true), 'UTF-8');
      assert.strictEqual(commands.length, 0);
    });

    it('skips empty LC_ALL', () => {
      process.env.LC_ALL = '';
      process.env.LC_CTYPE = 'zh_CN.GBK';
      process.env.LANG = 'en_US.UTF-8';

      assert.strictEqual(osEncoding(true), 'GBK');
      assert.strictEqual(commands.length, 0);
    });

    it('skips empty LC_ALL and LC_CTYPE', () => {
      process.env.LC_ALL = '';
      process.env.LC_CTYPE = '';
      process.env.LANG = 'zh_CN.Big5';

      assert.strictEqual(osEncoding(true), 'Big5');
      assert.strictEqual(commands.length, 0);
    });

    it('removes the locale modifier', () => {
      process.env.LANG = 'de_DE.ISO-8859-15@euro';

      assert.strictEqual(osEncoding(true), 'ISO-8859-15');
      assert.strictEqual(commands.length, 0);
    });

    it('does not mistake a dot in the modifier for a codeset', () => {
      process.env.LANG = 'de_DE@currency.euro';

      assert.strictEqual(osEncoding(true), 'UTF-8');
      assert.strictEqual(commands.length, 0);
    });

    it('preserves codeset spelling and case', () => {
      process.env.LANG = 'en_US.utf8';

      assert.strictEqual(osEncoding(true), 'utf8');
    });

    it('preserves codeset aliases containing dots', () => {
      process.env.LANG = 'en_US.ANSI_X3.4-1968';

      assert.strictEqual(osEncoding(true), 'ANSI_X3.4-1968');
    });

    for (const locale of ['C', 'POSIX', 'de_DE', 'de_DE@euro', 'en_US.', 'en_US.UTF-8"']) {
      it(`uses UTF-8 in envOnly mode for ${JSON.stringify(locale)} without falling through to LANG`, () => {
        process.env.LC_ALL = locale;
        process.env.LANG = 'zh_CN.Big5';

        assert.strictEqual(osEncoding(true), 'UTF-8');
        assert.strictEqual(commands.length, 0);
      });
    }

    it('uses UTF-8 without a subprocess when envOnly and no locale is set', () => {
      assert.strictEqual(osEncoding(true), 'UTF-8');
      assert.strictEqual(commands.length, 0);
    });
  });

  describe('Unix fallback', () => {
    for (const platform of ['darwin', 'linux']) {
      it(`queries locale charmap on ${platform}`, () => {
        Object.defineProperty(process, 'platform', { value: platform });
        commandOutput('ISO-8859-1\n');

        assert.strictEqual(osEncoding(), 'ISO-8859-1');
        assert.strictEqual(commands.length, 1);
        assert.strictEqual(commands[0].command, 'locale charmap');
      });
    }

    for (const locale of ['C', 'POSIX', 'de_DE']) {
      it(`queries the effective charset for ${locale} instead of a lower-priority LANG`, () => {
        process.env.LC_ALL = locale;
        process.env.LANG = 'zh_CN.Big5';
        commandOutput('ANSI_X3.4-1968\n');

        assert.strictEqual(osEncoding(), 'ANSI_X3.4-1968');
        assert.strictEqual(commands.length, 1);
      });
    }

    it('trims command output and preserves charset aliases', () => {
      commandOutput('  ANSI_X3.4-1968\r\n');

      assert.strictEqual(osEncoding(), 'ANSI_X3.4-1968');
    });

    it('bounds and silences fallback subprocesses', () => {
      commandOutput('UTF-8\n');

      assert.strictEqual(osEncoding(), 'UTF-8');
      assert.strictEqual(commands.length, 1);
      assert.strictEqual(commands[0].options.timeout, 1000);
      assert.strictEqual(commands[0].options.windowsHide, true);
      assert.deepStrictEqual(commands[0].options.stdio, ['ignore', 'pipe', 'ignore']);
    });

    for (const output of ['', '\n', 'UTF-8\nISO-8859-1\n', 'LC_CTYPE="en_US.ISO-8859-1"\n', 'locale: invalid locale\n']) {
      it(`falls back to UTF-8 for invalid charmap output ${JSON.stringify(output)}`, () => {
        commandOutput(output);

        assert.strictEqual(osEncoding(), 'UTF-8');
        assert.strictEqual(commands.length, 1);
      });
    }

    it('uses the command when the environment codeset is malformed', () => {
      process.env.LANG = 'en_US.UTF-8"';
      commandOutput('ISO-8859-1\n');

      assert.strictEqual(osEncoding(), 'ISO-8859-1');
      assert.strictEqual(commands.length, 1);
    });
  });

  describe('Windows fallback', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
    });

    for (const [codePage, encoding] of [['936', 'GBK'], ['65001', 'UTF-8'], ['932', 'Shift_JIS'], ['1252', 'windows-1252']]) {
      it(`maps console code page ${codePage} to ${encoding}`, () => {
        commandOutput(`Active code page: ${codePage}\r\n`);

        assert.strictEqual(osEncoding(), encoding);
        assert.strictEqual(commands.length, 1);
        assert.strictEqual(commands[0].command, 'chcp');
      });
    }

    it('ignores the localized chcp label', () => {
      commandOutput('活动代码页: 936\r\n');

      assert.strictEqual(osEncoding(), 'GBK');
    });

    it('bounds and silences the Windows subprocess', () => {
      commandOutput('Active code page: 936\r\n');

      assert.strictEqual(osEncoding(), 'GBK');
      assert.strictEqual(commands[0].options.timeout, 1000);
      assert.strictEqual(commands[0].options.windowsHide, true);
      assert.deepStrictEqual(commands[0].options.stdio, ['ignore', 'pipe', 'ignore']);
    });

    for (const output of ['Active code page: 99999', 'Active code page: 710', 'Active code page: 936garbage', 'Active code page: 936\nunexpected', 'no code page', '']) {
      it(`uses UTF-8 for an unknown or missing code page in ${JSON.stringify(output)}`, () => {
        commandOutput(output);

        assert.strictEqual(osEncoding(), 'UTF-8');
        assert.strictEqual(commands.length, 1);
      });
    }
  });

  describe('command failures', () => {
    for (const platform of ['win32', 'darwin', 'linux']) {
      for (const failure of ['Command failed', 'ETIMEDOUT']) {
        it(`returns UTF-8 after ${failure} on ${platform}`, () => {
          Object.defineProperty(process, 'platform', { value: platform });
          child_process.execSync = (command, options) => {
            commands.push({ command, options });
            throw new Error(failure);
          };

          assert.strictEqual(osEncoding(), 'UTF-8');
          assert.strictEqual(commands.length, 1);
        });
      }
    }
  });

  it('runs the real fallback command on the host platform', () => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    child_process.execSync = (command, options) => {
      commands.push({ command, options });
      return originalExecSync(command, options);
    };

    const encoding = osEncoding();

    assert.strictEqual(typeof encoding, 'string');
    assert.ok(encoding.length > 0);
    assert.strictEqual(commands.length, 1);
    assert.strictEqual(commands[0].command, originalPlatform === 'win32' ? 'chcp' : 'locale charmap');
  });
});
