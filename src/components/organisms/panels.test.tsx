import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AboutPanel from './AboutPanel'
import ContactPanel from './ContactPanel'
import DivingPanel from './DivingPanel'
import EducationPanel from './EducationPanel'
import ExperiencePanel from './ExperiencePanel'
import GamingPanel from './GamingPanel'
import HikingPanel from './HikingPanel'
import ProjectsPanel from './ProjectsPanel'
import ResumePanel from './ResumePanel'
import SkillsPanel from './SkillsPanel'
import TravelPanel from './TravelPanel'

describe('panels', () => {
  it('ExperiencePanel lists the four roles and shows the first one', () => {
    render(<ExperiencePanel />)
    expect(screen.getByRole('button', { name: /jitera/i })).toBeInTheDocument()
    expect(screen.getByText(/Solution division/)).toBeInTheDocument()
    expect(screen.getByText('Remote · Singapore')).toBeInTheDocument()
  })
  it('SkillsPanel renders five shelves and derives "Used at"', () => {
    render(<SkillsPanel />)
    expect(screen.getAllByRole('list', { name: /shelf/i })).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'NestJS' })).toBeInTheDocument()
  })
  it('EducationPanel marks Hacktiv8 as honors and tags each kind', () => {
    render(<EducationPanel />)
    expect(screen.getByText(/Honors Graduate/)).toBeInTheDocument()
    // Each card says what it is, so the bootcamp isn't read as a degree.
    expect(screen.getByText('Degree')).toBeInTheDocument()
    expect(screen.getByText('Bootcamp')).toBeInTheDocument()
    expect(screen.getByText('Vocational school')).toBeInTheDocument()
  })
  it('hobby panels show the empty state when there is no content', () => {
    render(
      <GamingPanel data={{ syncedAt: null, trophies: null, recent: [] }} />,
    )
    expect(
      screen.getByText(/Oyen is still choosing a game/),
    ).toBeInTheDocument()
    render(<TravelPanel pins={[]} />)
    expect(
      screen.getByText(/Oyen is still pinning the map/),
    ).toBeInTheDocument()
    render(<HikingPanel items={[]} />)
    expect(screen.getByText(/trail photos/)).toBeInTheDocument()
    render(<DivingPanel items={[]} />)
    expect(screen.getByText(/dive photos/)).toBeInTheDocument()
  })
  it('ContactPanel shows the email and the LinkedIn and GitHub links', () => {
    render(<ContactPanel />)
    expect(screen.getByText('satrikoaditya@gmail.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/satriko-aditya-0313631ab/',
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/SatrikoAditya',
    )
    expect(
      screen.getByText('References available on request.'),
    ).toBeInTheDocument()
  })
  it('ResumePanel links to the PDF and AboutPanel shows the intro', () => {
    render(<ResumePanel />)
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute(
      'href',
      '/resume/Satriko-Aditya-Resume.pdf',
    )
    render(<AboutPanel />)
    expect(screen.getByText(/Hi, I'm Satriko!/)).toBeInTheDocument()
  })
  it('ProjectsPanel groups work and personal projects into cards', () => {
    render(
      <ProjectsPanel
        items={[
          {
            id: 'room',
            kind: 'personal',
            title: "Satriko's Room",
            summary: 'A cozy 3D room.',
            role: 'Design and development',
            tech: ['Next.js'],
            screenshot: {
              src: '/images/projects/satrikos-room.webp',
              alt: 'The room',
            },
            links: [{ label: 'Visit', href: 'https://example.com' }],
          },
          {
            id: 'app',
            kind: 'work',
            title: 'Team app',
            summary: 'Internal tools.',
            role: 'Full stack',
            tech: ['NestJS', 'React.js'],
            screenshot: null,
            links: [],
          },
        ]}
      />,
    )
    // Personal projects come first, then work.
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(['Personal', 'Work'])
    expect(screen.getByRole('img', { name: 'The room' })).toBeInTheDocument()
    expect(screen.getByText('NestJS')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Visit' })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })
  it('ProjectsPanel leaves out an empty group and shows the empty state with none', () => {
    const { unmount } = render(
      <ProjectsPanel
        items={[
          {
            id: 'app',
            kind: 'work',
            title: 'Team app',
            summary: 'Internal tools.',
            role: 'Full stack',
            tech: [],
            screenshot: null,
            links: [],
          },
        ]}
      />,
    )
    expect(screen.queryByRole('heading', { name: 'Personal' })).toBeNull()
    unmount()
    render(<ProjectsPanel items={[]} />)
    expect(screen.getByText(/Oyen is still sticking notes/)).toBeInTheDocument()
  })
  it('GamingPanel shows the trophy strip, recent games and the sync date', () => {
    render(
      <GamingPanel
        data={{
          syncedAt: '2026-10-23T03:00:00.000Z',
          trophies: {
            level: 312,
            platinum: 5,
            gold: 40,
            silver: 120,
            bronze: 600,
          },
          recent: [
            {
              id: 'PPSA00001_00',
              title: 'Astro Bot',
              platform: 'PS5',
              cover: '/images/gaming/PPSA00001_00.webp',
              lastPlayed: '2026-10-20T12:00:00Z',
              playtimeHours: 42,
            },
            {
              id: 'CUSA00002_00',
              title: 'Stardew Valley',
              platform: 'PS4',
              cover: null,
              lastPlayed: '2026-10-01T12:00:00Z',
              playtimeHours: null,
            },
          ],
        }}
      />,
    )
    const trophies = screen.getByLabelText('Trophies')
    expect(trophies).toHaveTextContent('312')
    expect(trophies).toHaveTextContent('Platinum5')
    const games = screen.getByRole('list', { name: 'Recently played' })
    expect(games.querySelectorAll('li')).toHaveLength(2)
    expect(screen.getByLabelText('Now playing')).toBeInTheDocument()
    expect(
      screen.getByText('PS5 · Last played 20 Oct 2026 · 42 h played'),
    ).toBeInTheDocument()
    expect(screen.getByText('PS4 · Last played 1 Oct 2026')).toBeInTheDocument()
    expect(screen.getByText('Synced 23 Oct 2026')).toBeInTheDocument()
  })
  it('TravelPanel lists cities newest first with a postcard carousel', () => {
    const base = { region: 'Indonesia', lat: -8.5, lon: 119.9, note: 'A note.' }
    render(
      <TravelPanel
        pins={[
          { ...base, id: 'bogor', place: 'Bogor', year: 2023, photos: [] },
          {
            ...base,
            id: 'labuan-bajo',
            place: 'Labuan Bajo',
            year: 2025,
            photos: [
              { src: '/images/travel/labuan-bajo/1.webp', alt: 'Padar Island' },
              { src: '/images/travel/labuan-bajo/2.webp', alt: 'Pink beach' },
            ],
          },
          {
            ...base,
            id: 'yogyakarta',
            place: 'Yogyakarta',
            year: 2024,
            photos: [],
          },
        ]}
      />,
    )
    // Newest first, and the newest is selected on open.
    const places = screen.getByRole('list', { name: 'Places, newest first' })
    expect(
      within(places)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Labuan Bajo', 'Yogyakarta', 'Bogor'])
    expect(
      within(places).getByRole('button', { name: 'Labuan Bajo' }),
    ).toHaveAttribute('aria-pressed', 'true')
    // The carousel steps with the buttons and the arrow keys.
    expect(
      screen.getByRole('img', { name: 'Padar Island' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Photo 1 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByRole('img', { name: 'Pink beach' })).toBeInTheDocument()
    expect(screen.getByText('Photo 2 of 2')).toBeInTheDocument()
    fireEvent.keyDown(
      screen.getByRole('group', { name: 'Photos of Labuan Bajo' }),
      {
        key: 'ArrowRight',
      },
    )
    expect(
      screen.getByRole('img', { name: 'Padar Island' }),
    ).toBeInTheDocument()
    // A city without photos shows the stamp tile and no carousel.
    fireEvent.click(within(places).getByRole('button', { name: 'Bogor' }))
    expect(screen.getByText('Bogor · 2023')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /Photos of/ })).toBeNull()
  })
  it('HikingPanel lists mountains newest first with a journal page', () => {
    const base = {
      location: 'Java',
      route: null,
      days: null,
      photos: [],
      story: '',
    }
    render(
      <HikingPanel
        items={[
          {
            ...base,
            id: 'gede',
            name: 'Mount Gede',
            elevationM: 2958,
            year: 2022,
          },
          {
            ...base,
            id: 'rinjani',
            name: 'Mount Rinjani',
            elevationM: 3726,
            year: 2024,
            route: 'via Sembalun',
            days: 3,
            story: 'Sunrise on the crater rim.',
          },
          {
            ...base,
            id: 'prau',
            name: 'Mount Prau',
            elevationM: 2565,
            year: null,
          },
        ]}
      />,
    )
    const list = screen.getByRole('list', { name: 'Mountains, newest first' })
    expect(
      within(list)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Mount Rinjani', 'Mount Gede', 'Mount Prau'])
    // The newest is open: its trip line, story and elevation stamp.
    expect(
      screen.getByRole('heading', { name: 'Mount Rinjani · 2024' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('via Sembalun · 3 days on the trail'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Elevation/).parentElement).toHaveTextContent(
      'Elevation 3,726 m',
    )
    // A mountain without a year or trip details shows just what it has.
    fireEvent.click(within(list).getByRole('button', { name: 'Mount Prau' }))
    expect(
      screen.getByRole('heading', { name: 'Mount Prau' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/on the trail/)).toBeNull()
  })
  it('DivingPanel lists dives newest first with a logbook page', () => {
    const base = {
      kind: 'scuba' as const,
      location: 'NTT',
      photos: [],
      note: '',
    }
    render(
      <DivingPanel
        items={[
          { ...base, id: 'a', site: 'Nusa Penida', depthM: 10, year: 2023 },
          {
            ...base,
            id: 'b',
            site: 'Manta Point',
            depthM: 18,
            year: 2025,
            note: 'Mantas!',
          },
          {
            ...base,
            id: 'c',
            kind: 'freedive',
            site: 'Bunaken',
            depthM: 12,
            year: null,
          },
        ]}
      />,
    )
    const list = screen.getByRole('list', { name: 'Dives, newest first' })
    expect(
      within(list)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Manta Point', 'Nusa Penida', 'Bunaken'])
    expect(
      screen.getByRole('heading', { name: 'Manta Point · 2025' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Depth about 18 m')).toBeInTheDocument()
    expect(screen.getByText('Mantas!')).toBeInTheDocument()
    expect(screen.getByText('Scuba')).toBeInTheDocument()
    fireEvent.click(within(list).getByRole('button', { name: 'Bunaken' }))
    expect(screen.getByRole('heading', { name: 'Bunaken' })).toBeInTheDocument()
    expect(screen.getByText('Freedive')).toBeInTheDocument()
  })
})
