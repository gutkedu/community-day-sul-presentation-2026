/** @type {import('@eventcatalog/core/bin/eventcatalog.config').Config} */
export default {
  title: 'Contracts Give Architecture Meaning',
  tagline: 'Queries, Commands and Events in a fictional order system',
  organizationName: 'Community Day Demo',
  theme: 'sunset',
  homepageLink: 'https://eventcatalog.dev/',
  // Supports static or server. Static renders a static site, server renders a server side rendered site
  // large catalogs may benefit from server side rendering
  output: 'static',
  host: '127.0.0.1',
  port: 3117,
  // By default set to false, add true to get urls ending in /
  trailingSlash: false,
  // Change to make the base url of the site different, by default https://{website}.com/docs,
  // changing to /company would be https://{website}.com/company/docs,
  base: '/',
  // Resource search is the default lightweight search. Change this to { type: 'indexed' }
  // to enable full-content search. Indexed search requires running a build to generate the index.
  search: {
    type: 'resource',
  },
  // Customize the navigation for your docs sidebar.
  // read more at https://eventcatalog.dev/docs/development/customization/customize-sidebars/documentation-sidebar
  navigation: {
    pages: ['list:all'],
    groups: [
      { id: 'main', items: [{ id: 'home' }, { id: 'docs' }] },
      { id: 'architecture', label: 'Arquitetura', items: [
        { id: 'domain-map', label: 'Mapa dos domínios', icon: 'Network', href: '/visualiser/domain-integrations' },
      ] },
      { id: 'browse', label: 'Browse', items: [{ id: 'catalog' }, { id: 'schemas' }, { id: 'schema-insights' }] },
      { id: 'organization', label: 'Organization', items: [{ id: 'teams' }, { id: 'users' }] },
      { id: 'settings', position: 'bottom', items: [{ id: 'settings' }] },
    ],
  },
  // Customize the logo, add your logo to public/ folder
  logo: {
    alt: 'EventCatalog Logo',
    src: '/logo.png',
    text: 'Community Day Architecture',
  },
  // This lets you copy markdown contents from EventCatalog to your clipboard
  // Including schemas for your events and services
  llmsTxt: {
    enabled: true,
  },
  // required random generated id used by eventcatalog
  cId: '6a1aa05e-483c-4acf-b6cb-02791019560d',
};
