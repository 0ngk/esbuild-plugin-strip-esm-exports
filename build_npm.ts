import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  compilerOptions: {
    lib: ["ESNext"],
  },
  shims: {
    deno: true,
  },
  package: {
    name: "esbuild-plugin-strip-esm-exports",
    version: Deno.args[0]?.replace(/^v/, ""),
    description:
      "An esbuild plugin that removes ESM export statements from bundled output.",
    keywords: ["esbuild-plugin", "esbuild"],
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/0ngk/esbuild-plugin-strip-esm-exports.git",
    },
    bugs: {
      url: "git+https://github.com/0ngk/esbuild-plugin-strip-esm-exports/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
