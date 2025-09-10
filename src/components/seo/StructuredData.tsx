import Script from 'next/script';

interface StructuredDataProps {
  data: any;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

// Website schema for homepage
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SlackDori',
  description: 'One-click Slack emoji pack installation service',
  url: 'https://slackdori.asyncsite.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://slackdori.asyncsite.com/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

// Organization schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AsyncSite',
  url: 'https://asyncsite.com',
  logo: 'https://slackdori.asyncsite.com/logo.png',
  sameAs: [
    'https://github.com/AsyncSite'
  ]
};

// Software Application schema for the service
export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SlackDori',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127'
  }
};

// FAQ schema for common questions
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I install emoji packs to Slack?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SlackDori allows you to install entire emoji packs with one click. Simply browse our collection, connect your Slack workspace, and click install.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is SlackDori free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, SlackDori is completely free. All emoji packs are available at no cost.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do I need admin permissions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, you need admin permissions in your Slack workspace to install custom emojis.'
      }
    }
  ]
};

// Create schema for emoji pack
export function createPackSchema(pack: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: pack.name,
    description: pack.description,
    creator: {
      '@type': 'Organization',
      name: pack.author
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'image/png',
      contentUrl: `https://slackdori.asyncsite.com/packs/${pack.id}`
    },
    keywords: pack.tags.join(', '),
    datePublished: pack.createdAt,
    dateModified: pack.updatedAt
  };
}