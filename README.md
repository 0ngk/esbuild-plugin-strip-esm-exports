# esbuild-plugin-strip-esm-exports

[![JSR](https://jsr.io/badges/@0ngk/esbuild-plugin-strip-esm-exports)](https://jsr.io/packages/@0ngk/esbuild-plugin-strip-esm-exports)
![npm version](https://img.shields.io/npm/v/esbuild-plugin-strip-esm-exports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An esbuild plugin that removes top-level ESM `export` syntax from generated
output files.

## Installation

```sh
# Deno / JSR
deno add jsr:@0ngk/esbuild-plugin-strip-esm-exports

# pnpm
pnpm add -D esbuild-plugin-strip-esm-exports
```

## Quick Start (esbuild plugin)

```ts
import { build } from "esbuild";
import stripEsmExportsPlugin from "esbuild-plugin-strip-esm-exports";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  outfile: "dist/index.js",
  plugins: [stripEsmExportsPlugin()],
});
```

The plugin forces `write = false` internally, patches each emitted output file,
then writes files back to disk during `onEnd`.

## API

```ts
import stripEsmExportsPlugin, {
  stripEsmExports,
} from "esbuild-plugin-strip-esm-exports";

const transformed: string = stripEsmExports(sourceCode);
const plugin = stripEsmExportsPlugin();
```

`stripEsmExports(src: string): string`

- Pure string-to-string transform.
- Removes or rewrites top-level ESM export declarations.
- If parsing fails, returns the original `src` unchanged.

`stripEsmExportsPlugin(): Plugin`

- esbuild plugin wrapper around `stripEsmExports`.
- Applies the transform to `result.outputFiles` in `onEnd`.
- Writes patched file contents to each output path.

## Transformation Rules

| Input form                          | Output form          |
| ----------------------------------- | -------------------- |
| `export { foo };`                   | removed              |
| `export { foo } from "./mod.js";`   | removed              |
| `export * from "./mod.js";`         | removed              |
| `export const foo = 1;`             | `const foo = 1;`     |
| `export function main() {}`         | `function main() {}` |
| `export class Main {}`              | `class Main {}`      |
| `export default function main() {}` | `function main() {}` |
| `export default class Main {}`      | `class Main {}`      |
| `export default function() {}`      | `(function() {});`   |
| `export default class {}`           | `(class {});`        |
| `export default { a: 1 };`          | `({ a: 1 });`        |

## Caveats

- The transform uses `acorn-loose` with `sourceType: "module"`.
- If parsing fails, output is left unchanged.
- The transform targets top-level ESM export syntax in emitted bundle files.
- The plugin handles file writing itself after transformation, so define
  `outfile` or `outdir` in esbuild options.

## Development

This repository is developed with Deno.

```sh
# Run tests
deno test

# Build npm package artifacts (example version)
deno task build v0.0.1
```

`deno task build` runs `build_npm.ts` (dnt pipeline) and refreshes the `npm/`
directory.

## License

[MIT](LICENSE)
