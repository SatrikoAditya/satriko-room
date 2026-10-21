import type { ComponentType } from 'react'

import AboutPanel from '@components/organisms/AboutPanel'
import ContactPanel from '@components/organisms/ContactPanel'
import DivingPanel from '@components/organisms/DivingPanel'
import EducationPanel from '@components/organisms/EducationPanel'
import ExperiencePanel from '@components/organisms/ExperiencePanel'
import GamingPanel from '@components/organisms/GamingPanel'
import HikingPanel from '@components/organisms/HikingPanel'
import RemoteWorkPanel from '@components/organisms/RemoteWorkPanel'
import ResumePanel from '@components/organisms/ResumePanel'
import SkillsPanel from '@components/organisms/SkillsPanel'
import TravelPanel from '@components/organisms/TravelPanel'

import type { SectionSlug } from '@interfaces/section'

export const panelComponents: Record<SectionSlug, ComponentType> = {
  about: AboutPanel,
  experience: ExperiencePanel,
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
