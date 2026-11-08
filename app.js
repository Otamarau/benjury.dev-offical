import express from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = express();
const layout = readFileSync(new URL('./views/layout.html', import.meta.url), 'utf8');
const pages = {
    home: { path: '/', label: 'Welcome', scripts: ['home/canvas.js'] },
    projects: { path: '/projects', label: 'Projects', scripts: [] },
    fish: { path: '/fish', label: 'My_Fish_Tank', scripts: ['fish/fishdesc.js', 'fish/fishpage.js'] },
    contact: { path: '/contact', label: 'Contact', scripts: ['contact/contactpage.js'] },
    about: { path: '/about', label: 'About', scripts: ['about/terminal.js'] },
};

app.disable('x-powered-by');

// Only public asset directories are exposed, never the repository root.
for (const directory of ['styles', 'scripts', 'images', 'ascii-fish']) {
    app.use(`/${directory}`, express.static(fileURLToPath(new URL(`./${directory}/`, import.meta.url))));
}

for (const [name, page] of Object.entries(pages)) {
    const content = readFileSync(new URL(`./views/pages/${name}.html`, import.meta.url), 'utf8');
    const html = layout
        .replace('{{PAGE}}', name)
        .replace('{{TITLE}}', name === 'home' ? 'benjury.dev' : `${page.label} | benjury.dev`)
        .replace('{{LABEL}}', page.label)
        .replace('<!-- PAGE_SCRIPTS -->', () => page.scripts.map(src => `<script src="scripts/${src}" defer></script>`).join('\n        '))
        .replace('<!-- PAGE_CONTENT -->', () => content);
    app.get(page.path, (_req, res) => res.type('html').send(html));
}

app.get(['/home', '/index.html'], (req, res) => {
    const query = req.originalUrl.indexOf('?');
    res.redirect(301, '/' + (query < 0 ? '' : req.originalUrl.slice(query)));
});

app.use((_req, res) => {
    res.status(404).type('html').send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | benjury.dev</title><h1>Page not found</h1><p><a href="/">Back to home</a></p></html>');
});

export default app;
