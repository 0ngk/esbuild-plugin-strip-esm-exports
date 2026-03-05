import { assertEquals } from "@std/assert";
import { stripEsmExports } from "./mod.ts";

Deno.test(function stripSingleLineExportTest() {
  assertEquals(
    stripEsmExports("let foo = 'foo';\nexport { main };\nconst bar = 'bar'"),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripMultiLineExportTest() {
  assertEquals(
    stripEsmExports(
      "let foo = 'foo';\nexport {\n  main\n};\nconst bar = 'bar'",
    ),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripMultiSpecifierExportTest() {
  assertEquals(
    stripEsmExports(
      "let foo = 'foo';\nexport { main, sub };\nconst bar = 'bar'",
    ),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripAliasedExportTest() {
  assertEquals(
    stripEsmExports(
      "let foo = 'foo';\nexport { main as aliasedMain };\nconst bar = 'bar'",
    ),
    "let foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripReExportNamedTest() {
  assertEquals(
    stripEsmExports(
      "const foo = 'foo';\nexport { main } from './x.ts';\nconst bar = 'bar'",
    ),
    "const foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function stripExportAllTest() {
  assertEquals(
    stripEsmExports(
      "const foo = 'foo';\nexport * from './x.ts';\nconst bar = 'bar'",
    ),
    "const foo = 'foo';\nconst bar = 'bar'",
  );
});

Deno.test(function deExportVariableDeclarationTest() {
  assertEquals(
    stripEsmExports("export const foo = 'foo';"),
    "const foo = 'foo';",
  );
});

Deno.test(function deExportFunctionDeclarationTest() {
  assertEquals(
    stripEsmExports("export function main() {}"),
    "function main() {}",
  );
});

Deno.test(function deExportClassDeclarationTest() {
  assertEquals(stripEsmExports("export class Main {}"), "class Main {}");
});

Deno.test(function deExportDefaultNamedFunctionDeclarationTest() {
  assertEquals(
    stripEsmExports("export default function main() {}"),
    "function main() {}",
  );
});

Deno.test(function deExportDefaultNamedClassDeclarationTest() {
  assertEquals(
    stripEsmExports("export default class Main {}"),
    "class Main {}",
  );
});

Deno.test(function deExportDefaultAnonymousFunctionDeclarationTest() {
  assertEquals(
    stripEsmExports("export default function() {}"),
    "(function() {});",
  );
});

Deno.test(function deExportDefaultAnonymousClassDeclarationTest() {
  assertEquals(stripEsmExports("export default class {}"), "(class {});");
});

Deno.test(function deExportDefaultExpressionTest() {
  assertEquals(stripEsmExports("export default 1 + 2;"), "(1 + 2);");
});

Deno.test(function deExportDefaultAnonymousClassWithSemicolonTest() {
  assertEquals(stripEsmExports("export default class {};"), "(class {});");
});

Deno.test(function deExportDefaultObjectExpressionTest() {
  assertEquals(
    stripEsmExports("export default { a: 1, b: 2 };"),
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
    const transformed = stripEsmExports(input);
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
    stripEsmExports("const foo = 'foo';\nexport { foo };\n\nconst bar = 'bar'"),
    "const foo = 'foo';\n\nconst bar = 'bar'",
  );
});
