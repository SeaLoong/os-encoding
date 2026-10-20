const child_process = require('child_process');
const CODE_PAGE_MAP = require('./src/codepage');

function isEncodingName(value) {
  return typeof value === 'string' && /^[A-Za-z0-9]/.test(value) && !/[^A-Za-z0-9._:+-]/.test(value);
}

/**
 * Detects the locale encoding, or the active console code page on Windows.
 * @param {boolean} [envOnly=false] - Only inspect LC_ALL, LC_CTYPE and LANG; do not run fallback commands.
 * @returns {string} The encoding name, preserving its spelling, or 'UTF-8' if detection fails.
 */
function osEncoding(envOnly = false) {
  try {
    // Select the effective character locale before trying to extract its codeset.
    const locale = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG || '';
    const encoding = locale.split('@')[0].match(/^[^.]+\.(.+)$/)?.[1];
    if (isEncodingName(encoding)) return encoding;
    if (envOnly) return 'UTF-8';

    const options = {
      timeout: 1000,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    };

    if (process.platform === 'win32') {
      const codePage = child_process.execSync('chcp', options).toString().match(/:\s*(\d+)\s*$/)?.[1];
      return CODE_PAGE_MAP[codePage] || 'UTF-8';
    }

    // Query LC_CTYPE's codeset directly, including locales without a .codeset suffix.
    const charmap = child_process.execSync('locale charmap', options).toString().trim();
    return isEncodingName(charmap) ? charmap : 'UTF-8';
  } catch (e) {
    return 'UTF-8';
  }
}

module.exports = osEncoding;
