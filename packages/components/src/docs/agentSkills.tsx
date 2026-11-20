import { linkTo } from '@storybook/addon-links';

import { Badge } from '../components/Badge';
import { Link } from '../components/Link';
import { Text } from '../components/Text';

type AgentSkill = {
  name: string;
  audience: 'Macaw apps' | 'Macaw contributors' | 'LangSmith engineers';
  summary: string;
  useWhen: string;
  /** Where the skill's source lives. Public links only; this page is public. */
  source: { label: string; href?: string };
  /** A Storybook story that shows what the skill builds. */
  story?: { title: string; name: string; label: string };
};

/**
 * Every agent skill that builds with Macaw. Add one entry per skill. Each
 * skill's text lives in one repository; this list only says what it's for and
 * where to find it.
 */
export const agentSkills: AgentSkill[] = [
  {
    name: 'macaw',
    audience: 'Macaw apps',
    summary:
      'Points agents at the installed version’s component, styling, and token guidance, and the CLI for finding components.',
    useWhen: 'Building any UI in an app that depends on Macaw.',
    source: { label: 'Created by pnpm exec macaw init' },
  },
  {
    name: 'design-system',
    audience: 'Macaw contributors',
    summary:
      'Changing Macaw itself: components, tokens, styles, icons, stories, package exports, and docs.',
    useWhen: 'Working in this repository.',
    source: {
      label: '.agents/skills/design-system',
      href: 'https://github.com/langchain-ai/macaw-design-system/blob/main/.agents/skills/design-system/SKILL.md',
    },
  },
  {
    name: 'macaw-create-settings',
    audience: 'LangSmith engineers',
    summary:
      'Builds or polishes a LangSmith settings page: picks the layout, decides when each setting saves, places filters, tabs, and views, covers every state, and registers the page in navigation and search.',
    useWhen: 'Adding or changing a page in LangSmith settings.',
    source: { label: 'LangSmith app repository (internal)' },
    story: {
      title: 'Recipes/Settings Pages',
      name: 'CTA + table',
      label: 'Recipes/Settings Pages',
    },
  },
];

export function AgentSkillList() {
  return (
    <ul className="m-0 flex list-none flex-col gap-space-3 p-0">
      {agentSkills.map((skill) => (
        <li
          key={skill.name}
          className="flex min-w-0 flex-col gap-space-2 rounded-lg border border-subtle bg-surface-level-1 p-space-4"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-space-2">
            <Text as="h3" variant="h4" className="font-mono">
              {skill.name}
            </Text>
            <Badge size="sm" rounded="xs" color="secondary">
              {skill.audience}
            </Badge>
          </div>
          <Text as="p" variant="sm" color="secondary">
            {skill.summary}
          </Text>
          <dl className="m-0 grid min-w-0 gap-x-space-4 gap-y-space-1 sm:grid-cols-[6rem_minmax(0,1fr)]">
            <dt>
              <Text as="span" variant="sm" weight="medium">
                Use when
              </Text>
            </dt>
            <dd className="m-0 min-w-0">
              <Text as="span" variant="sm" color="secondary">
                {skill.useWhen}
              </Text>
            </dd>
            <dt>
              <Text as="span" variant="sm" weight="medium">
                Source
              </Text>
            </dt>
            <dd className="m-0 min-w-0">
              {skill.source.href ? (
                <Link
                  href={skill.source.href}
                  target="_blank"
                  rel="noreferrer"
                  variant="sm"
                >
                  {skill.source.label}
                </Link>
              ) : (
                <Text as="span" variant="sm" color="secondary">
                  {skill.source.label}
                </Text>
              )}
            </dd>
            {skill.story && (
              <>
                <dt>
                  <Text as="span" variant="sm" weight="medium">
                    Example
                  </Text>
                </dt>
                <dd className="m-0 min-w-0">
                  <Link
                    href={`?path=/story/${storyId(skill.story.title, skill.story.name)}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (skill.story)
                        linkTo(skill.story.title, skill.story.name)();
                    }}
                    variant="sm"
                  >
                    {skill.story.label}
                  </Link>
                </dd>
              </>
            )}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function storyId(title: string, name: string) {
  const slug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  return `${slug(title)}--${slug(name)}`;
}
