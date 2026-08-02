# NexaERP

## Continuous integration and production

GitHub Actions validates formatting, static analysis, frontend compilation,
PostgreSQL behavior, and the production Docker image on every pull request and
push to `main`. Render or Laravel Cloud can then deploy only the successfully
tested commit. See the [production deployment guide](docs/production-deployment.md)
for platform setup, environment variables, branch protection, and the launch
checklist.

## Docker development

Build and start the application, Vite, and PostgreSQL:

```bash
docker compose up -d --build
```

Application changes are bind-mounted into the containers, and Vite serves frontend changes with HMR at `http://localhost:5173`. Set `VITE_USE_POLLING=true` before starting Compose only if file events are unreliable on your Docker Desktop installation.

Run project commands with:

```bash
docker compose exec app php artisan <command>
docker compose exec app composer <command>
docker compose exec vite npm <command>
```

The optional queue worker and scheduler can be enabled with:

```bash
docker compose --profile background up -d
```

Stop development containers without deleting persistent data:

```bash
docker compose down
```

Composer and npm dependencies live in named volumes. To reset only those dependency volumes (without deleting PostgreSQL or Laravel storage), stop the stack and remove them explicitly:

```bash
docker compose down
docker volume rm nexaerp_vendor-data nexaerp_node-modules-data nexaerp_dependency-locks
docker compose up -d --build
```

## Docker production

Provide production secrets such as `APP_KEY` and database credentials through the deployment environment or secret manager. Then build and start the immutable production image:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Enable the queue worker and scheduler when required:

```bash
docker compose -f docker-compose.prod.yml --profile background up -d
```

Run migrations as a separate deployment step after the database is healthy:

```bash
docker compose -f docker-compose.prod.yml run --rm app \
  php artisan migrate --force
```

Production containers contain the application source, Composer production dependencies, and compiled Vite assets. They do not mount host source code or run a Vite development server; application releases therefore require a new image build.
