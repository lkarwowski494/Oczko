import ts from 'typescript';
import fs from 'fs';
import path from 'path';

describe('słownik bez martwych kluczy (NFR-I18N-002, TST-08)', () => {
  test('każdy klucz w src/core/i18n.en.ts występuje jako literał w app/, src/', () => {
    const root = path.join(__dirname, '..');
    const walk = (d: string, out: string[] = []): string[] => {
      if (!fs.existsSync(d)) return out;
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
          if (f !== 'node_modules' && f !== '.expo' && f !== 'scratch' && f !== 'trening_readonly') {
            walk(p, out);
          }
        } else {
          out.push(p);
        }
      }
      return out;
    };

    const files = ['app', 'src'].flatMap(d => walk(path.join(root, d))).filter(f => !/i18n(\.en)?\.ts$/.test(f) && !/\.test\.(ts|tsx)$/.test(f));
    const lits = new Set<string>();
    let raw = '';

    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      if (/\.(tsx?|jsx?)$/.test(f)) {
        const v = (n: any) => {
          if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
            lits.add(n.text);
          }
          ts.forEachChild(n, v);
        };
        v(ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, /x$/.test(f) ? ts.ScriptKind.TSX : ts.ScriptKind.TS));
      } else {
        raw += src;
      }
    }

    const enPath = path.join(root, 'src', 'core', 'i18n.en.ts');
    const enSrc = fs.readFileSync(enPath, 'utf8');
    const keys: string[] = [];
    const k = (n: any) => {
      if (ts.isPropertyAssignment(n) && (ts.isStringLiteral(n.name) || ts.isIdentifier(n.name))) {
        keys.push(n.name.text);
      }
      ts.forEachChild(n, k);
    };
    k(ts.createSourceFile('en.ts', enSrc, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));

    const deadKeys = keys.filter(x => !lits.has(x) && !raw.includes(x));
    expect(deadKeys).toEqual([]);
  });
});
