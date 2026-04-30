#!/bin/sh
set -eu

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${DJANGO_AUTO_SEED_DEMO_DATA:-false}" = "true" ]; then
  python manage.py seed_demo_data
fi
