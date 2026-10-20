# os-encoding

[![NPM Version](https://img.shields.io/npm/v/os-encoding)](https://www.npmjs.com/package/os-encoding) [![NPM Downloads](https://img.shields.io/npm/dm/os-encoding)](https://www.npmjs.com/package/os-encoding) [![Tests](https://img.shields.io/github/actions/workflow/status/SeaLoong/os-encoding/test.yml?label=tests)](https://github.com/SeaLoong/os-encoding/actions/workflows/test.yml)

A small, synchronous Node.js library that detects an encoding label from the current process's locale or Windows console. Supports Windows, macOS, and Linux, with no runtime dependencies.

## Installation

```sh
npm install os-encoding
```

## Usage

CommonJS:

```js
const osEncoding = require('os-encoding');

const encoding = osEncoding(); // For example: 'UTF-8', 'GBK', or 'Shift_JIS'
console.log(encoding);

const envEncoding = osEncoding(true); // Environment variables only; never runs a command
```

ES modules:

```js
import osEncoding from 'os-encoding';

console.log(osEncoding());
```

TypeScript declarations are included.

## API

### `osEncoding(envOnly?: boolean): string`

Returns an encoding label. `envOnly` defaults to `false`.

Detection follows these steps on every call:

1. Select the first nonempty locale variable: **`LC_ALL` → `LC_CTYPE` → `LANG`**, following [POSIX locale precedence](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html).
2. If that value contains a `.codeset` suffix, return the codeset, preserving its casing and removing any `@modifier`. For example, `de_DE.ISO-8859-1@euro` returns `ISO-8859-1`.
3. If `envOnly` is `true`, return `UTF-8`.
4. Otherwise, run the platform command below and return its result.
5. Return `UTF-8` if the command fails, its output is invalid, or a Windows code page is unknown.

| Platform | Command fallback | Example result |
| --- | --- | --- |
| Windows | `chcp`, mapped to an encoding label | `GBK` for code page 936 |
| macOS / Linux | `locale charmap` | `UTF-8` |

A higher priority locale variable takes precedence even when it has no explicit codeset. For example, with `LC_ALL=C` and `LANG=en_US.UTF-8`, default mode asks the platform command; environment-only mode returns the `UTF-8` fallback. The charset of `C`, `POSIX`, and other locale names without a codeset is determined by the platform command.

### Semantics and performance

On Windows, [`chcp` reports the active console code page](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/chcp). This can differ from the Windows ANSI code page used by legacy applications. Locale environment variables take precedence on Windows too.

Encoding labels are not normalized: `en_US.utf8` returns `utf8`, while code page 65001 returns `UTF-8`. Choose a decoder that accepts the returned label when converting bytes to text. The `UTF-8` fallback is a default when detection is unavailable.

The function is synchronous and reads the current environment on each call. Command fallbacks block the event loop and have a one second timeout. Use `osEncoding(true)` when commands should be skipped, or call once at startup and reuse the result in performance sensitive code.

## Development

Install dependencies with Yarn Classic using the committed lockfile, then run the tests:

```sh
yarn --frozen-lockfile
yarn test
npm pack --dry-run
```

The tests cover locale precedence, parsing, platform commands, and fallback behavior with stubs, plus smoke checks against the host platform. CI runs on Windows, macOS, and Linux with Node.js 22 and 24.

## Releasing

Maintainers publish through the tag-triggered [publish workflow](.github/workflows/publish.yml):

1. Commit changes, run the checks above, and incorporate any upstream commits. The release script requires a clean working tree and a branch with an upstream; it accepts local commits ahead of upstream, and rejects a branch that is behind or has diverged.
2. Run `yarn release` and choose a new version at the prompts. The script updates `package.json`, commits it, creates an annotated `v<version>` tag, and atomically pushes the current branch and that tag.
3. Check [GitHub Actions](https://github.com/SeaLoong/os-encoding/actions/workflows/publish.yml). The workflow verifies the tag matches `package.json`, runs tests on all supported platforms, publishes to npm, and then creates the GitHub Release. Stable versions use the npm `latest` tag; prerelease versions use `next` and a GitHub prerelease.

The npm package's Trusted Publisher must point to `SeaLoong/os-encoding` and workflow filename `publish.yml`, allow `npm publish`, and leave Environment name empty. The publish job uses GitHub Actions OIDC with `id-token: write`; an npm token is not required. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for setup.

A successful release script run means the tag was pushed; check the workflow to confirm npm publication. If a local commit, tag, or push step fails, inspect the retained local state before retrying. The workflow preserves the tag on failure. Correct registry permissions or network issues and rerun failed jobs for that tag; changes to tagged source or workflow require a new version and tag. Published npm versions are immutable.

## License

[MIT](LICENSE) © SeaLoong
