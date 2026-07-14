import type { PageId, Role } from '../data/types'

export interface NavItem {
  id: PageId
  label: string
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Today', roles: ['student', 'lecturer', 'hod', 'dean', 'admin'] },
  { id: 'courses', label: 'My courses', roles: ['student'] },
  { id: 'calendar', label: 'Calendar', roles: ['student', 'lecturer'] },
  { id: 'timetable', label: 'Timetable', roles: ['lecturer'] },
  { id: 'reports', label: 'Reports', roles: ['lecturer', 'hod', 'dean', 'admin'] },
  { id: 'users', label: 'Users', roles: ['hod', 'dean', 'admin'] },
  { id: 'courses-admin', label: 'Courses', roles: ['hod', 'dean', 'admin'] },
  { id: 'hierarchy', label: 'Hierarchy', roles: ['admin'] },
  { id: 'timetable-admin', label: 'Timetable', roles: ['hod', 'dean', 'admin'] },
  { id: 'lecturer-attendance', label: 'Lecturer records', roles: ['hod', 'dean', 'admin'] },
]

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role))
}

export function defaultPageForRole(_role: Role): PageId {
  return 'dashboard'
}

export function adminSectionsForRole(role: Role): string[] {
  switch (role) {
    case 'hod':
      return ['overview', 'reports', 'users', 'courses-admin', 'timetable-admin', 'lecturer-attendance']
    case 'dean':
      return ['overview', 'reports', 'users', 'courses-admin', 'timetable-admin', 'lecturer-attendance']
    case 'admin':
      return ['overview', 'reports', 'users', 'courses-admin', 'hierarchy', 'timetable-admin', 'lecturer-attendance']
    default:
      return []
  }
}
