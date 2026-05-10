const Blog = require('../models/blog');

const SITE_URL = 'https://cpddblog.onrender.com';

const CATEGORIES = [
  'Technology', 'Travel', 'Food & Drink',
  'Health & Wellness', 'Lifestyle', 'Business & Finance',
  'Entertainment', 'Education'
];

const getSitemap = async (req, res) => {
  try {
    const blogs = await Blog.find({}, '_id updatedAt').lean();

    const staticPages = ['', '/blogs', '/about'].map(path => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const blogPages = blogs.map(blog => `
  <url>
    <loc>${SITE_URL}/blogs/${blog._id}</loc>
    <lastmod>${new Date(blog.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    const categoryPages = CATEGORIES.map(cat => `
  <url>
    <loc>${SITE_URL}/blogs/category/${encodeURIComponent(cat)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages}${blogPages}${categoryPages}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Could not generate sitemap');
  }
};

module.exports = { getSitemap };