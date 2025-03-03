const child_process = require('child_process');
const CODE_PAGE_MAP = require('./src/codepage');

/**
 * Detects the system's default character encoding.
 * @param {boolean} [envOnly=false] - If true, only check environment variables (LANG/LC_ALL) and skip fallback commands like `locale` or `chcp`.
 * @returns {string} The detected encoding name (e.g., 'UTF-8', 'GBK', 'Shift_JIS').
 */
function osEncoding(envOnly = false) {
  try {
    // Detect via locale
    let lang = process.env.LANG || process.env.LC_ALL || '';
    let encoding = lang.split('.')[1];
    if (!encoding && !envOnly) {
      // Fallback to platform-specific behavior
      // Windows: Detect via code page
      if (process.platform === 'win32') {
        const codePage = child_process
          .execSync('chcp')
          .toString()
          .match(/:\s*(\d+)/)?.[1];
        encoding = CODE_PAGE_MAP[codePage];
      } else {
        // macOS/Linux: Detect via `locale` command
        lang =
          child_process
            .execSync('locale')
            .toString()
            .split('\n')
            .find((line) => line.startsWith('LC_CTYPE=') || line.startsWith('LANG=')) || '';
        encoding = lang.split('.')[1];
      }
    }
    return encoding || 'UTF-8';
  } catch (e) {
    return 'UTF-8'; // Fallback
  }
}

module.exports = osEncoding;
