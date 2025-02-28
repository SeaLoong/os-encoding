/**
 * Detects the system's default character encoding.
 * @param {boolean} [envOnly=false] - If true, only check environment variables (LANG/LC_ALL) and skip fallback commands like `locale` or `chcp`.
 * @returns {string} The detected encoding name (e.g., 'UTF-8', 'GBK', 'Shift_JIS').
 */
declare function osEncoding(envOnly?: boolean): string;

export = osEncoding;
