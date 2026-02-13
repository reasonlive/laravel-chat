FROM ubuntu:22.04

ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

RUN LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php -y

RUN apt-get update && apt-get install -y \
    php8.3 \
    php8.3-cli \
    php8.3-fpm \
    php8.3-mysql \
    php8.3-bcmath \
    php8.3-curl \
    php8.3-mbstring \
    php8.3-xml \
    php8.3-zip \
    php8.3-redis \
    php8.3-swoole \
    mariadb-client \
    supervisor \
    cron \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY . .

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

RUN composer install --no-dev --optimize-autoloader

# Копируем из корневой папки проектаnpm
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/start-container.sh /usr/local/bin/start-container

RUN echo "* * * * * cd /var/www && php artisan schedule:run >> /dev/null 2>&1" | crontab -

EXPOSE 8000 8080

RUN chmod +x /usr/local/bin/start-container

CMD ["start-container"]
