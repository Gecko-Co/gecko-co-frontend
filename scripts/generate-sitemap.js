const { SitemapStream } = require('sitemap');
const { createWriteStream } = require('fs');

let links = [
 { url: '/', changefreq: 'daily', priority: 0.3 },
 // add more urls as needed
];

let sitemap = new SitemapStream({ hostname: 'https://geckoco.ph' });

let writeStream = createWriteStream('./public/sitemap.xml');
sitemap.pipe(writeStream);

links.forEach(link => {
 sitemap.write(link);
});

sitemap.end();

// Manually handle the stream events
writeStream.on('finish', () => {
 console.log('Sitemap created!');
});

writeStream.on('error', (error) => {
 console.error('Error creating sitemap:', error);
});
