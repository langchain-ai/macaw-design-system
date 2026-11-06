import { describe, expect, test } from 'vitest';

import { render } from '../../../test-utils';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { prepareMarkdownXml } from '../prepareMarkdownXml';
import { findDomRange, readSearchableDom } from './runDetailsSearchContract';
import cases from './runDetailsXmlCases.json';

// Expected preparation and search text were captured by running the actual
// prepareMarkdownText/searchableText at the revision in runDetailsSearchContract.
describe('Run Details compatibility', () => {
  test.each(cases)('$name', ({ source, prepared, searchable }) => {
    expect(prepareMarkdownXml(source)).toBe(prepared);
    const { container } = render(
      <MarkdownDisplay content={source} xmlTags="sections" preserveNewlines />
    );
    expect(readSearchableDom(container).text).toBe(searchable);
  });

  test('finds the correct repeated phrase across formatting', () => {
    const { container } = render(
      <MarkdownDisplay
        content="A **foo** bar then foo *bar*."
        xmlTags="sections"
      />
    );
    expect(
      findDomRange(
        container,
        'A foo bar then foo bar.',
        'FOO bar',
        1
      )?.toString()
    ).toBe('foo bar');
  });
});
