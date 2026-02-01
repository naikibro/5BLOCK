import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/running-the-project'],
    },
    {
      type: 'category',
      label: 'Technical',
      items: [
        'technical/tech-stack',
        'technical/infrastructure',
        'technical/sepolia',
        'technical/smart-contracts',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/catalog',
        'features/inventory',
        'features/trade',
        'features/history',
      ],
    },
  ],
};

export default sidebars;
