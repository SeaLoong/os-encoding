const child_process = require('child_process');

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
        encoding = mapWindowsCodePageToEncoding(codePage);
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

const CODE_PAGE_MAP = {
  65001: 'UTF-8', // Unicode (UTF-8)
  932: 'Shift_JIS', // Japanese
  936: 'GBK', // Simplified Chinese
  949: 'EUC-KR', // Korean
  950: 'Big5', // Traditional Chinese
  1252: 'Windows-1252', // Western European
};
/**
 * Maps Windows code pages to encoding names with original casing.
 */
function mapWindowsCodePageToEncoding(codePage) {
  return CODE_PAGE_MAP[codePage] || 'UTF-8';
}

module.exports = osEncoding;
