import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AboutPanel from './AboutPanel'
import ContactPanel from './ContactPanel'
import DivingPanel from './DivingPanel'
import EducationPanel from './EducationPanel'
import ExperiencePanel from './ExperiencePanel'
import GamingPanel from './GamingPanel'
import HikingPanel from './HikingPanel'
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
})
