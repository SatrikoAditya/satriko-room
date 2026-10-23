import type { ISkillShelf } from '@models/skill'

export const skillShelves: readonly ISkillShelf[] = [
  {
    id: 'languages',
    title: 'Languages & Runtimes',
    color: 'peach',
    skills: ['Node.js', 'TypeScript', 'PHP', 'Python'],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    color: 'sky',
    skills: ['React.js', 'Redux', 'Next.js', 'React Native', 'Ionic', 'Vue.js'],
  },
  {
    id: 'backend',
    title: 'Backend & Data',
    color: 'mint',
    skills: [
      'NestJS',
      'Express.js',
      'Laravel',
      'GraphQL',
      'Redis',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    color: 'lavender',
    skills: ['Docker', 'AWS', 'Azure Cloud', 'Vercel', 'Sentry'],
  },
  {
    id: 'toolbox',
    title: 'Toolbox',
    color: 'wood',
    skills: [
      'Tailwind',
      'Zustand',
      'Zod',
      'TypeORM',
      'Prisma',
      'Sequelize',
      'Supabase',
      'Storybook',
      'Capacitor.js',
      'Ext.js',
      'Git',
      'Jira',
    ],
  },
]
/** Appears in every job's tool list; shown as a shelf bookend (design doc 05, proposal pending C8). */
export const SOFT_SKILL = 'Presentation and Public Speaking'
/** Skills in the CV that no job lists; labelled until checklist item C6 decides otherwise. */
export const UNLINKED_SKILL_LABEL = 'Side projects & learning'
