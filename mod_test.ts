import { assertEquals } from "@std/assert";
import { stripExports } from "./mod.ts";

Deno.test(function stripSingleLineExportTest() {
  assertEquals(
    stripExports("let foo = 'foo';\nexport { main };\nconst bar = 'bar'"),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripMultiLineExportTest() {
  assertEquals(
    stripExports("let foo = 'foo';\nexport {\n  main\n};\nconst bar = 'bar'"),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function preserveMultiSpecifierExportTest() {
  assertEquals(
    stripExports("let foo = 'foo';\nexport { main, sub };\nconst bar = 'bar'"),
    "let foo = 'foo';\nexport { main, sub };\nconst bar = 'bar'",
  );
});

Deno.test(function preserveAliasedExportTest() {
  assertEquals(
    stripExports(
      "let foo = 'foo';\nexport { main as aliasedMain };\nconst bar = 'bar'",
    ),
    "let foo = 'foo';\nexport { main as aliasedMain };\nconst bar = 'bar'",
  );
});
