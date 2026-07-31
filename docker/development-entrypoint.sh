#!/bin/sh
set -eu

wait_for_lock() {
    lock_dir="$1"
    while ! mkdir "$lock_dir" 2>/dev/null; do
        if [ -f "$lock_dir/started-at" ] && \
            [ "$(($(date +%s) - $(cat "$lock_dir/started-at")))" -gt 600 ]; then
            rm -f "$lock_dir/started-at"
            rmdir "$lock_dir" 2>/dev/null || true
            continue
        fi
        sleep 1
    done
    date +%s > "$lock_dir/started-at"
}

release_lock() {
    rm -f "$1/started-at"
    rmdir "$1"
}

sync_composer_dependencies() {
    [ -f composer.lock ] || return 0
    expected="$(sha256sum composer.lock | cut -d ' ' -f 1)"
    current="$(cat vendor/.docker-composer-lock 2>/dev/null || true)"
    [ -f vendor/autoload.php ] && [ "$expected" = "$current" ] && return 0

    wait_for_lock /var/lock/nexaerp/composer.lock
    current="$(cat vendor/.docker-composer-lock 2>/dev/null || true)"
    if [ ! -f vendor/autoload.php ] || [ "$expected" != "$current" ]; then
        composer install --prefer-dist --no-interaction --no-progress
        printf '%s\n' "$expected" > vendor/.docker-composer-lock
    fi
    release_lock /var/lock/nexaerp/composer.lock
}

sync_frontend_dependencies() {
    [ -f package-lock.json ] || return 0
    expected="$(sha256sum package-lock.json | cut -d ' ' -f 1)"
    current="$(cat node_modules/.docker-package-lock 2>/dev/null || true)"
    [ -x node_modules/.bin/vite ] && [ "$expected" = "$current" ] && return 0

    wait_for_lock /var/lock/nexaerp/npm.lock
    current="$(cat node_modules/.docker-package-lock 2>/dev/null || true)"
    if [ ! -x node_modules/.bin/vite ] || [ "$expected" != "$current" ]; then
        npm ci
        printf '%s\n' "$expected" > node_modules/.docker-package-lock
    fi
    release_lock /var/lock/nexaerp/npm.lock
}

sync_composer_dependencies
sync_frontend_dependencies

exec "$@"
