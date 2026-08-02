# Production deployment

GitHub Actions owns continuous integration (CI). Choose either Render or Laravel
Cloud for continuous deployment (CD); do not configure both for the same
production branch.

## GitHub repository setup

1. Open **Settings > Branches > Branch protection rules** and protect `main`.
2. Require pull requests and the **CI passed** status check before merging.
3. Require branches to be up to date before merging.
4. Do not add production credentials to GitHub unless a deployment hook needs
   them. CI uses isolated credentials declared in the workflow.

The pipeline checks PHP and frontend formatting, ESLint, TypeScript, PHPStan,
Pest on PostgreSQL 17, the Vite production build, and the production Docker
image. Every check is read-only.

## Render

Create a Git-backed Web Service from this repository with these settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Health check | `/up` |
| Pre-deploy command | `php artisan migrate --force` |
| Auto-deploy | After CI Checks Pass |

Attach a managed PostgreSQL database and configure the service variables below.
The pre-deploy command requires a paid web service. Do not attach a persistent
disk merely for Laravel's runtime directories; the image creates those
directories and application uploads should use object storage.

Render owns CD after **After CI Checks Pass** is enabled: it builds the selected
commit, runs the migration, starts and health-checks the replacement, and only
then moves traffic to it. GitHub Actions remains the source of the CI result.

## Laravel Cloud

1. Connect the GitHub repository and select `main` for production.
2. Set PHP to 8.4 and Node to 22, then attach managed PostgreSQL.
3. Use the platform's default Laravel build commands, ensuring they install
   Composer dependencies, run `npm ci && npm run build`, and run
   `php artisan optimize` during the build phase.
4. Set the deploy command to `php artisan migrate --force` only. Do not add
   `queue:restart`, `horizon:terminate`, `optimize:clear`, or `storage:link`.
5. Disable **Push to deploy** for production and enable a deploy hook.
6. Save the hook URL in GitHub at **Settings > Secrets and variables > Actions**
   as `LARAVEL_CLOUD_DEPLOY_HOOK`.

After that secret exists, the `Deploy to Laravel Cloud` job triggers the exact
tested `main` commit. Without the secret, the job reports that Cloud deployment
is not configured and exits successfully, which allows Render-only setups.

Laravel Cloud owns the build and release portion of CD. The GitHub job only
authorizes Cloud to deploy after the required CI gate succeeds.

## Required production variables

Generate `APP_KEY` once with `php artisan key:generate --show`; store it in the
platform secret manager and never rotate it as part of a deploy.

| Variable | Production value |
| --- | --- |
| `APP_NAME` | `NexaERP` |
| `APP_ENV` | `production` |
| `APP_KEY` | Persistent secret value |
| `APP_DEBUG` | `false` |
| `APP_URL` | Final HTTPS origin |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `info` |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | Platform-managed PostgreSQL connection string |
| `CACHE_STORE` | `database` initially, or managed Redis/KV later |
| `SESSION_DRIVER` | `database` initially, or managed Redis/KV later |
| `SESSION_SECURE_COOKIE` | `true` |
| `QUEUE_CONNECTION` | `sync` until a worker is provisioned |
| `MAIL_MAILER` | Transactional provider's supported mailer |
| `MAIL_FROM_ADDRESS` | Verified sender address |
| `MAIL_FROM_NAME` | `${APP_NAME}` |

Do not set both `DB_URL` and contradictory individual `DB_HOST`, `DB_DATABASE`,
`DB_USERNAME`, or `DB_PASSWORD` values. Platform-injected resource variables
take precedence over examples intended for local Docker.

## Production checklist

- [ ] `APP_KEY` is secret, stable across releases, and backed up securely.
- [ ] Debugging is disabled and `APP_URL` uses the final HTTPS domain.
- [ ] Secure session cookies and a verified transactional email sender work.
- [ ] PostgreSQL region, backups, retention, connection limits, and restore
      procedure have been reviewed and a restore has been tested.
- [ ] `php artisan migrate --force` runs exactly once before each release.
- [ ] `/up` is the platform health check and returns HTTP 200.
- [ ] `main` requires the **CI passed** branch-protection check.
- [ ] A deliberately failing CI branch cannot trigger a production deployment.
- [ ] A successful merge deploys the same commit SHA shown by GitHub Actions.
- [ ] A failed build, migration, or health check keeps the prior release live.
- [ ] DNS, TLS, error reporting, uptime alerts, log retention, and rollback access
      are configured and owned by a named person.
- [ ] User uploads use object storage; local files are treated as ephemeral.
- [ ] No worker or scheduler is provisioned until queued jobs or schedules exist.
- [ ] Post-deploy smoke tests cover `/up`, registration or login, the dashboard,
      and one inventory or invoice transaction.

When queues are introduced, change `QUEUE_CONNECTION` to the selected durable
backend and add one platform worker running `php artisan queue:work --tries=3
--timeout=90`. When schedules are introduced, enable exactly one platform
scheduler rather than running it in every web replica.

References: [Render deploys](https://render.com/docs/deploys),
[Laravel Cloud deployments](https://cloud.laravel.com/docs/deployments), and
[Laravel Cloud environments](https://cloud.laravel.com/docs/environments).
