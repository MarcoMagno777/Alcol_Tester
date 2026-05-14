FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install mysqli \
    && a2enmod rewrite headers

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY entrypoint-php.sh /entrypoint-php.sh
RUN chmod +x /entrypoint-php.sh

EXPOSE 80
CMD ["/entrypoint-php.sh"]
