import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../app.js';

let server;
let base;
before(async () => {
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => {
    server.close(resolve);
    server.closeAllConnections();
}));

for (const [path, marker, script] of [
    ['/', 'home-hero', 'home/canvas.js'],
    ['/projects', 'Kelpos Desktop', null],
    ['/fish', 'fishOne-hunger', 'fish/fishpage.js'],
    ['/contact', 'contact-form', 'contact/contactpage.js'],
    ['/about', 'terminal-input', 'about/terminal.js'],
]) {
    test(`${path} returns complete HTML without client-side rendering`, async () => {
        const response = await fetch(base + path);
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /text\/html/);
        const html = await response.text();
        assert.ok(html.includes(marker));
        assert.ok(html.includes('href="/fish"'));
        assert.ok(!html.includes('routing.js'));
        assert.ok(!html.includes('{{'));
        if (script) assert.ok(html.includes(script));
        for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
            if (/^(?:https?:|mailto:)/.test(match[1])) continue;
            const asset = await fetch(new URL(match[1], base));
            assert.equal(asset.status, 200, match[1]);
        }
    });
}

test('direct nested URL with query and trailing slash works', async () => {
    const response = await fetch(base + '/fish/?preview=1');
    assert.equal(response.status, 200);
    assert.match(await response.text(), /ascii-fish/);
});

test('legacy document URLs redirect and preserve query parameters', async () => {
    for (const path of ['/index.html', '/home']) {
        const response = await fetch(base + path + '?preview=1', { redirect: 'manual' });
        assert.equal(response.status, 301);
        assert.equal(response.headers.get('location'), '/?preview=1');
    }
});

test('unknown routes and private project files are not served', async () => {
    for (const path of ['/missing', '/server.js', '/package.json', '/views/layout.html', '/.git/config', '/styles/missing.css']) {
        const response = await fetch(base + path);
        assert.equal(response.status, 404, path);
    }
});

test('fish food and screenshot assets are served', async () => {
    for (const path of ['/ascii-fish/foodball.txt', '/images/hyprland-flex22.png']) {
        assert.equal((await fetch(base + path)).status, 200);
    }
});
