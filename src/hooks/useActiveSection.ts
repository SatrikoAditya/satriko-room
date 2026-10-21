'use client'

import { usePathname } from 'next/navigation'

import { slugFromPathname } from '@constants/sections'

export function useActiveSection() {
  return slugFromPathname(usePathname() ?? '/')
}
