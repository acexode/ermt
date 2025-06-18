import { useAuth } from 'src/context/auth-context';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[];
};

export const useNavData = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/home',
      icon: icon('ic-analytics'),
    },
    {
      title: 'Users',
      path: '/user',
      icon: icon('ic-user'),
    },
    {
      title: 'Providers',
      path: '/providers',
      icon: icon('ic-provider'),
      roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
      title: 'Departments',
      path: '/departments',
      icon: icon('ic-department'),
      roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
      title: 'Sections',
      path: '/sections',
      icon: icon('ic-section'),
      roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
      title: 'Disciplines',
      path: '/disciplines',
      icon: icon('ic-discipline'),
      roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
      title: 'Requests',
      path: '/requests',
      icon: icon('ic-cart'),
    },
  ];

  return navItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));
};
