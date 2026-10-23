import type { IProject } from '@models/project'

// Sativa Trip Indonesia is Satriko's latest freelance build (2026, live site linked).
// The rest come from Satriko's portfolio (2025): released, but their code is
// private, so they have no links and the screenshots are cropped to leave out
// client data. Tech names follow src/content/skills.ts where they exist.
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
    id: 'sativa-trip-indonesia',
    kind: 'work',
    title: 'Sativa Trip Indonesia',
    summary:
      'A website in English, Indonesian and Chinese for a Komodo and Labuan Bajo boat-trip operator: a page for each boat, day-by-day trip pages, and booking over WhatsApp messages pre-filled from the page. I built it on my own for the client as a fast static site tuned for PageSpeed, with SEO built in. I deployed it on Cloudflare Pages and moved their domain over from the old WordPress site, redirecting every old URL to its new page so its search rankings carry over.',
    role: 'Full Stack Developer',
    tech: [
      'Next.js',
      'React.js',
      'TypeScript',
      'Tailwind',
      'next-intl',
      'Leaflet',
      'Cloudflare Pages',
    ],
    screenshot: {
      src: '/images/projects/sativa-trip-indonesia.webp',
      alt: 'Sativa Trip Indonesia home page: "Sail Komodo aboard the perfect boat" over a view of Padar Island',
    },
    links: [{ label: 'Visit site', href: 'https://sativatripindonesia.com/' }],
  },
  {
    id: 'datax-pipeline-builder',
    kind: 'work',
    title: 'DataX Pipeline Builder',
    summary:
      'A no-code builder for AI data pipelines: users drag loaders, LLM blocks and code transformers onto a canvas, connect them and publish dashboards. It made complex data workflows quick to build for non-technical teams.',
    role: 'Front End Developer',
    tech: [
      'Node.js',
      'TypeScript',
      'React.js',
      'Next.js',
      'Tailwind',
      'Ant Design',
      'Azure Cloud',
    ],
    screenshot: {
      src: '/images/projects/datax-pipeline-builder.webp',
      alt: 'DataX Pipeline Builder: a canvas of connected blocks, from a CSV loader through a conversational LLM to a code transformer',
    },
    links: [],
  },
  {
    id: '360u',
    kind: 'work',
    title: '360U',
    summary:
      'A mobile app for booking home services, from cleaning to beauty and wellness, in a few taps. I built its front end once for iOS and Android with Ionic and Capacitor, with a smooth, consistent UI on every device.',
    role: 'Front End Developer',
    tech: [
      'TypeScript',
      'React.js',
      'Next.js',
      'Tailwind',
      'Ionic',
      'Capacitor.js',
    ],
    screenshot: {
      src: '/images/projects/360u.webp',
      alt: '360U home screen: a promotion banner, service categories and recommended home services',
    },
    links: [],
  },
  {
    id: 'progen',
    kind: 'work',
    title: 'ProGen',
    summary:
      "An AI writing tool for corporate communications that drafts CEO speeches, op-eds and press releases from the user's context, language and brand rules. I built the interface and connected it to the AI services behind it.",
    role: 'Full Stack Developer',
    tech: [
      'Node.js',
      'TypeScript',
      'React.js',
      'Next.js',
      'Prisma',
      'PostgreSQL',
      'Tailwind',
      'Ant Design',
      'Azure Cloud',
    ],
    screenshot: {
      src: '/images/projects/progen.webp',
      alt: 'ProGen editor: job settings on the left, AI-generated proposal sections in the middle and an edit panel on the right',
    },
    links: [],
  },
  {
    id: 'apco-fusion',
    kind: 'work',
    title: 'APCO Fusion',
    summary:
      'A dashboard for exploring survey results by topic, gathered from many sources, behind secure Auth0 sign-in. It let the team read complex survey data at a glance and make data-driven decisions faster.',
    role: 'Full Stack Developer',
    tech: [
      'Node.js',
      'JavaScript',
      'React.js',
      'Next.js',
      'Ant Design',
      'Auth0',
      'Google BigQuery',
      'Cube.js',
      'Azure Cloud',
    ],
    screenshot: {
      src: '/images/projects/apco-fusion.webp',
      alt: 'APCO Fusion: the data view, where you pick a topic and subtopic to search the survey database',
    },
    links: [],
  },
  {
    id: 'tinc-polaris',
    kind: 'work',
    title: 'TINC Polaris',
    summary:
      "A platform where Telkomsel's teams submit business ideas and founders find learning resources to grow their ventures. I built it end to end: the interface, the database design, the APIs and the integration between them.",
    role: 'Full Stack Developer',
    tech: [
      'Node.js',
      'TypeScript',
      'React.js',
      'Next.js',
      'Ant Design',
      'Express.js',
      'Sequelize',
      'MySQL',
    ],
    screenshot: {
      src: '/images/projects/tinc-polaris.webp',
      alt: 'TINC Polaris sign-in page welcoming Telkomsel employees',
    },
    links: [],
  },
]
