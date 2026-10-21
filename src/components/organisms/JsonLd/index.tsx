import { site } from '@constants/site'
import { education } from '@content/education'

export default function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: 'Full Stack Software Engineer',
    email: `mailto:${site.email}`,
    url: site.url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bogor',
      addressCountry: 'ID',
    },
    worksFor: { '@type': 'Organization', name: 'Jitera' },
    alumniOf: education
      .filter((e) => e.end !== 'present')
      .map((e) => ({
        '@type': 'EducationalOrganization',
        name: e.institution,
      })),
    sameAs: [site.linkedin, site.github].filter(Boolean),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
