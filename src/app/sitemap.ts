import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString()

  return [
    {
      url: 'https://dinletiyo.com',
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://dinletiyo.com/login',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://dinletiyo.com/signup',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://dinletiyo.com/home',
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://dinletiyo.com/gizlilik',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://dinletiyo.com/kosullar',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
