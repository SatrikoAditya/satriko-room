import { render, screen } from '@testing-library/react'
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
    expect(
      screen.getByText(/Agile Collaboration and Coordination/),
    ).toBeInTheDocument()
    expect(screen.getByText('Remote · Singapore')).toBeInTheDocument()
  })
  it('SkillsPanel renders five shelves and derives "Used at"', () => {
    render(<SkillsPanel />)
    expect(screen.getAllByRole('list', { name: /shelf/i })).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'NestJS' })).toBeInTheDocument()
  })
  it('EducationPanel marks Hacktiv8 as honors', () => {
    render(<EducationPanel />)
    expect(screen.getByText(/Honors Graduate/)).toBeInTheDocument()
  })
  it('hobby panels show the empty state when there is no content', () => {
    render(<GamingPanel />)
    expect(
      screen.getByText(/Oyen is still choosing a game/),
    ).toBeInTheDocument()
    render(<TravelPanel />)
    expect(
      screen.getByText(/Oyen is still pinning the map/),
    ).toBeInTheDocument()
    render(<HikingPanel />)
    expect(screen.getByText(/trail photos/)).toBeInTheDocument()
    render(<DivingPanel />)
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
})
