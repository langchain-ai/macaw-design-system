/**
 * Representative Run Details input and the Markdown emitted by its
 * prepareMarkdownText adapter. Application-specific XML interpretation stays
 * in that adapter; MarkdownDisplay accepts its prepared output unchanged.
 */
export const XML_SOURCE = `<reasoning>
# Plan
- **Inspect** the [docs](https://docs.langchain.com)
<input>
<example>Nested content</example>
</input>
\`\`\`xml
<reasoning>Keep code literal</reasoning>
\`\`\`
</reasoning>
# Answer`;

export const PREPARED_XML = `> **[reasoning]**
> # Plan
> - **Inspect** the [docs](https://docs.langchain.com)
>
> > **[input]**
> > **[example]** Nested content
>
> \`\`\`xml
> <reasoning>Keep code literal</reasoning>
> \`\`\`

# Answer`;
