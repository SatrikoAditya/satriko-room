import type { IProject } from '@models/project'

// 📝 Placeholders until Satriko adds the real projects (content checklist C20 in
// docs/design/05-content.md). Satriko's Room is real; the "(placeholder)" cards
// only show how the panel looks and should be replaced or removed.
export const projects: readonly IProject[] = [
  {
    id: 'satrikos-room',
    kind: 'personal',
    title: "Satriko's Room",
    summary:
      'This site: a cozy 3D room to explore, where every object opens a part of my portfolio.',
    role: 'Design and development',
    tech: [
      'Next.js',
      'React.js',
      'TypeScript',
      'Three.js',
      'Tailwind',
      'Zustand',
    ],
    screenshot: {
      src: '/images/projects/satrikos-room.webp',
      alt: "Satriko's Room: a cozy 3D studio room with a desk under the window, a TV and Oyen the cat",
    },
    links: [],
  },
  {
    id: 'work-placeholder-1',
    kind: 'work',
    title: 'Project title (placeholder)',
    summary: 'One line about what it does and who uses it.',
    role: 'Your role',
    tech: ['Next.js', 'NestJS'],
    screenshot: null,
    links: [],
  },
  {
    id: 'work-placeholder-2',
    kind: 'work',
    title: 'Project title (placeholder)',
    summary: 'One line about what it does and who uses it.',
    role: 'Your role',
    tech: ['React Native', 'Supabase'],
    screenshot: null,
    links: [],
  },
  {
    id: 'personal-placeholder-1',
    kind: 'personal',
    title: 'Project title (placeholder)',
    summary: 'One line about what it does and why you built it.',
    role: 'Your role',
    tech: ['Vue.js'],
    screenshot: null,
    links: [],
  },
]
