import { Link } from '../components/Link';
import { Text } from '../components/Text';
import { StoryLink } from './StoryLink';

type AgentSkill = {
  name: string;
  audience: string;
  /** One short sentence. */
  summary: string;
  /** Where the skill's source lives. Public links only; this page is public. */
  source: { label: string; href?: string };
  /** A story that shows what the skill builds. */
  example?: { title: string; name: string };
};

/**
 * Every agent skill that builds with Macaw, one entry per skill. Each skill's
 * text lives in one repository; this list only says what it's for and where it
 * lives.
 */
export const agentSkills: AgentSkill[] = [
  {
    name: 'macaw',
    audience: 'Any app using Macaw',
    summary:
      'Points agents at the installed Macaw docs and the component search CLI.',
    source: { label: 'pnpm exec macaw init' },
  },
  {
    name: 'design-system',
    audience: 'Macaw contributors',
    summary: 'Changes Macaw itself: components, tokens, stories, and docs.',
    source: {
      label: '.agents/skills',
      href: 'https://github.com/langchain-ai/macaw-design-system/blob/main/.agents/skills/design-system/SKILL.md',
    },
  },
  {
    name: 'macaw-create-settings',
    audience: 'LangSmith engineers',
    summary: 'Builds and polishes LangSmith settings pages from the recipes.',
    source: { label: 'LangSmith app repository' },
    example: { title: 'Recipes/Settings Pages', name: 'CTA + table' },
  },
];

const skillHomes = [
  {
    title: 'Any Macaw app',
    home: 'Macaw CLI',
    detail: 'macaw init installs it with the package version.',
  },
  {
    title: 'Macaw itself',
    home: '.agents/skills here',
    detail: 'Components, tokens, and docs work.',
  },
  {
    title: 'One product',
    home: 'That product’s repository',
    detail: 'Next to the code it describes. Recipes go here.',
  },
];

export function AgentSkillsPage() {
  return (
    <main className="min-h-screen bg-surface-level-1 text-primary">
      <div className="mx-auto flex max-w-5xl flex-col gap-space-7 px-space-5 py-space-6 sm:px-space-7">
        <header className="flex max-w-2xl flex-col gap-space-2">
          <Text as="h1" variant="h1">
            Agent Skills
          </Text>
          <Text color="secondary">
            Instructions a coding agent loads when a task matches, so
            agent-built UI follows the same rules as hand-built UI.
          </Text>
        </header>

        <section aria-labelledby="skills" className="flex flex-col gap-space-4">
          <Text as="h2" id="skills" variant="h2" weight="semibold">
            Skills
          </Text>
          <ul className="m-0 grid list-none grid-cols-1 gap-space-3 p-0 md:grid-cols-3">
            {agentSkills.map((skill) => (
              <li
                key={skill.name}
                className="flex min-w-0 flex-col gap-space-4 rounded-lg bg-surface-level-2 p-space-4"
              >
                <div className="flex flex-col gap-space-2">
                  <Text variant="xs" weight="medium" color="tertiary">
                    {skill.audience}
                  </Text>
                  <Text as="h3" variant="h3" className="font-mono">
                    {skill.name}
                  </Text>
                  <Text variant="sm" color="secondary">
                    {skill.summary}
                  </Text>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-space-3 gap-y-space-1 border-t border-subtle pt-space-3">
                  {skill.source.href ? (
                    <Link
                      href={skill.source.href}
                      target="_blank"
                      rel="noreferrer"
                      variant="xs"
                      className="font-mono"
                    >
                      {skill.source.label}
                    </Link>
                  ) : (
                    <Text variant="xs" color="tertiary" className="font-mono">
                      {skill.source.label}
                    </Text>
                  )}
                  {skill.example && (
                    <StoryLink
                      title={skill.example.title}
                      name={skill.example.name}
                      variant="xs"
                    >
                      See recipes
                    </StoryLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="adding-a-skill"
          className="flex flex-col gap-space-4"
        >
          <div className="flex flex-col gap-space-1">
            <Text as="h2" id="adding-a-skill" variant="h2" weight="semibold">
              Where a new skill goes
            </Text>
            <Text variant="sm" color="secondary">
              Each skill has one home, chosen by who uses it.
            </Text>
          </div>
          <ol className="m-0 grid list-none grid-cols-1 gap-space-3 p-0 md:grid-cols-3">
            {skillHomes.map((item) => (
              <li
                key={item.title}
                className="flex min-w-0 flex-col gap-space-1 rounded-lg border border-subtle p-space-4"
              >
                <Text as="h3" variant="h4">
                  {item.title}
                </Text>
                <Text variant="sm" weight="medium">
                  {item.home}
                </Text>
                <Text variant="sm" color="tertiary">
                  {item.detail}
                </Text>
              </li>
            ))}
          </ol>
          <Text variant="sm" color="tertiary">
            Then list it here: add an entry to <code>agentSkills</code> in{' '}
            <code>docs/agentSkills.tsx</code>.
          </Text>
        </section>
      </div>
    </main>
  );
}
