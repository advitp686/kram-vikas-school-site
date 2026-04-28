import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const siteUrl = (process.env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

const routes = [
  '/',
  '/about',
  '/method',
  '/classes',
  '/worksheets',
  '/teachers',
  '/parent-corner',
  '/admissions',
  '/login',
  '/privacy',
  '/terms',
]

const publicDir = path.resolve(import.meta.dirname, '..', 'public')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

await mkdir(publicDir, { recursive: true })
await writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8')
await writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8')
