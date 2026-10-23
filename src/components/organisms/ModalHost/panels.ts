import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'

import AboutPanel from '@components/organisms/AboutPanel'
import ContactPanel from '@components/organisms/ContactPanel'
import EducationPanel from '@components/organisms/EducationPanel'
import ExperiencePanel from '@components/organisms/ExperiencePanel'
import GamingPanel from '@components/organisms/GamingPanel'
import ProjectsPanel from '@components/organisms/ProjectsPanel'
import RemoteWorkPanel from '@components/organisms/RemoteWorkPanel'
import ResumePanel from '@components/organisms/ResumePanel'
import SkillsPanel from '@components/organisms/SkillsPanel'

import type { SectionSlug } from '@interfaces/section'

// The three hobby panels are the heaviest (map, skyline, depth chart, photo
// slider), so they load in their own chunks when opened. They still render on
// the server, so a direct link has their text in the HTML.
const TravelPanel = dynamic(() => import('@components/organisms/TravelPanel'))
const HikingPanel = dynamic(() => import('@components/organisms/HikingPanel'))
const DivingPanel = dynamic(() => import('@components/organisms/DivingPanel'))

export const panelComponents: Record<SectionSlug, ComponentType> = {
  about: AboutPanel,
  experience: ExperiencePanel,
  projects: ProjectsPanel,
  skills: SkillsPanel,
  education: EducationPanel,
  gaming: GamingPanel,
  travel: TravelPanel,
  hiking: HikingPanel,
  diving: DivingPanel,
  'remote-work': RemoteWorkPanel,
  contact: ContactPanel,
  resume: ResumePanel,
}
