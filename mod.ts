import type { BuildResult, Plugin, PluginBuild } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const stripExports = (src: string) => {
  const exportPattern = /(?:\r?\n)*export\s*\{\s*[\w$]+\s*\};/;
  return src.replace(exportPattern, "");
};

export default function stripExportsPlugin(): Plugin {
  return {
    name: "strip-esm-exports",
    setup(build: PluginBuild) {
      build.initialOptions.write = false;

      build.onEnd(async (result: BuildResult) => {
        const outputFiles = result.outputFiles;
        if (!outputFiles || outputFiles.length === 0) return;

        for (const outputFile of outputFiles) {
          const text = outputFile.text;
          const patched = stripExports(text);

          if (patched !== text) {
            outputFile.contents = new TextEncoder().encode(patched);
          }

          await mkdir(path.dirname(outputFile.path), { recursive: true });
          await writeFile(outputFile.path, outputFile.contents, {
            encoding: "utf-8",
          });
        }
      });
    },
  };
}
