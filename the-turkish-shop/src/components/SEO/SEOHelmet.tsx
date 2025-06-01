import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: string;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title = 'The Turkish Shop - Best Digital Game Currency & Gift Cards',
  description = 'Buy game currencies, gift cards, and digital products at the best prices. Valorant Points, Apex Coins, FIFA Points, Spotify Premium, Discord Nitro and more. Fast delivery, secure payment.',
  keywords = 'valorant points, apex coins, fifa points, roblox robux, spotify premium, discord nitro, game currency, gift cards, digital products, turkish shop',
  image = 'https://theturkishshop.com/og-image.jpg',
  url = 'https://theturkishshop.com',
  type = 'website',
  price,
  currency = 'GBP',
  availability = 'in stock'
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'product' ? "Product" : "Organization",
    ...(type === 'product' ? {
      "name": title,
      "description": description,
      "image": image,
      "offers": {
        "@type": "Offer",
        "price": price || "0",
        "priceCurrency": currency,
        "availability": `https://schema.org/${availability.replace(' ', '')}`,
        "seller": {
          "@type": "Organization",
          "name": "The Turkish Shop"
        }
      }
    } : {
      "name": "The Turkish Shop",
      "url": "https://theturkishshop.com",
      "logo": "https://theturkishshop.com/logo.png",
      "description": "Leading provider of digital game currencies and gift cards",
      "sameAs": [
        "https://twitter.com/theturkishshop",
        "https://discord.gg/theturkishshop"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+44-XXX-XXXXXXX",
        "contactType": "customer service",
        "availableLanguage": ["English"]
      }
    })
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="The Turkish Shop" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The Turkish Shop" />
      <meta property="og:locale" content="en_GB" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@theturkishshop" />
      <meta name="twitter:creator" content="@theturkishshop" />
      
      {/* Product specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
        </>
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHelmet; 