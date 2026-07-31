# syntax=docker/dockerfile:1.7

ARG FRANKENPHP_VERSION=1.9
ARG PHP_VERSION=8.4

FROM dunglas/frankenphp:${FRANKENPHP_VERSION}-php${PHP_VERSION}-bookworm AS base

RUN install-php-extensions \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip

COPY --from=composer:2.8 /usr/bin/composer /usr/local/bin/composer
COPY docker/Caddyfile /etc/frankenphp/Caddyfile

WORKDIR /app

FROM base AS composer_dependencies

COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
        --prefer-dist \
        --no-interaction \
        --no-progress \
        --no-scripts && \
    sha256sum composer.lock | cut -d ' ' -f 1 > vendor/.docker-composer-lock

FROM base AS frontend_dependencies

COPY --from=node:22-bookworm-slim /usr/local/ /usr/local/
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    sha256sum package-lock.json | cut -d ' ' -f 1 > node_modules/.docker-package-lock

FROM base AS development

RUN cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
COPY --from=node:22-bookworm-slim /usr/local/ /usr/local/
COPY --from=composer_dependencies /app/vendor /app/vendor
COPY --from=frontend_dependencies /app/node_modules /app/node_modules
COPY --chmod=755 docker/development-entrypoint.sh /usr/local/bin/development-entrypoint

ENV APP_ENV=local \
    APP_DEBUG=true \
    LOG_CHANNEL=stderr \
    SERVER_NAME=:8080

EXPOSE 8080 5173
ENTRYPOINT ["development-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]

FROM frontend_dependencies AS frontend_build

COPY --from=composer_dependencies /app/vendor /app/vendor
COPY . .
RUN npm run build

FROM base AS production_dependencies

COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --no-progress \
        --optimize-autoloader \
        --no-scripts
COPY . .
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --no-progress \
        --optimize-autoloader && \
    composer dump-autoload \
        --no-dev \
        --classmap-authoritative \
        --no-interaction

FROM base AS production

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY docker/php-production.ini "$PHP_INI_DIR/conf.d/zz-production.ini"
COPY --from=production_dependencies --chown=root:root /app /app
COPY --from=frontend_build --chown=root:root /app/public/build /app/public/build

RUN set -eux; \
    mkdir -p \
        storage/app/private \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
        /config/caddy \
        /data/caddy; \
    ln -sfn /app/storage/app/public /app/public/storage; \
    useradd --system --uid 10001 --home-dir /app --shell /usr/sbin/nologin app; \
    setcap -r /usr/local/bin/frankenphp || true; \
    chown -R app:app storage bootstrap/cache /config/caddy /data/caddy

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    LOG_LEVEL=info \
    SERVER_NAME=:8080 \
    XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data

USER app
EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]
