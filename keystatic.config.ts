import { config, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'ux-portfolio/ux-portfolio',
  },
  singletons: {
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/homepage',
      format: { data: 'json' },
      schema: {
        heroHeadingBefore: fields.text({ label: 'Hero heading (before bold)' }),
        heroHeadingBold: fields.text({ label: 'Hero heading (bold text)' }),
        heroHeadingAfter: fields.text({ label: 'Hero heading (after bold)' }),
        heroHeadingHighlight: fields.text({ label: 'Hero heading (highlighted word)' }),
        heroHeadingEnd: fields.text({ label: 'Hero heading (after highlight)' }),
        heroDescription: fields.text({ label: 'Hero description', multiline: true }),
        caseStudies: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            description: fields.text({ label: 'Description' }),
            image: fields.text({ label: 'Image path' }),
            imageAlt: fields.text({ label: 'Image alt text' }),
            link: fields.text({ label: 'Link URL' }),
          }),
          {
            label: 'Case Studies',
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        contactDescription: fields.text({ label: 'Contact description', multiline: true }),
        contactEmail: fields.text({ label: 'Email' }),
        contactPhone: fields.text({ label: 'Phone' }),
        ctaHeading: fields.text({ label: 'CTA heading' }),
        ctaDescription: fields.text({ label: 'CTA description' }),
        ctaLinkText: fields.text({ label: 'CTA link text' }),
      },
    }),
  },
});
