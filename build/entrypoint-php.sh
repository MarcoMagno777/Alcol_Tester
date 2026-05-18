#!/bin/bash
set -e

cd /var/www/html

if [ ! -f vendor/autoload.php ]; then
  composer install
fi

php ensure_schema.php

exec apache2-foreground
