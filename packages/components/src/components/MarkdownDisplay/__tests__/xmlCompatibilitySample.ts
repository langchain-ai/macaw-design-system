/**
 * Representative Run Details input and the Markdown emitted by its
 * prepareMarkdownText adapter at dec09b917fddc52c73c7cba750869d432adaff64.
 * Both raw section mode and already-prepared input preserve these semantics.
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

// CDATA protects payload tags from being interpreted as XML section structure.
export const CDATA_SOURCE = `<input><![CDATA[
# Payload
Literal <reasoning>do not relabel</reasoning> & &lt;tag&gt;.
Inline \`<tool> & value\` stays literal.
Split terminator: ]]]]><![CDATA[>.
\`\`\`xml
<tool>fenced & literal</tool>
\`\`\`
]]></input>
<reasoning>
After the payload.
</reasoning>`;
