# benjury.dev

A Node.js and Express website. Requires Node.js 22.9 or newer.

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. Development mode restarts the server when JavaScript changes. Restart it after editing HTML templates, which are loaded at startup; refresh the browser after CSS changes.

```sh
npm start
npm test
```

`npm start` runs the production server. Set `PORT` to override the default of 3000. Hosting must run the Node process; a static file server or VS Code Live Server no longer handles page routing.

Both start commands load `.env` when it exists; environment variables set by your host take precedence. Set `NODE_ENV=production` in `.env` when deploying. The `.env` file is ignored by Git. Restart the server after changing it.

## Structure

- `app.js`: Express routes for `/`, `/projects`, `/fish`, `/contact`, and `/about`, public asset mounts, redirects, and 404 responses.
- `server.js`: HTTP listener.
- `views/layout.html`: shared page shell and navigation.
- `views/pages/`: page HTML inserted by the server.
- `scripts/`: browser animations, interaction setup, and mobile navigation.
- `styles/`, `images/`, `ascii-fish/`: public assets.
- `test/routes.test.js`: HTTP route and asset checks using Node's test runner.

Navigation uses ordinary links and full page requests. A small browser compatibility handler redirects old hash bookmarks such as `/#fish` to `/fish`.

The contact form still has no email backend. It displays a message directing visitors to email; it does not send or store submissions.

## Docker

Build and start the container from the project directory:

```sh
docker build -t benjury-dev:local .
docker run -d --name benjury-dev --restart unless-stopped --init \
  -p 3001:3000 -e NODE_ENV=production -e PORT=3000 \
  benjury-dev:local
```

Open `http://localhost:3001` on the Docker host, or `http://<server-ip>:3001` from another device. The image runs as the unprivileged `node` user and includes a health check. No persistent volumes or `.env` file are required; use container environment variables. Configure HTTPS and public access separately for an internet-facing deployment.

To update, get the latest source, build again, stop and remove the `benjury-dev` container, then rerun the command above. Keep the previous image if you need to roll back.
