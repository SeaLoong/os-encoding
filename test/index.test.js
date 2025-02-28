const assert = require('assert');
const child_process = require('child_process');
const osEncoding = require('../');

const originalPlatform = process.platform;
const originalEnv = { ...process.env };
const originalExecSync = child_process.execSync;

describe('osEncoding', () => {
  beforeEach(() => {
    process.env.LANG = 'zh_CN.Big5';
    process.env.LC_ALL = 'zh_CN.Big5';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LANG;
    delete process.env.LC_ALL;
    child_process.execSync = originalExecSync;
  });

  after(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  describe('Windows', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
    });

    it('should read from LANG env', () => {
      assert.strictEqual(osEncoding(), 'Big5');
    });

    it('should fallback to chcp command (envOnly=false)', () => {
      delete process.env.LANG;
      delete process.env.LC_ALL;

      // Mock chcp command
      child_process.execSync = () => Buffer.from('Active code page: 936');

      assert.strictEqual(osEncoding(), 'GBK');
    });
  });

  describe('macOS', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
    });

    it('should read from LANG env', () => {
      assert.strictEqual(osEncoding(), 'Big5');
    });

    it('should fallback to locale command (envOnly=false)', () => {
      delete process.env.LANG;
      delete process.env.LC_ALL;

      // Mock locale command
      child_process.execSync = () => Buffer.from('LC_CTYPE=en_US.ISO-8859-1');

      assert.strictEqual(osEncoding(), 'ISO-8859-1');
    });
  });

  describe('Linux', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
    });

    it('should read from LANG env', () => {
      assert.strictEqual(osEncoding(), 'Big5');
    });

    it('should fallback to locale command (envOnly=false)', () => {
      delete process.env.LANG;
      delete process.env.LC_ALL;

      // Mock locale command
      child_process.execSync = () => Buffer.from('LANG=ru_RU.KOI8-R');

      assert.strictEqual(osEncoding(), 'KOI8-R');
    });
  });

  describe('Fallback Behavior', () => {
    beforeEach(() => {
      delete process.env.LANG;
      delete process.env.LC_ALL;
    });

    it('should return UTF-8 when env vars missing (envOnly=true)', () => {
      assert.strictEqual(osEncoding(true), 'UTF-8');
    });

    it('should return UTF-8 when all detection methods fail', () => {
      // Force Windows platform but mock failing chcp
      Object.defineProperty(process, 'platform', { value: 'win32' });

      child_process.execSync = () => {
        throw new Error('Command failed');
      };

      assert.strictEqual(osEncoding(), 'UTF-8');
    });
  });
});
