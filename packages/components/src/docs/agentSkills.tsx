import { BirdIcon } from '@phosphor-icons/react/dist/ssr/Bird';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SwatchesIcon } from '@phosphor-icons/react/dist/ssr/Swatches';

import { Icon, type IconComponent } from '../components/Icon';
import { Text } from '../components/Text';
import { StoryLink } from './StoryLink';

type AgentSkill = {
  name: string;
  icon: IconComponent;
  /** One short sentence. */
  summary: string;
  /** A story that shows what the skill builds. */
  example?: { title: string; name: string; label: string };
};

/**
 * Every agent skill that builds with Macaw, one entry per skill. Each skill's
 * text lives in one repository; this list only says what it's for.
 */
export const agentSkills: AgentSkill[] = [
  {
    name: 'macaw',
    icon: BirdIcon,
    summary:
      'Points agents at the installed Macaw docs and the component search CLI.',
  },
  {
    name: 'design-system',
    icon: SwatchesIcon,
    summary: 'Changes Macaw itself: components, tokens, stories, and docs.',
  },
  {
    name: 'macaw-create-settings',
    icon: GearSixIcon,
    summary: 'Builds and polishes LangSmith settings pages.',
    example: {
      title: 'Recipes/Settings Pages',
      name: 'CTA + table',
      label: 'See the recipes',
    },
  },
];

const skillHomes = [
  {
    usedBy: 'Any app using Macaw',
    home: 'Ship it with the Macaw CLI, so macaw init installs it.',
  },
  {
    usedBy: 'People changing Macaw',
    home: 'Add it to this repository.',
  },
  {
    usedBy: 'One product',
    home: 'Keep it in that product’s repository, next to its code.',
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

        <ul
          aria-label="Skills"
          className="m-0 grid list-none grid-cols-1 gap-space-3 p-0 md:grid-cols-3"
        >
          {agentSkills.map((skill) => (
            <li
              key={skill.name}
              className="flex min-w-0 flex-col gap-space-4 rounded-lg bg-surface-level-2 p-space-4"
            >
              <span className="flex size-8 items-center justify-center rounded-md border border-subtle bg-surface-level-1">
                <Icon
                  icon={skill.icon}
                  size="md"
                  className="text-icon-secondary"
                />
              </span>
              <div className="flex flex-col gap-space-1">
                <Text
                  as="h2"
                  variant="md"
                  weight="semibold"
                  className="font-mono"
                >
                  {skill.name}
                </Text>
                <Text variant="sm" color="secondary">
                  {skill.summary}
                </Text>
              </div>
              {skill.example && (
                <StoryLink
                  title={skill.example.title}
                  name={skill.example.name}
                  variant="sm"
                >
                  {skill.example.label}
                </StoryLink>
              )}
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="adding-a-skill"
          className="flex max-w-2xl flex-col gap-space-3"
        >
          <Text as="h2" id="adding-a-skill" variant="h3">
            Adding a skill
          </Text>
          <dl className="m-0 grid grid-cols-1 gap-x-space-5 gap-y-space-2 sm:grid-cols-[11rem_minmax(0,1fr)]">
            {skillHomes.map((item) => (
              <div key={item.usedBy} className="contents">
                <dt>
                  <Text as="span" variant="sm" weight="medium">
                    {item.usedBy}
                  </Text>
                </dt>
                <dd className="m-0">
                  <Text as="span" variant="sm" color="secondary">
                    {item.home}
                  </Text>
                </dd>
              </div>
            ))}
          </dl>
          <Text variant="sm" color="secondary">
            Then add it to the list on this page in <code>agentSkills.tsx</code>
            .
          </Text>
        </section>
      </div>
    </main>
  );
}
