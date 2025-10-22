#!/bin/bash
set -e

cd /var/www

echo "Waiting for MySQL..."
while ! mysql -h"mysql" -u"${DB_USERNAME:-laravel_user}" -p"${DB_PASSWORD:-laravel_password}" -e "SELECT 1;" > /dev/null 2>&1; do
    echo "MySQL is not ready - sleeping"
    sleep 2
done

echo "MySQL is ready!"

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    php artisan key:generate
fi

echo "Running migrations..."
php artisan migrate --force

echo "Running seeds..."
php artisan db:seed

echo "Clearing cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
