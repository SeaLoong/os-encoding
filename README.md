# os-encoding

[![NPM Version](https://img.shields.io/npm/v/os-encoding)](https://www.npmjs.com/package/os-encoding) [![NPM Downloads](https://img.shields.io/npm/dm/os-encoding)](https://www.npmjs.com/package/os-encoding) [![Tests](https://img.shields.io/github/actions/workflow/status/SeaLoong/os-encoding/test.yml?label=tests)](https://github.com/SeaLoong/os-encoding/actions/workflows/test.yml)

Detect the character encoding used by the current process's locale or Windows console. Supports Windows, macOS, and Linux, with no runtime dependencies. TypeScript declarations are included.

## Installation

```sh
npm install os-encoding
```

## Usage

CommonJS:

```js
const osEncoding = require('os-encoding');

const encoding = osEncoding();
console.log(encoding); // For example: 'UTF-8', 'GBK', or 'Shift_JIS'
```

ES modules:

```js
import osEncoding from 'os-encoding';

console.log(osEncoding());
```

TypeScript with CommonJS:

```ts
import osEncoding = require('os-encoding');

const encoding: string = osEncoding();
```

To inspect environment variables without running a command:

```js
const encoding = osEncoding(true);
```

The result is an encoding label for use with a compatible text decoder. The library reads system settings; it does not inspect file contents or identify the language of text.

## API

### `osEncoding(envOnly?: boolean): string`

Returns an encoding label, or `UTF-8` when detection is unavailable. `envOnly` defaults to `false`.

| Argument | Behavior |
| --- | --- |
| `false` or omitted | Read the locale environment variables, then query the platform if needed. |
| `true` | Read only the locale environment variables; return `UTF-8` if they do not identify an encoding. |

The first nonempty variable in **`LC_ALL` → `LC_CTYPE` → `LANG`** order selects the character locale, following [POSIX locale precedence](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html). A higher priority variable takes precedence even when it contains no encoding.

Supported locale forms include:

- Named codesets: `ja_JP.EUC-JP` returns `EUC-JP`. A modifier such as `@euro` is ignored.
- Numeric Windows code pages: `Russian_Russia.1251` and `.1251` return `windows-1251`. Leading zeros are accepted.
- UTF-8 values: `en_US.utf8`, `.UTF8`, and standalone `UTF-8` are recognized.

Named codesets preserve their spelling and case: `en_US.utf8` returns `utf8`. Numeric code pages are mapped to encoding names: `.65001` returns `UTF-8`. Explicit codesets are recognized on all supported platforms.

When the selected locale does not identify an encoding, default mode uses the following fallback:

| Platform | Query | Example result |
| --- | --- | --- |
| Windows | Active console code page, using `chcp` | `GBK` for code page 936 |
| macOS / Linux | Character locale codeset, using `locale charmap` | `UTF-8` |

If the platform query fails, returns invalid output, or reports an unknown Windows code page, the result is `UTF-8`.

## Locale examples

These are example values of the selected locale variable and the labels returned by `osEncoding(true)`:

| Locale value | Result |
| --- | --- |
| `zh_CN.GB18030` | `GB18030` |
| `Chinese_China.936` | `GBK` |
| `zh_TW.Big5` | `Big5` |
| `ja_JP.EUC-JP` | `EUC-JP` |
| `Japanese_Japan.932` | `Shift_JIS` |
| `ko_KR.EUC-KR` | `EUC-KR` |
| `Russian_Russia.1251` | `windows-1251` |
| `uk_UA.KOI8-U` | `KOI8-U` |
| `Greek_Greece.1253` | `windows-1253` |
| `Arabic_Saudi Arabia.1256` | `windows-1256` |
| `he_IL.ISO-8859-8` | `ISO-8859-8` |
| `tr_TR.ISO-8859-9` | `ISO-8859-9` |
| `Vietnamese_Vietnam.1258` | `windows-1258` |
| `Thai_Thailand.874` | `windows-874` |
| `de_DE.ISO-8859-15@euro` | `ISO-8859-15` |
| `.65001` | `UTF-8` |
| `UTF-8` | `UTF-8` |

Other explicit named codesets are accepted too. A language or country alone does not determine an encoding: for example, `zh_CN` may use different codesets on different systems. Default mode asks the platform for such locales; environment-only mode returns `UTF-8`.

## Behavior notes

- **Locale precedence:** with `LC_ALL=C` and `LANG=zh_CN.GBK`, default mode queries the platform. `osEncoding(true)` returns the `UTF-8` fallback; it does not use the lower priority `LANG` value. The same rule applies to `POSIX`, unknown numeric code pages, and malformed codesets.
- **Windows console:** [`chcp` reports the active console code page](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/chcp), which may differ from the encoding used by a legacy application. Locale environment variables take precedence on Windows too.
- **Decoder compatibility:** returned labels are not checked against a particular decoder's supported encodings. Use a decoder that accepts the returned label. The fallback `UTF-8` is a default, not proof of the encoding of arbitrary bytes.
- **Synchronous calls:** each call reads the current environment. Platform queries block the event loop and have a one-second timeout. Use `osEncoding(true)` to skip commands, or detect once at startup and reuse the result.

## References

- [POSIX locale environment variables](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html) — locale selection and precedence.
- [Windows locale and code page syntax](https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/setlocale-wsetlocale) — forms such as `French_Canada.1252` and `.UTF8`.
- [Windows code page identifiers](https://learn.microsoft.com/en-us/windows/win32/intl/code-page-identifiers) — code page numbers and their encoding names.
- [IANA character set registry](https://www.iana.org/assignments/character-sets/character-sets.xhtml) — registered encoding names and aliases.

## License

[MIT](LICENSE) © SeaLoong
