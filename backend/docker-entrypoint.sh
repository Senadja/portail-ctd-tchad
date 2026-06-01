#!/bin/sh

# Extraire l'hôte et le port de DATABASE_URL
# DATABASE_URL="postgresql://ctd_user:ctd_password@db:5432/ctd_db?schema=public"
DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|:.*||' -e 's|/.*||')
DB_PORT=$(echo $DATABASE_URL | sed -e 's|.*:||' -e 's|/.*||')

echo "Attente de la base de données sur $DB_HOST:$DB_PORT..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT"; do
  echo "La base de données n'est pas encore prête... en attente."
  sleep 2
done

echo "Base de données prête !"

echo "Running database setup..."
npx prisma db push

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
npm start
