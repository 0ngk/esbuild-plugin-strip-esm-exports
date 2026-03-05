import type { BuildResult, Plugin, PluginBuild } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as acornLoose from "acorn-loose";

type Edit = {
  start: number;
  end: number;
  replacement: string;
};

const extendEndToConsumeOneLineBreak = (src: string, end: number): number => {
  if (end >= src.length) return end;

  if (src[end] === "\r" && src[end + 1] === "\n") {
    return end + 2;
  }

  if (src[end] === "\n" || src[end] === "\r") {
    return end + 1;
  }

  return end;
};

const stripOneTrailingSemicolon = (statement: string): string => {
  let trimEndIndex = statement.length;
  while (trimEndIndex > 0 && /\s/u.test(statement[trimEndIndex - 1])) {
    trimEndIndex -= 1;
  }

  if (trimEndIndex > 0 && statement[trimEndIndex - 1] === ";") {
    return statement.slice(0, trimEndIndex - 1) + statement.slice(trimEndIndex);
  }

  return statement;
};

export const stripEsmExports = (src: string) => {
  const ast = (() => {
    try {
      return acornLoose.parse(src, {
        ecmaVersion: "latest",
        sourceType: "module",
      });
    } catch {
      return null;
    }
  })();

  if (ast === null) {
    return src;
  }

  const edits: Edit[] = [];

  for (const node of ast.body) {
    if (node.type === "ExportNamedDeclaration") {
      if (node.declaration) {
        edits.push({
          start: node.start,
          end: node.end,
          replacement: src.slice(node.declaration.start, node.end),
        });
      } else {
        edits.push({
          start: node.start,
          end: extendEndToConsumeOneLineBreak(src, node.end),
          replacement: "",
        });
      }
      continue;
    }

    if (node.type === "ExportAllDeclaration") {
      edits.push({
        start: node.start,
        end: extendEndToConsumeOneLineBreak(src, node.end),
        replacement: "",
      });
      continue;
    }

    if (node.type !== "ExportDefaultDeclaration") {
      continue;
    }

    const declaration = node.declaration;
    const isFunctionOrClass = declaration.type === "FunctionDeclaration" ||
      declaration.type === "ClassDeclaration";
    const hasName = declaration.type === "FunctionDeclaration" ||
        declaration.type === "ClassDeclaration"
      ? declaration.id !== null
      : false;

    if (isFunctionOrClass && hasName) {
      edits.push({
        start: node.start,
        end: node.end,
        replacement: src.slice(declaration.start, node.end),
      });
      continue;
    }

    const defaultStatement = src.slice(declaration.start, node.end);
    edits.push({
      start: node.start,
      end: node.end,
      replacement: `(${stripOneTrailingSemicolon(defaultStatement)});`,
    });
  }

  if (edits.length === 0) {
    return src;
  }

  const sortedEdits = [...edits].sort((a, b) => b.start - a.start);
  let nextSrc = src;

  for (const edit of sortedEdits) {
    nextSrc = nextSrc.slice(0, edit.start) + edit.replacement +
      nextSrc.slice(edit.end);
  }

  return nextSrc;
};

export default function stripEsmExportsPlugin(): Plugin {
  return {
    name: "strip-esm-exports",
    setup(build: PluginBuild) {
      build.initialOptions.write = false;

      build.onEnd(async (result: BuildResult) => {
        const outputFiles = result.outputFiles;
        if (!outputFiles || outputFiles.length === 0) return;

        for (const outputFile of outputFiles) {
          const text = outputFile.text;
          const patched = stripEsmExports(text);

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
