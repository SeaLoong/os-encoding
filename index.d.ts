/**
 * Detects the locale encoding, or the active console code page on Windows.
 * Inspects the first nonempty variable in LC_ALL, LC_CTYPE, LANG order.
 * Recognizes named codesets, numeric Windows code pages and standalone UTF-8 values.
 * Otherwise runs a synchronous fallback command with a one-second timeout.
 * @param {boolean} [envOnly=false] - Only inspect environment variables; do not run fallback commands.
 * @returns {string} The encoding label (numeric code pages are mapped to names), or 'UTF-8' if detection fails.
 */
declare function osEncoding(envOnly?: boolean): string;

export = osEncoding;
