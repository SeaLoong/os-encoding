/**
 * Detects the locale encoding, or the active console code page on Windows.
 * Inspects the first nonempty variable in LC_ALL, LC_CTYPE, LANG order.
 * Otherwise runs a synchronous fallback command with a one-second timeout.
 * @param {boolean} [envOnly=false] - Only inspect environment variables; do not run fallback commands.
 * @returns {string} The encoding name, preserving its spelling, or 'UTF-8' if detection fails.
 */
declare function osEncoding(envOnly?: boolean): string;

export = osEncoding;
