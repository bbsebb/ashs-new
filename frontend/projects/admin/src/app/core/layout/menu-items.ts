import {MenuItem} from '@shared-ui';

/**
 * Configuration for the administration side navigation menu.
 * Defines the icons, labels, and routes for each administrative section.
 */
export const menuItems: MenuItem[] = [
  { icon: 'military_tech', label: 'Saison', path: '/seasons' },
  { icon: 'stadium', label: 'Salle', path: '/halls' },
  { icon: 'diversity_3', label: 'Équipe', path: '/teams' },
  { icon: 'supervisor_account', label: 'Entraineur', path: '/staffs' },
];
