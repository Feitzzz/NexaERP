# NexaERP Docker guide

This guide explains the complete Docker workflow, including the difference
between development and production, how application images relate to
containers, why database data survives image rebuilds, and when migrations
must be run.

## How the Docker setup works

The repository has two Compose configurations:

- `docker-compose.yml` runs the development environment.
- `docker-compose.prod.yml` runs the image-contained production environment.

The services are:

- `app`: serves Laravel through FrankenPHP on port 8080.
- `vite`: serves development frontend assets and HMR on port 5173. It only
  exists in the development configuration.
- `postgres`: runs PostgreSQL 17.
- `worker`: optionally processes Laravel queue jobs.
- `scheduler`: optionally runs Laravel scheduled tasks.

Both Compose files currently use the project name `nexaerp` and the same
service and volume names. Development and production therefore cannot run
side-by-side as independent stacks. Stop one before starting the other.

### Images, containers, and volumes

An image is the packaged application template. A container is a running
instance created from an image. A volume stores persistent data outside the
container.

Rebuilding an image updates packaged application code, but it does not delete
or migrate PostgreSQL data.

The important mounts in development are:

| Mount | Purpose |
| --- | --- |
| Repository directory -> `/app` | Makes local source changes immediately available in the containers |
| `nexaerp_vendor-data` -> `/app/vendor` | Persists Composer dependencies |
| `nexaerp_node-modules-data` -> `/app/node_modules` | Persists npm dependencies |
| `nexaerp_app-storage` -> `/app/storage/app` | Persists application files |
| `nexaerp_postgres-data` -> `/var/lib/postgresql/data` | Persists all database records |

The development source bind mount overlays the `/app` code included in
`nexaerp-app:development`. This is intentional. Production has no source bind
mount, so its application code and compiled frontend assets come entirely from
`nexaerp-app:latest` (or the configured `APP_IMAGE_TAG`).

## Requirements

- Docker Desktop must be installed and running.
- Run commands from the repository root.
- Ensure ports 8080 and 5173 are not already occupied.

Compose automatically reads variable substitution values from the repository
`.env` file. Inside Docker, PostgreSQL must use `DB_HOST=postgres`, not
`localhost`.

## First development start

Create `.env` if it does not exist:

```sh
cp .env.example .env
```

Build the development image and start the application, Vite, and PostgreSQL:

```sh
docker compose up -d --build
```

If `APP_KEY` is empty, generate it:

```sh
docker compose exec app php artisan key:generate
```

Run migrations after PostgreSQL is healthy:

```sh
docker compose exec app php artisan migrate --force
```

Then open:

- Application: <http://localhost:8080>
- Vite development server: <http://localhost:5173>

The migration command is required for every newly created database volume.
Building an image or starting a PostgreSQL container does not create Laravel's
tables by itself.

## Everyday development

Start existing containers:

```sh
docker compose up -d
```

Rebuild after changing the Dockerfile, PHP extensions, `composer.lock`, or
`package-lock.json`:

```sh
docker compose up -d --build
```

Useful commands:

```sh
# Show container state and health
docker compose ps

# Follow logs
docker compose logs -f app
docker compose logs -f vite
docker compose logs -f postgres

# Run Laravel, Composer, and npm commands
docker compose exec app php artisan about
docker compose exec app composer install
docker compose exec vite npm run build

# Run tests
docker compose exec app php artisan test

# Clear Laravel's cached configuration, routes, and views
docker compose exec app php artisan optimize:clear

# Stop containers while retaining all persistent data
docker compose down
```

Enable the optional worker and scheduler with:

```sh
docker compose --profile background up -d
```

## Production-style local run

The production image contains the Laravel source, production Composer
dependencies, and compiled Vite assets. It does not mount the repository and
does not run the Vite development server.

First configure a valid `APP_KEY` and appropriate database credentials in
`.env` or in the deployment environment. Then stop the development stack:

```sh
docker compose down
```

Build and instantiate containers from the production image:

```sh
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

Apply migrations to the database used by that stack:

```sh
docker compose -f docker-compose.prod.yml exec app \
  php artisan migrate --force
```

Verify the deployment:

```sh
docker compose -f docker-compose.prod.yml ps
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
curl --fail http://localhost:8080/up
curl --fail http://localhost:8080/login
```

The application container should show an image such as
`nexaerp-app:latest`, not `nexaerp-app:development`.

Enable production background processes when needed:

```sh
docker compose -f docker-compose.prod.yml \
  --profile background up -d
```

Every production deployment should follow this order:

1. Build the new production image.
2. Start or recreate the containers.
3. Wait for PostgreSQL to become healthy.
4. Run `php artisan migrate --force` exactly once as a release step.
5. Verify `/up`, `/login`, and container logs.

Do not automatically run production migrations from every app, worker, or
scheduler entrypoint. Multiple replicas could attempt the migration at the
same time. Use a single deployment/release command instead.

## Why old application data remains after rebuilding

`nexaerp_postgres-data` is a named volume. Docker reattaches it when PostgreSQL
is recreated, so existing users, products, invoices, and other records remain
available after commands such as:

```sh
docker compose down
docker compose up -d --build
```

This is expected. Images contain software; the PostgreSQL volume contains the
application's database data.

To update the database schema while keeping records, run:

```sh
docker compose exec app php artisan migrate --force
```

## Intentionally start with a completely empty database

Stop the stack before removing its database volume:

```sh
docker compose down
docker volume rm nexaerp_postgres-data
```

Warning: removing `nexaerp_postgres-data` permanently deletes all database
records in that volume.

Start the desired stack and immediately migrate the new empty database.

For development:

```sh
docker compose up -d --build
docker compose exec app php artisan migrate --force
```

For production-style local use:

```sh
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app \
  php artisan migrate --force
```

Avoid `docker compose down --volumes` unless you intend to delete every named
volume belonging to the stack, including application storage and dependency
volumes.

## Reset only development dependencies

If Composer or npm dependencies are stale, remove only their named volumes.
This preserves PostgreSQL and application storage:

```sh
docker compose down
docker volume rm \
  nexaerp_vendor-data \
  nexaerp_node-modules-data \
  nexaerp_dependency-locks
docker compose up -d --build
```

## Troubleshooting

### `relation "sessions" does not exist`

Laravel uses database-backed sessions because `SESSION_DRIVER=database`. This
error means the database serving the application does not contain the
`sessions` table. It commonly occurs immediately after deleting or recreating
the PostgreSQL volume.

Fix it with:

```sh
docker compose exec app php artisan migrate --force
docker compose exec app php artisan optimize:clear
```

For the production configuration, include its Compose file in both commands:

```sh
docker compose -f docker-compose.prod.yml exec app \
  php artisan migrate --force
docker compose -f docker-compose.prod.yml exec app \
  php artisan optimize:clear
```

Confirm the migrations and page response:

```sh
docker compose exec app php artisan migrate:status
curl --fail http://localhost:8080/login
```

If Laravel prints `Preparing database` and `Creating migration table`, the
database was empty and had never been migrated. A migration run against an old
volume does not carry over after that volume is deleted.

### The wrong image is running

Check the active image:

```sh
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

Expected image tags:

- Development: `nexaerp-app:development`
- Production: `nexaerp-app:latest` or the value of `APP_IMAGE_TAG`

Because both configurations share the `nexaerp` project name, starting one can
replace containers created by the other. Stop the current configuration before
switching modes.

### Code or frontend changes look stale

Development source changes come from the host bind mount. Check that the `app`
and `vite` containers are healthy, then clear Laravel caches:

```sh
docker compose ps
docker compose exec app php artisan optimize:clear
docker compose restart app vite
```

Production code and assets are baked into the image, so rebuild and recreate:

```sh
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### Database connection failures

Check PostgreSQL health and logs:

```sh
docker compose ps
docker compose logs postgres
```

Within Compose, use these settings:

```text
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
```

`localhost` inside the app container refers to the app container itself, not
the PostgreSQL container.

### No application encryption key

For development:

```sh
docker compose exec app php artisan key:generate
```

For production, generate and retain one secure `APP_KEY` in the deployment's
secret manager. Do not generate a different key whenever containers restart;
changing it invalidates encrypted data and existing sessions.

## Production data and secrets

Do not bake `.env` or secrets into the production image. Supply `APP_KEY`,
database credentials, and other sensitive values through the deployment
environment or secret manager.

Do not rely on a container's writable layer for user uploads. Persist
`/app/storage/app` with a volume, as this Compose setup does, or configure an
external object store such as S3.
