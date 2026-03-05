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

Deno.test(function stripMultiSpecifierExportTest() {
  assertEquals(
    stripExports("let foo = 'foo';\nexport { main, sub };\nconst bar = 'bar'"),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripAliasedExportTest() {
  assertEquals(
    stripExports(
      "let foo = 'foo';\nexport { main as aliasedMain };\nconst bar = 'bar'",
    ),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripReExportNamedTest() {
  assertEquals(
    stripExports(
      "const foo = 'foo';\nexport { main } from './x.ts';\nconst bar = 'bar'",
    ),
    "const foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripExportAllTest() {
  assertEquals(
    stripExports(
      "const foo = 'foo';\nexport * from './x.ts';\nconst bar = 'bar'",
    ),
    "const foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function deExportVariableDeclarationTest() {
  assertEquals(stripExports("export const foo = 'foo';"), "const foo = 'foo';");
});

Deno.test(function deExportFunctionDeclarationTest() {
  assertEquals(stripExports("export function main() {}"), "function main() {}");
});

Deno.test(function deExportClassDeclarationTest() {
  assertEquals(stripExports("export class Main {}"), "class Main {}");
});

Deno.test(function deExportDefaultNamedFunctionDeclarationTest() {
  assertEquals(
    stripExports("export default function main() {}"),
    "function main() {}",
  );
});

Deno.test(function deExportDefaultNamedClassDeclarationTest() {
  assertEquals(stripExports("export default class Main {}"), "class Main {}");
});

Deno.test(function deExportDefaultAnonymousFunctionDeclarationTest() {
  assertEquals(
    stripExports("export default function() {}"),
    "(function() {});",
  );
});

Deno.test(function deExportDefaultAnonymousClassDeclarationTest() {
  assertEquals(stripExports("export default class {}"), "(class {});");
});

Deno.test(function deExportDefaultExpressionTest() {
  assertEquals(stripExports("export default 1 + 2;"), "(1 + 2);");
});

Deno.test(function deExportDefaultAnonymousClassWithSemicolonTest() {
  assertEquals(stripExports("export default class {};"), "(class {});");
});

Deno.test(function deExportDefaultObjectExpressionTest() {
  assertEquals(
    stripExports("export default { a: 1, b: 2 };"),
    "({ a: 1, b: 2 });",
  );
});

Deno.test(function transformedDefaultOutputsAreParsableTest() {
  for (
    const input of [
      "export default class {};",
      "export default { a: 1, b: 2 };",
    ]
  ) {
    const transformed = stripExports(input);
    try {
      // Validate transformed code as Script source.
      new Function(transformed);
    } catch (error) {
      throw new Error(
        `Transformed output is not parseable: ${transformed}: ${
          (error as Error).message
        }`,
      );
    }
  }
});

Deno.test(function trimOneLineAfterRemovedExportTest() {
  assertEquals(
    stripExports("const foo = 'foo';\nexport { foo };\n\nconst bar = 'bar'"),
    "const foo = 'foo';\n\nconst bar = 'bar'",
  );
});
