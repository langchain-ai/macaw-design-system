import assert from 'node:assert/strict';
import { test } from 'node:test';

import { designFindings, newDesignFindings } from './design-rules.mjs';

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
  for (const rule of [
    'raw-color',
    'primitive-token',
    'spacing-scale',
    'z-index',
    'unknown-token',
  ]) {
    assert.ok(
      findings.some((finding) => finding.rule === rule),
      rule
    );
  }
});

test('checks template branches and allows semantic references and zero spacing', () => {
  assert.equal(
    designFindings(
      'Control.tsx',
      'const ui = <div className={`gap-space-4 p-0 ${active ? "bg-elevated" : "bg-popover"}`} />;'
    ).length,
    0
  );
  assert.ok(
    designFindings(
      'Control.tsx',
      'const classes = `gap-2 ${active ? "p-4" : "p-space-4"}`;'
    ).some(({ value }) => value === 'gap-2')
  );
});

test('CSS definitions may bind primitives; declarations must use known roles', () => {
  assert.deepEqual(
    designFindings(
      'base.css',
      ':root { --private: #ffffff; } .control { color: var(--text-primary); gap: var(--space-4); }',
      new Set(['--text-primary', '--space-4'])
    ),
    []
  );
  assert.equal(
    designFindings(
      'base.css',
      '.control { color: #ffffff; background: var(--neutral-100); }'
    ).length,
    2
  );
});

test('legacy allowances cannot pay for a different literal, rule, file, or added occurrence', () => {
  const allowed = { file: 'Control.tsx', rule: 'raw-color', value: '#ffffff' };
  const baseline = [{ ...allowed, count: 1 }];
  assert.deepEqual(newDesignFindings([allowed], baseline), []);
  for (const changed of [
    { ...allowed, value: '#000000' },
    { ...allowed, file: 'Other.tsx' },
    { ...allowed, rule: 'primitive-token' },
  ]) {
    assert.deepEqual(newDesignFindings([changed], baseline), [changed]);
  }
  assert.equal(newDesignFindings([allowed, allowed], baseline).length, 1);
});

test('semantic color channels and external Radix variables remain usable', () => {
  assert.deepEqual(
    designFindings(
      'Control.tsx',
      'const styles = ["hsl(var(--background))", "var(--radix-popover-trigger-width)"];',
      new Set(['--background'])
    ),
    []
  );
});

test('invalid source cannot silently pass', () => {
  assert.throws(
    () => designFindings('Control.tsx', 'const = ;'),
    /invalid source/
  );
});
