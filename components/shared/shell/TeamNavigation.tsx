import {
  Cog6ToothIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('emails'),
      href: `/teams/${slug}/emails`,
      icon: EnvelopeOpenIcon,
      active: activePathname === `/teams/${slug}/emails`,
    },
    {
      name: t('email-templates'),
      href: `/teams/${slug}/templates`,
      icon: EnvelopeIcon,
      active: activePathname === `/teams/${slug}/templates`,
    },
    {
      name: t('content'),
      href: `/teams/${slug}/content`,
      icon: BookOpenIcon,
      active: activePathname === `/teams/${slug}/content`,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}/settings`) &&
        !activePathname.includes('products'),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
