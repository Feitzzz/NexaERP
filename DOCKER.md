# Docker guide

This setup builds one production image and runs it in three possible roles:

- `app`: FrankenPHP serves Laravel from `public/` on port 8080.
- `worker`: processes database queue jobs from the same image.
- `scheduler`: runs Laravel's scheduler from the same image.
- `postgres`: a local-only database. Use managed PostgreSQL in production.

The current application has no queued jobs and no scheduled tasks, so only the
web process is required today. The two background processes are retained in the
optional `background` Compose profile for future use.

## First local start

Docker Compose reads `.env` when it exists. If your existing `.env` is for a
non-Docker setup, back it up before changing its database host.

```sh
cp .env.example .env
docker compose build
docker compose run --rm app php artisan key:generate
docker compose up -d
docker compose exec app php artisan migrate
```

The application is then available at <http://localhost:8080>. The PostgreSQL
port is intentionally not exposed to the host.

Start the currently optional worker and scheduler with:

```sh
docker compose --profile background up -d
```

## Everyday commands and tests

```sh
# See service state and health
docker compose ps

# Verify Laravel and the compiled assets
curl --fail http://localhost:8080/up
docker compose exec app test -f public/build/manifest.json

# Inspect Laravel and run the automated tests
docker compose exec app php artisan about
docker compose exec app php artisan test

# Logs
docker compose logs app
docker compose --profile background logs worker scheduler
docker compose logs postgres

# Any Artisan command
docker compose exec app php artisan route:list

# Stop containers while retaining database and upload data
docker compose down

# Intentionally delete local database and application-storage volumes
docker compose down --volumes
```

The final production image excludes development dependencies and the `tests`
directory. To run tests inside Docker using the same PHP environment, use the
dedicated test stage:

```sh
docker build --target test -t nexaerp-test .
docker run --rm \
  -e APP_ENV=testing \
  -e APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
  -e DB_CONNECTION=sqlite \
  nexaerp-test php artisan test
```

## Production environment

Configure secrets on the deployment platform; never copy `.env` into the
image. Required values are:

```text
APP_NAME
APP_ENV=production
APP_KEY
APP_DEBUG=false
APP_URL=https://your-domain.example
LOG_CHANNEL=stderr
LOG_LEVEL=info
DB_CONNECTION=pgsql
DB_HOST
DB_PORT=5432
DB_DATABASE
DB_USERNAME
DB_PASSWORD
DB_SSLMODE=require
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK
```

`SERVER_NAME=:8080` and the platform's `PORT` mapping should route traffic to
container port 8080. If the platform injects a different internal port, set
`SERVER_NAME=:<port>` explicitly.

For permanent user uploads, do not rely on the image filesystem. This
repository does not currently write uploaded files, but if that changes either
mount persistent storage at `/app/storage/app` or install/configure Laravel's
S3 adapter and set `FILESYSTEM_DISK=s3`.

## Production deployment sequence

1. Build and push the `production` target.
2. Provision managed PostgreSQL and configure all runtime environment values.
3. Deploy a web process with the image's default command.
4. Run exactly once as a release command:
   `php artisan migrate --force`
5. Run `php artisan optimize` after runtime variables are available.
6. Start or restart `php artisan queue:work --sleep=3 --tries=3 --timeout=90`
   only when asynchronous jobs are introduced.
7. Start `php artisan schedule:work` only when scheduled tasks are introduced.
8. Verify `/up`, a login flow, a Vite asset URL, and process logs.

After each deployment that changes code or configuration, run `php artisan
optimize`, then restart long-running queue workers so they load the new code.
Do not generate an application key, seed data, or automatically migrate from a
container entrypoint.

## Troubleshooting

- `could not translate host name`: inside containers, use `DB_HOST=postgres`,
  not `localhost`.
- `No application encryption key`: run `docker compose run --rm app php artisan
  key:generate` locally, or configure a persistent secret in production.
- Database connection failures: wait for `docker compose ps` to show PostgreSQL
  as healthy, then compare the `DB_*` values used by both services.
- Permission errors: `/app/storage/app` is a named volume locally. A production
  mount must be writable by container UID 10001.
- Stale configuration: run `docker compose exec app php artisan optimize:clear`
  and then `docker compose exec app php artisan optimize`.
