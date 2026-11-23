import { expect, test } from 'vitest';

import { designFindings, newDesignFindings } from './design-rules.mjs';

const rules = (findings) => findings.map(({ rule }) => rule);

test('checks color, primitive, spacing, stacking, and unknown token literals', () => {
  const findings = designFindings(
    'Control.tsx',
    `
    const style = { color: '#ffffff', zIndex: 22 };
    const ui = <div className="bg-neutral-100 gap-4 z-[9]" style={style} />;
    const colors = ['var(--neutral-100)', 'var(--missing)'];
  `,
    new Set(['--neutral-100'])
  );
  expect(new Set(rules(findings))).toEqual(
    new Set([
      'raw-color',
      'primitive-token',
      'spacing-scale',
      'z-index',
      'unknown-token',
    ])
  );
});

test('checks template branches and allows semantic references and zero spacing', () => {
  expect(
    designFindings(
      'Control.tsx',
      'const ui = <div className={`gap-space-4 p-0 ${active ? "bg-elevated" : "bg-popover"}`} />;'
    )
  ).toEqual([]);
  expect(
    designFindings(
      'Control.tsx',
      'const classes = `gap-2 ${active ? "p-4" : "p-space-4"}`;'
    )
      .map(({ value }) => value)
      .sort()
  ).toEqual(['gap-2', 'p-4']);
});

test('CSS definitions may bind primitives; declarations must use known roles', () => {
  expect(
    designFindings(
      'base.css',
      ':root { --private: #ffffff; } .control { color: var(--text-primary); gap: var(--space-4); }',
      new Set(['--text-primary', '--space-4'])
    )
  ).toEqual([]);
  expect(
    rules(
      designFindings(
        'base.css',
        '.control { color: #ffffff; background: var(--neutral-100); }'
      )
    )
  ).toEqual(['raw-color', 'primitive-token']);
});

test('baseline allowances cannot pay for a different literal, rule, file, or added occurrence', () => {
  const allowed = { file: 'Control.tsx', rule: 'raw-color', value: '#ffffff' };
  const baseline = [{ ...allowed, count: 1 }];
  expect(newDesignFindings([allowed], baseline)).toEqual([]);
  for (const changed of [
    { ...allowed, value: '#000000' },
    { ...allowed, file: 'Other.tsx' },
    { ...allowed, rule: 'primitive-token' },
  ]) {
    expect(newDesignFindings([changed], baseline)).toEqual([changed]);
  }
  expect(newDesignFindings([allowed, allowed], baseline)).toHaveLength(1);
});

test('semantic color channels and external Radix variables remain usable', () => {
  expect(
    designFindings(
      'Control.tsx',
      'const styles = ["hsl(var(--background))", "var(--radix-popover-trigger-width)"];',
      new Set(['--background'])
    )
  ).toEqual([]);
});

test('invalid source cannot silently pass', () => {
  expect(() => designFindings('Control.tsx', 'const = ;')).toThrow(
    /invalid source/
  );
});
