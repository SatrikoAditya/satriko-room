# 05: Content

## Principles

- **Source of truth:** Satriko's CV. Facts are copied exactly: dates, titles, scores, tools.
- **Privacy:** the site contains **only email, LinkedIn and GitHub**: **no phone number and no referee names or contact details**; the site says "References available on request" instead. The **public PDF** also has no referees, but **may show the phone number** (Satriko's choice, decision #51).
- **Tone:** friendly, first person ("I build…") in intros and Oyen's lines; factual and skimmable in Experience, Skills and Education.
- **Storage:** one typed TS file per section in `src/content/` (typed with the models in `src/models/`), images in `public/images/<section>/`. Panels are pure presentation ([02](02-architecture.md#content-layer)).
- Anything still needed is marked **📝** and listed in the [content checklist](#content-checklist).

---

## About: `/about` (framed photo)

| Field | Content |
| --- | --- |
| Name | Satriko Aditya |
| Title | Full Stack Software Engineer |
| Location | Bogor, Indonesia |
| Photo | ✅ Provided: `public/images/about/satriko.jpg` (`about.photo` in `src/content/about.ts`); used on the desk frame texture and in the panel |
| Intro | ✅ The draft below is in use (Satriko kept it):  "Hi, I'm Satriko! I'm a full stack engineer from Bogor who loves building fast, friendly web and mobile apps with TypeScript, React, Next.js and NestJS. When I'm not coding you'll find me gaming, hiking a mountain, diving somewhere blue, or exploring Indonesia." |
| Summary (CV) | Full Stack Software Engineer with 5+ years of professional experience specializing in Node.js, TypeScript, React.js, Next.js, and NestJS. Strong background in building, optimizing, and maintaining scalable web and mobile applications. Currently pursuing a Bachelor's degree in Computer Science at BINUS University. Passionate about continuous learning and delivering high-quality solutions in collaborative, and fast paced environments. |
| Quick facts (stickers) | 5+ years experience · Remote across 3 time zones (Bogor, Singapore, Abu Dhabi) · Currently: Full Stack Developer @ Jitera · Studying: BSc Computer Science @ BINUS |

```ts
// Design sketch
interface AboutContent {
  name: string; title: string; location: string;
  photo: { src: string; alt: string };
  intro: string; summary: string; facts: string[];
}
```

---

## Experience: `/experience` (PC)

Shown as a desktop window: a sidebar of companies like files, and a detail pane. Tool chips also feed the Skills "Used at" mapping.

### Jitera: Full Stack Developer

- **Type / location:** Remote · Singapore
- **Dates:** October 2024 – Present
- **Highlights:**
  - **Agile Collaboration and Coordination:** Work closely with cross-functional teams, including managers, team leads, designers, QA, and developers, to align project objectives, ensure clear communication, and deliver high-quality solutions within set timelines.
  - **Code Quality and Compliance:** Perform in-depth code reviews and automated/manual testing to validate that software adheres to functional requirements, coding standards, and architectural best practices, ensuring seamless deployment readiness.
  - **Security and Compliance:** Ensure applications adhere to industry security standards and compliance requirements by implementing robust measures during the development lifecycle.
- **Tools:** Git, Node.js, TypeScript, NestJS, React.js, Next.js, React Native, Tailwind, Zustand, Zod, TypeORM, MySQL, Supabase, AWS, Azure Cloud, Docker, Jira, Presentation and Public Speaking

### Charcentric: Software Engineer

- **Type / location:** Remote · Abu Dhabi, United Arab Emirates
- **Dates:** January 2022 – October 2024
- **Highlights:**
  - **Software Lifecycle Management:** Engage in researching, designing, and managing software programs, ensuring their seamless lifecycle progression.
  - **Code Enhancement and Testing:** Developing, modifying software to rectify errors and enhance performance, and rigorously test and evaluate new programs for optimal functionality.
  - **Collaborative Development and Support:** Collaborate with engineering staff, follow internal development processes, and communicate effectively within the team, clients, and stakeholders. Additionally, provide technical support to clients and monitor reported issues for swift resolution.
- **Tools:** Git, Node.js, TypeScript, Python, React.js, Next.js, React Native, Ionic, Capacitor.js, Tailwind, Storybook, Prisma, PostgreSQL, AWS, Azure Cloud, Vercel, Sentry, Docker, Jira, Presentation and Public Speaking

### PT Immobi Solusi Prima: Full Stack Developer

- **Location:** Jakarta, Indonesia
- **Dates:** December 2020 – December 2021
- **Highlights:**
  - **Application Development for Internal Teams:** Spearheaded the design and development of applications tailored for Telkomsel's internal teams, focusing on user needs and seamless integration within the existing infrastructure.
  - **Collaborative Development:** Worked closely with other engineers, sharing knowledge, and coordinating efforts to ensure cohesive development processes and successful project outcomes.
  - **Performance Monitoring and Optimization:** Ensured the consistent performance of applications through continuous monitoring and proactive optimization, addressing potential issues before they impact operations.
  - **Error Resolution and Debugging:** Led the debugging process, identifying, and resolving software issues to maintain application stability and reliability.
- **Tools:** Git, Node.js, Express.js, Sequelize, PHP, Laravel, MySQL, React.js, Ext.js, Presentation and Public Speaking

### Institut Pertanian Bogor (IPB) University: Information Technology Support Engineer (Internship)

- **Location:** Bogor, Indonesia
- **Dates:** January 2019 – May 2019
- **Highlights:**
  - **Systems and Network Maintenance:** Ensured the smooth operation of computers, applications, and LAN networks to support uninterrupted learning activities, minimizing downtime, and enhancing user experience.
  - **Technical Troubleshooting and Support:** Provided expert troubleshooting for hardware and network issues, quickly diagnosing and resolving problems to maintain optimal system performance.
  - **Software and OS Installation:** Managed the installation and configuration of applications and operating systems, ensuring that all systems were up-to-date and equipped to meet user requirements.

```ts
// Design sketch
interface Job {
  id: 'jitera' | 'charcentric' | 'immobi' | 'ipb';
  company: string; role: string; kind: 'full-time' | 'internship';
  location: string; remote: boolean;
  start: string; end: string | 'present';  // 'YYYY-MM'
  highlights: { title: string; text: string }[];
  tools: string[];                          // must match skill names in skills.ts
}
```

---

## Projects: `/projects` (rolling whiteboard)

Project cards in two groups, **Personal** first (public projects with links), then **Work** (NDA-safe: what was built and with what, no client secrets). Each card: a screenshot (`public/images/projects/`) or a pastel tile, title, role, one-line summary, tech chips (names as in `skills.ts`) and links. Model `IProject` in `src/models/project.ts`, content in `src/content/projects.ts`. Content: **Satriko's Room** (personal); under Work, first the freelance **Sativa Trip Indonesia** (2026, linked to the live site), then five projects from Satriko's 2025 portfolio (DataX Pipeline Builder, 360U, ProGen, APCO Fusion, TINC Polaris). They are released but their code is private, so they have no links, and their screenshots are cropped to leave out client data (URLs, user names, survey details).

---

## Skills: `/skills` (bookshelf)

Four shelves follow the CV's "Full Stack Technologies" groups, plus a **Toolbox** shelf for tools that appear in the job tool lists. **No skill-level bars or percentages.** Clicking a book shows **"Used at"**, computed from the experience tool lists.

| Shelf | Book | Used at (derived) |
| --- | --- | --- |
| **Languages & Runtimes** | Node.js | Jitera, Charcentric, Immobi |
| | TypeScript | Jitera, Charcentric |
| | PHP | Immobi |
| | Python | Charcentric |
| **Frontend** | React.js | Jitera, Charcentric, Immobi |
| | Redux | n/a 📝 |
| | Next.js | Jitera, Charcentric |
| | React Native | Jitera, Charcentric |
| | Ionic | Charcentric |
| | Vue.js | n/a 📝 |
| **Backend & Data** | NestJS | Jitera |
| | Express.js | Immobi |
| | Laravel | Immobi |
| | GraphQL | n/a 📝 |
| | Redis | n/a 📝 |
| | MySQL | Jitera, Immobi |
| | PostgreSQL | Charcentric |
| | MongoDB | n/a 📝 |
| **DevOps & Cloud** | Docker | Jitera, Charcentric |
| | AWS | Jitera, Charcentric |
| | Azure Cloud | Jitera, Charcentric |
| | Vercel | Charcentric |
| | Sentry | Charcentric |
| **Toolbox** | Tailwind | Jitera, Charcentric |
| | Zustand | Jitera |
| | Zod | Jitera |
| | TypeORM | Jitera |
| | Prisma | Charcentric |
| | Sequelize | Immobi |
| | Supabase | Jitera |
| | Storybook | Charcentric |
| | Capacitor.js | Charcentric |
| | Ext.js | Immobi |
| | Git | Jitera, Charcentric, Immobi |
| | Jira | Jitera, Charcentric |

- **Skills with no job link** (Redux, Vue.js, GraphQL, Redis, MongoDB) are listed in the CV but don't appear in any job's tool list. 📝 Decide how to label them: e.g. "Side projects / learning", a specific context, or no "Used at" line.
- **Presentation and Public Speaking** appears in all three jobs' tool lists. *Proposal:* show it as a "bookend" on the shelf, "Presentation & Public Speaking: Jitera, Charcentric, Immobi". 📝 Confirm.
- **JavaScript** isn't listed in the CV's skills (Hacktiv8 was "Immersive Full Stack JavaScript"). 📝 Confirm whether to add it to Languages & Runtimes.

```ts
// Design sketch
interface SkillShelf { id: string; title: string; color: string; skills: string[] }
// usedAt(skill) = jobs.filter(j => j.tools.includes(skill)).map(j => j.company)
```

---

## Education: `/education` (wall frames)

| Frame | Program | Institution | Location | Dates | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | Computer Science, Bachelor's degree | BINUS (Bina Nusantara) University (Online Program) | Jakarta, Indonesia | May 2023 – Present | In progress |
| 2 | Immersive Full Stack JavaScript | Hacktiv8 | Jakarta, Indonesia | July 2020 – October 2020 | 🎀 **Honors Graduate**, final score 94.79/100 |
| 3 | Computer & Network Engineering | SMK Negeri 3 Bogor | Bogor, Indonesia | July 2017 – July 2020 | Final score 84/100 |

**Achievements / certificates:** 📝 none in the CV. If Satriko has certificates, awards or talks, they get extra frames. Otherwise the panel shows only the three frames above.

---

## Gaming: `/gaming` (TV)

A TV bezel with a "SELECT GAME" menu in pixel font, filled from a **snapshot of Satriko's PlayStation account** (decision #52). The site stays static: nothing calls PlayStation when a visitor opens the panel.

| Part | Content |
| --- | --- |
| Trophy strip | Trophy level, then the platinum, gold, silver and bronze counts |
| Recently played | The last 6 games (two rows of three on desktop): cover, title, a PS5 / PS4 badge, "Last played 20 Oct 2026" and the playtime in hours (left out when PSN has none). The first card is marked ★ Now playing. The date is absolute, because "3 days ago" would go stale on a static page |
| Footer | "Synced 23 Oct 2026", the date of the snapshot |
| Not shown | The PSN Online ID (gamer tag), the account ID, friends and online status |

**Where it comes from:** `yarn games:sync` (`scripts/sync-games.mts`, run with `tsx`; the mapping lives in `src/utils/games.ts`), run on Satriko's machine.

1. It reads `PSN_NPSSO` from `.env.local`, which is git-ignored.
2. It exchanges the NPSSO for an access token with [psn-api](https://psn-api.achievements.app/), an unofficial library that is a dev-only dependency. Each run starts from the NPSSO, so no refresh token is stored.
3. It fetches the recently played games (`getUserPlayedGames`, asking for up to 30 titles in the PS5, PS4 and PC game categories) and the trophy summary (`getUserTrophyProfileSummary`). Media apps such as Netflix or YouTube are left out, and `toSnapshot` drops any title without a game platform too, in case PSN ignores the filter.
4. It writes `src/content/gaming.snapshot.json` (committed) and saves each cover as a `.webp` of up to 512 px (sharp on 2× screens; never upscaled) in `public/images/gaming/`, deleting covers no longer listed.
5. If the NPSSO is missing or expired, it stops with the renewal steps below and changes no files. It never logs the NPSSO or the tokens.

The covers are the games' official icons from PlayStation, shown small as "what I'm playing", as the PlayStation app does; the rule to respect each game's usage terms still applies.

**Renewing the PSN sign-in (about every 60 days).** Sony's NPSSO expires about 60 days after sign-in, sooner after signing out everywhere or changing the password. Refreshing tokens does not extend it. When the sync says it has expired:

1. Sign in at playstation.com.
2. In the same browser, open `https://ca.account.sony.com/api/v1/ssocookie` and copy the 64-character `npsso` value.
3. Put it in `.env.local` as `PSN_NPSSO=...` and run `yarn games:sync` again.

The NPSSO works like the account password: never commit it, never paste it anywhere public, and never give it a `NEXT_PUBLIC_` name.

Until the first sync: [empty state](#empty-states).

---

## Travel: `/travel` (Indonesia map)

- **Map:** an illustrated **map of Indonesia**, built from a simplified Natural Earth outline (public domain) and drawn in the site's style. The same artwork is the texture on the 3D wall map.
- **Pins:** 📝 to be added later. Each pin has:

| Field | Example |
| --- | --- |
| Place | e.g. city / island / national park |
| Province / island | |
| Coordinates | Latitude/longitude, projected onto the map |
| Year | |
| Photos | 1–3 |
| Note | One or two lines |

- **Later:** a "World" tab can be added if Satriko travels abroad more (parked; see [01](01-vision-and-scope.md#parked-recorded-not-planned)).
- Until there are pins: [empty state](#empty-states). The map shows with no pins, plus Oyen's placeholder note.

---

## Hiking: `/hiking` (backpack + boots)

A trail journal. 📝 To fill in later: entries with **mountain / trail name, location, elevation (m), date, photos, short story**. Until then: [empty state](#empty-states).

## Diving: `/diving` (scuba tank, mask + fins)

A dive logbook. 📝 To fill in later: **certification level** (e.g. which PADI/SSI level), and entries with **dive site, location, max depth (m), date, highlights (marine life), photos**. Until then: [empty state](#empty-states).

---

## Remote work: `/remote-work` (3 clocks)

| Clock | City | IANA time zone | UTC offset |
| --- | --- | --- | --- |
| 1 | Bogor (home) | `Asia/Jakarta` (WIB) | +7 |
| 2 | Singapore (Jitera) | `Asia/Singapore` | +8 |
| 3 | Abu Dhabi (Charcentric) | `Asia/Dubai` | +4 |

- **Overlap timeline:** working hours (assumed 09:00–18:00 local) drawn as bars on a shared Bogor-time axis, **computed in code, not hard-coded**. With those hours, the three-way overlap is about **12:00–17:00 Bogor time** (09:00–14:00 Abu Dhabi, 13:00–18:00 Singapore).
- **Note:** 📝 a few lines on how Satriko works remotely (async communication, overlap hours, tools). *Draft to edit:* "I've worked remotely for teams in Singapore and Abu Dhabi from my desk in Bogor. I keep a few hours of overlap every day, write things down, and keep the async updates flowing."

---

## Contact: `/contact` (mailbox)

| Item | Value | Behavior |
| --- | --- | --- |
| Email | satrikoaditya@gmail.com | **Copy** button (shows a "Copied!" toast) and a **Send email** (`mailto:`) button |
| LinkedIn | 📝 Profile URL | Opens in a new tab |
| GitHub | 📝 Profile URL | Opens in a new tab |
| References | "References available on request." | Plain text |

No contact form, no phone number.

---

## Resume: `/resume` (printer)

- **Animation:** the printer "prints": a sheet slides out and becomes the panel.
- **Contents:** name and title, the summary, a compact timeline (4 roles) and top skills, plus a big **Download PDF** button.
- **The PDF:** a **public version** of the CV **without the referee page** (the phone number stays, decision #51), saved as `public/resume/Satriko-Aditya-Resume.pdf`.

---

## Empty states

Gaming, Travel, Hiking and Diving can launch empty. They show their normal themed interior with:

- an Oyen doodle (2D SVG),
- the copy: **"Oyen is still sorting these photos… check back soon!"** (with a slightly different line per hobby, e.g. Diving: "Oyen is drying off the dive photos…"),
- the phone menu still working, so visitors are never stuck.

---

## Oyen copy

Drafts to edit. Keep every line short (≤ 90 characters).

| Moment | Lines |
| --- | --- |
| Greeting (after Enter) | "Meow! I'm Oyen. Welcome to Satriko's room! Click anything that looks interesting." |
| Idle hints (in order) | "Psst… try the PC. That's where the work stuff lives." · "The bookshelf has all of Satriko's skills!" · "Need the resume? The printer's warmed up." |
| Clicking Oyen (rotating) | "Satriko worked remotely for Singapore and Abu Dhabi, all from this desk." · "Flip the light switch for night mode. I nap better that way." · "Turn on the radio if you want some cozy tunes." · "Use the phone if you're in a hurry. I won't be offended. Much." |
| Night (sleeping) | "Zzz… (Oyen is asleep. Maybe check the map instead?)" |

---

## SEO copy

Synced with `src/constants/sections.ts` (the single source). Section titles follow the pattern `<Section> · Satriko Aditya`; the home page title is `Satriko Aditya · Full Stack Engineer` (`src/app/layout.tsx`). Each page also sets `og:image` to `/poster/og.png`, a canonical URL built from `site.url`, and `twitter:card` = `summary_large_image`.

| Route | Title | Description (draft) |
| --- | --- | --- |
| `/` | Satriko Aditya · Full Stack Engineer | Step into Satriko's cozy room and explore 5+ years of full stack work with Node.js, TypeScript, React, Next.js and NestJS. |
| `/about` | About · Satriko Aditya | Full stack engineer from Bogor, Indonesia, working remotely across Singapore and Abu Dhabi. |
| `/experience` | Experience · Satriko Aditya | Full stack roles at Jitera, Charcentric and PT Immobi Solusi Prima. |
| `/projects` | Projects · Satriko Aditya | Projects Satriko Aditya has built, from work apps to personal ones like this 3D room. |
| `/skills` | Skills · Satriko Aditya | Node.js, TypeScript, React, Next.js, NestJS, React Native, PostgreSQL, AWS, Azure, Docker and more. |
| `/education` | Education · Satriko Aditya | BSc Computer Science at BINUS, Hacktiv8 Honors Graduate, SMK Negeri 3 Bogor. |
| `/gaming` | Gaming · Satriko Aditya | What Satriko is playing right now. |
| `/travel` | Travel · Satriko Aditya | Places Satriko has explored around Indonesia. |
| `/hiking` | Hiking · Satriko Aditya | Mountains and trails Satriko has hiked. |
| `/diving` | Diving · Satriko Aditya | Dive sites and highlights from Satriko's dive log. (Lengthened from "Satriko's dive log." so the description is long enough for search snippets.) |
| `/remote-work` | Remote work · Satriko Aditya | How Satriko works remotely across Bogor, Singapore and Abu Dhabi time zones. |
| `/contact` | Contact · Satriko Aditya | Get in touch with Satriko by email, LinkedIn or GitHub. |
| `/resume` | Resume · Satriko Aditya | Download Satriko Aditya's resume (PDF). |

---

## Content checklist

**Blocking for launch** means the site shouldn't go live without it. Everything else has a placeholder or a default.

| # | Item | Needed for | Blocking for launch? | Notes |
| --- | --- | --- | --- | --- |
| C1 | Photo of Satriko | About panel, desk frame | **Yes** | ✅ Provided and applied |
| C2 | Friendly intro (2–4 sentences) | About | **Yes** | ✅ The draft above is in use |
| C3 | LinkedIn URL | Contact, JSON-LD | **Yes** | ✅ Provided (`site.linkedin`) |
| C4 | GitHub URL | Contact, JSON-LD | **Yes** | ✅ Provided (`site.github`) |
| C5 | Public CV PDF (no referees; the phone number is allowed, decision #51) | Resume | **Yes** | ✅ Provided on 2026-10-22: `public/resume/Satriko-Aditya-Resume.pdf` (2 pages, no referee page) |
| C6 | Labels for skills with no job link (Redux, Vue.js, GraphQL, Redis, MongoDB) | Skills | **Yes** | Default in use: `UNLINKED_SKILL_LABEL = 'Side projects & learning'` in `src/content/skills.ts`. Change it there if Satriko prefers other wording |
| C7 | Add JavaScript to skills? | Skills | No | Default: not added |
| C8 | Show "Presentation & Public Speaking" as a bookend? | Skills | No | Default: yes (proposal) |
| C9 | Certificates / awards / talks | Education | No | Default: the 3 frames only |
| C10 | Games: a PlayStation snapshot (recently played, trophy summary) | Gaming | No | Designed (decision #52): filled by `yarn games:sync` with Satriko's NPSSO in `.env.local`. Empty state until the first sync |
| C11 | Indonesia pins: places, years, photos, notes | Travel | No | Map without pins until provided |
| C12 | Hiking entries | Hiking | No | Empty state until provided |
| C13 | Dive certification + dive entries | Diving | No | Empty state until provided |
| C14 | Remote-work note | Remote work | No | A draft is provided above |
| C15 | Oyen's markings (stripes? white paws/chest? eye color?) | 3D Oyen, loader SVG | No | Default: orange tabby, cream chest |
| C16 | Review Oyen's lines | Speech bubble | No | Drafts above |
| C17 | Music track(s) for the radio | Radio | No | ✅ Provided: a 90 s loop of "Lofi Restaurant" by alex-morgan on Pixabay (Pixabay Content License; labelled AI-generated) in `public/audio/music-cozy.mp3`, recorded in `CREDITS.md` |
| C18 | Domain name | Deployment, canonical URLs | **Yes** (before the production launch) | ⏳ Pending. `site.url` is still the placeholder `https://example.com` in `src/constants/site.ts` |
| C19 | Analytics: yes or no (e.g. Vercel Web Analytics) | Deployment | No | Decision: none (default) |
| C20 | Projects: title, kind, role, summary, tech, links, screenshot, with an NDA check on work ones | Projects | No | ✅ Provided on 2026-10-23 from Satriko's portfolio: seven projects in `src/content/projects.ts` (Sativa Trip Indonesia added the same day), screenshots in `public/images/projects/` |

**Status at the end of the build:** C1–C4 provided; C17 provided after the build; C5 and C18 pending (see the README launch checklist); C6 uses its default; C19 none. C7–C16 keep their defaults, and the hobby content (C10–C13) is still empty, so those panels show their empty states. C20 (projects, decision #50) is provided.
