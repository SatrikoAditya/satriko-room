# 05: Content

## Principles

- **Source of truth:** Satriko's CV. Facts are copied exactly: dates, titles, scores, tools.
- **Privacy:** the site and the public PDF contain **only email, LinkedIn and GitHub**. **No phone number and no referee names or contact details**; the site says "References available on request" instead.
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
| Photo | 📝 One photo of Satriko (used on the desk frame texture and in the panel) |
| Intro | 📝 A short, friendly first-person intro (2–4 sentences). *Draft to edit:* "Hi, I'm Satriko! I'm a full stack engineer from Bogor who loves building fast, friendly web and mobile apps with TypeScript, React, Next.js and NestJS. When I'm not coding you'll find me gaming, hiking a mountain, diving somewhere blue, or exploring Indonesia." |
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
- **Tools:** Git, Node.js, TypeScript, NestJS, React.js, Next.js, React Native, Tailwind, Zustand, Zod, TypeORM, MySQL, Supabase, AWS, Docker, Jira, Presentation and Public Speaking

### Charcentric: Software Engineer

- **Type / location:** Remote · Abu Dhabi, United Arab Emirates
- **Dates:** January 2022 – October 2024
- **Highlights:**
  - **Software Lifecycle Management:** Engage in researching, designing, and managing software programs, ensuring their seamless lifecycle progression.
  - **Code Enhancement and Testing:** Developing, modifying software to rectify errors and enhance performance, and rigorously test and evaluate new programs for optimal functionality.
  - **Collaborative Development and Support:** Collaborate with engineering staff, follow internal development processes, and communicate effectively within the team, clients, and stakeholders. Additionally, provide technical support to clients and monitor reported issues for swift resolution.
- **Tools:** Git, Node.js, TypeScript, Python, React.js, Next.js, React Native, Ionic, Capacitor.js, Tailwind, Storybook, Prisma, PostgreSQL, AWS, Vercel, Sentry, Docker, Jira, Presentation and Public Speaking

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

A TV bezel with a "SELECT GAME" menu in pixel font.

| Field | Content |
| --- | --- |
| Now playing | 📝 |
| Favorite games | 📝 Title, platform, cover image (own screenshot or official press art; respect each game's usage terms), one-line "why I love it" |
| Platforms | 📝 e.g. PC / PlayStation / Switch / mobile |
| Gamer tags | 📝 Optional, and only if Satriko wants them public |

Until it's filled in: [empty state](#empty-states).

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

## Diving: `/diving` (dive mask + fins)

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
- **The PDF:** 📝 a **public version** of the CV **without the phone number and without the referee page**, saved as `public/resume/Satriko-Aditya-Resume.pdf`.

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

Titles follow the pattern `<Section> · Satriko Aditya, Full Stack Engineer`.

| Route | Title | Description (draft) |
| --- | --- | --- |
| `/` | Satriko Aditya · Full Stack Engineer | Step into Satriko's cozy room and explore 5+ years of full stack work with Node.js, TypeScript, React, Next.js and NestJS. |
| `/about` | About · Satriko Aditya | Full stack engineer from Bogor, Indonesia, working remotely across Singapore and Abu Dhabi. |
| `/experience` | Experience · Satriko Aditya | Full stack roles at Jitera, Charcentric and PT Immobi Solusi Prima. |
| `/skills` | Skills · Satriko Aditya | Node.js, TypeScript, React, Next.js, NestJS, React Native, PostgreSQL, AWS, Docker and more. |
| `/education` | Education · Satriko Aditya | BSc Computer Science at BINUS, Hacktiv8 Honors Graduate, SMK Negeri 3 Bogor. |
| `/gaming` | Gaming · Satriko Aditya | What Satriko is playing right now. |
| `/travel` | Travel · Satriko Aditya | Places Satriko has explored around Indonesia. |
| `/hiking` | Hiking · Satriko Aditya | Mountains and trails Satriko has hiked. |
| `/diving` | Diving · Satriko Aditya | Satriko's dive log. |
| `/remote-work` | Remote work · Satriko Aditya | How Satriko works remotely across Bogor, Singapore and Abu Dhabi time zones. |
| `/contact` | Contact · Satriko Aditya | Get in touch with Satriko by email, LinkedIn or GitHub. |
| `/resume` | Resume · Satriko Aditya | Download Satriko Aditya's resume (PDF). |

---

## Content checklist

**Blocking for launch** means the site shouldn't go live without it. Everything else has a placeholder or a default.

| # | Item | Needed for | Blocking for launch? | Notes |
| --- | --- | --- | --- | --- |
| C1 | Photo of Satriko | About panel, desk frame | **Yes** | Square-ish, good light; alt text included |
| C2 | Friendly intro (2–4 sentences) | About | **Yes** | A draft is provided above |
| C3 | LinkedIn URL | Contact, JSON-LD | **Yes** | |
| C4 | GitHub URL | Contact, JSON-LD | **Yes** | |
| C5 | Public CV PDF (no phone, no referees) | Resume | **Yes** | `Satriko-Aditya-Resume.pdf` |
| C6 | Labels for skills with no job link (Redux, Vue.js, GraphQL, Redis, MongoDB) | Skills | **Yes** | See the Skills section |
| C7 | Add JavaScript to skills? | Skills | No | Default: not added |
| C8 | Show "Presentation & Public Speaking" as a bookend? | Skills | No | Default: yes (proposal) |
| C9 | Certificates / awards / talks | Education | No | Default: the 3 frames only |
| C10 | Games: now playing, favorites, platforms, gamer tags (optional) | Gaming | No | Empty state until provided |
| C11 | Indonesia pins: places, years, photos, notes | Travel | No | Map without pins until provided |
| C12 | Hiking entries | Hiking | No | Empty state until provided |
| C13 | Dive certification + dive entries | Diving | No | Empty state until provided |
| C14 | Remote-work note | Remote work | No | A draft is provided above |
| C15 | Oyen's markings (stripes? white paws/chest? eye color?) | 3D Oyen, loader SVG | No | Default: orange tabby, cream chest |
| C16 | Review Oyen's lines | Speech bubble | No | Drafts above |
| C17 | Music track(s) for the radio | Radio | No | Must be CC0 / royalty-free; license recorded |
| C18 | Domain name | Deployment, canonical URLs | **Yes** (before the production launch) | e.g. a `.dev` / `.com` domain |
| C19 | Analytics: yes or no (e.g. Vercel Web Analytics) | Deployment | No | Default: none |
