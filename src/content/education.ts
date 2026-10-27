import type { IEducation } from '@models/education'

export const education: readonly IEducation[] = [
  {
    id: 'binus',
    kind: 'degree',
    program: "Computer Science, Bachelor's degree",
    institution: 'BINUS (Bina Nusantara) University',
    location: 'Jakarta, Indonesia',
    start: '2023-05',
    end: 'present',
    note: 'Online program, expected June 2027',
  },
  {
    id: 'hacktiv8',
    kind: 'bootcamp',
    program: 'Immersive Full Stack JavaScript',
    institution: 'Hacktiv8',
    location: 'Jakarta, Indonesia',
    start: '2020-07',
    end: '2020-10',
    note: 'Honors Graduate, final score 94.79/100',
    honors: true,
  },
  {
    id: 'smkn3',
    kind: 'school',
    program: 'Computer & Network Engineering',
    institution: 'SMK Negeri 3 Bogor',
    location: 'Bogor, Indonesia',
    start: '2017-07',
    end: '2020-07',
    note: 'Final score 84/100',
  },
]
