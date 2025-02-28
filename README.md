# os-encoding

[![npmjs](https://github.com/SeaLoong/os-encoding/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/SeaLoong/os-encoding/actions/workflows/npm-publish.yml)

A cross-platform Node.js library to get the system's default character encoding.  
Supports **Windows**, **macOS**, and **Linux**.

## Installation

```bash
npm install os-encoding
```

## Usage

```javascript
const osEncoding = require('os-encoding');

// Get the system's default character encoding
console.log(osEncoding());
// Outputs: 'UTF-8', 'GBK', 'Windows-1252', etc.

console.log(`System encoding: ${osEncoding()}`);
// Output on Chinese Windows: "System encoding: GBK"
// Output on macOS/Linux: "System encoding: UTF-8"
```

## API

### `osEncoding([envOnly]): string`

Detects the system's default character encoding.

Returns the encoding name directly as reported by the OS or environment.

#### Parameters

| Parameter | Type      | Default | Description                                                                                                                   |
| --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `envOnly` | `boolean` | `false` | If `true`, only checks environment variables (`LANG`/`LC_ALL`) and skips executing fallback commands like `locale` or `chcp`. |

#### Returns

- **Type**: `string`
- **Description**:
  - Raw encoding name (e.g., `UTF-8`, `Shift_JIS`, `GBK`).
  - Fallback: Returns `UTF-8` if detection fails.

#### Platform-Specific Behavior

| Platform    | `envOnly: true` Behavior                                  | `envOnly: false` (Default) Behavior      |
| ----------- | --------------------------------------------------------- | ---------------------------------------- |
| **Windows** | Ignores `chcp` command. Returns `UTF-8` if no env vars.   | Uses `chcp` when env vars are missing.   |
| **macOS**   | Ignores `locale` command. Returns `UTF-8` if no env vars. | Uses `locale` when env vars are missing. |
| **Linux**   | Same as macOS.                                            | Same as macOS.                           |

#### Notes

- **Original Casing**:
  Encoding names retain their OS-defined format:

  - `UTF-8` (uppercase with hyphen)
  - `Shift_JIS` (underscore)
  - `Windows-1252` (platform-specific casing)

- **Detection Priority**:
  1. Uses `LANG` or `LC_ALL` environment variables (macOS/Linux).
  2. Falls back to `locale` command or Windows `chcp` if environment variables are missing.

## License

MIT
