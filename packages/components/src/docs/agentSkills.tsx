import type { ReactNode } from 'react';

import { AppWindowIcon } from '@phosphor-icons/react/dist/ssr/AppWindow';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SwatchesIcon } from '@phosphor-icons/react/dist/ssr/Swatches';

import { Icon, type IconComponent } from '../components/Icon';
import { Text } from '../components/Text';
import { cn } from '../utils/cn';
import { StoryLink } from './StoryLink';

type AgentSkill = {
  name: string;
  icon: IconComponent;
  /** The skill's SKILL.md on GitHub. Public repositories only, since this page is public. */
  repo?: string;
  /** When an agent loads it, as one sentence. */
  loadsWhen: string;
  /** How a project gets the skill. */
  getIt: ReactNode;
  /** A story that shows what the skill builds. */
  example?: { title: string; name: string; label: string };
};

/**
 * Every agent skill that builds with Macaw, one entry per skill. Each skill's
 * text lives in one repository, and this list only says what it's for.
 */
const MACAW_BLOB =
  'https://github.com/langchain-ai/macaw-design-system/blob/main';

export const agentSkills: AgentSkill[] = [
  {
    name: 'frontend-settings-pages',
    icon: GearSixIcon,
    loadsWhen: 'Loads when you build or change a LangSmith settings page.',
    getIt: 'Included in the LangSmith repository.',
    example: {
      title: 'Design System Examples/Settings',
      name: 'CTA + table',
      label: 'See the recipes',
    },
  },
  {
    name: 'design-system',
    icon: SwatchesIcon,
    repo: `${MACAW_BLOB}/.agents/skills/design-system/SKILL.md`,
    loadsWhen:
      'Loads when you change Macaw itself, like its components, tokens, stories, or docs.',
    getIt: 'Included in this repository.',
  },
  {
    name: 'macaw',
    icon: AppWindowIcon,
    repo: `${MACAW_BLOB}/packages/cli/templates/SKILL.md`,
    loadsWhen:
      'Loads for UI work in an app that uses Macaw, outside LangSmith.',
    getIt: (
      <>
        Add it by running <code>pnpm exec macaw init</code> in that app.
      </>
    ),
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
            An agent loads a skill on its own when a task matches it. In Claude
            Code you can also run one by name, like{' '}
            <code>/frontend-settings-pages</code>.
          </Text>
        </header>

        <ul
          aria-label="Skills"
          className="m-0 grid list-none grid-cols-1 gap-space-3 p-0 md:grid-cols-3"
        >
          {agentSkills.map((skill) => (
            <li
              key={skill.name}
              className={cn(
                'relative flex min-w-0 flex-col gap-space-4 rounded-lg bg-surface-level-2 p-space-4',
                skill.repo &&
                  'transition-colors duration-normal hover:bg-surface-level-2-hover motion-reduce:transition-none'
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-md border border-subtle bg-surface-level-1">
                <Icon
                  icon={skill.icon}
                  size="md"
                  weight="fill"
                  className="text-icon-secondary"
                />
              </span>
              <div className="flex flex-col gap-space-1">
                <Text as="h2" variant="md" weight="semibold">
                  {skill.repo ? (
                    // The link covers the card, so the whole card opens the skill.
                    <a
                      href={skill.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-focus"
                    >
                      {skill.name}
                    </a>
                  ) : (
                    skill.name
                  )}
                </Text>
                <Text variant="sm" color="secondary">
                  {skill.loadsWhen}
                </Text>
                <Text variant="sm" color="tertiary">
                  {skill.getIt}
                </Text>
              </div>
              {skill.example && (
                <span className="relative">
                  <StoryLink
                    title={skill.example.title}
                    name={skill.example.name}
                    variant="sm"
                  >
                    {skill.example.label}
                  </StoryLink>
                </span>
              )}
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="adding-a-skill"
          className="flex max-w-2xl flex-col gap-space-1"
        >
          <Text as="h2" id="adding-a-skill" variant="h3">
            Adding a skill
          </Text>
          <Text variant="sm" color="secondary">
            Put a skill next to the code it describes. Skills for a product’s
            pages go in that product’s repository, skills for changing Macaw go
            in this one, and guidance for every app goes in the Macaw CLI
            template. Then list it here in <code>agentSkills.tsx</code>.
          </Text>
        </section>
      </div>
    </main>
  );
}
