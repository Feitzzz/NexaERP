# syntax=docker/dockerfile:1.7

ARG FRANKENPHP_VERSION=1.9
ARG PHP_VERSION=8.4

FROM dunglas/frankenphp:${FRANKENPHP_VERSION}-php${PHP_VERSION}-bookworm AS php-base

RUN install-php-extensions \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip

WORKDIR /app

FROM php-base AS composer-dependencies

COPY --from=composer:2.8 /usr/bin/composer /usr/local/bin/composer
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
RUN composer dump-autoload \
        --no-dev \
        --classmap-authoritative \
        --no-interaction

FROM php-base AS frontend-build

COPY --from=node:22-bookworm-slim /usr/local/ /usr/local/
COPY --from=composer-dependencies /app /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY resources ./resources
COPY vite.config.ts tsconfig.json components.json ./
RUN npm run build

FROM php-base AS test

COPY --from=composer:2.8 /usr/bin/composer /usr/local/bin/composer
COPY . .
RUN touch .env
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
        --prefer-dist \
        --no-interaction \
        --no-progress
COPY --from=frontend-build /app/public/build /app/public/build

FROM php-base AS production

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY docker/php-production.ini "$PHP_INI_DIR/conf.d/zz-production.ini"
COPY docker/Caddyfile /etc/frankenphp/Caddyfile
COPY --from=composer-dependencies --chown=root:root /app /app
COPY --from=frontend-build --chown=root:root /app/public/build /app/public/build

RUN set -eux; \
    rm -rf /app/tests; \
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
