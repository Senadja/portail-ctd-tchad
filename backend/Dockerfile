# Étape de construction
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Générer le client Prisma et compiler le TypeScript
RUN npm run build

# Étape de production
FROM node:20-alpine

WORKDIR /app

# Installer postgresql-client pour pg_isready
RUN apk add --no-cache postgresql-client

# Copier les fichiers nécessaires de l'étape de construction
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./

# Créer le répertoire pour les uploads
RUN mkdir -p uploads

# Rendre le script d'entrée exécutable
RUN chmod +x docker-entrypoint.sh

# Exposer le port (doit correspondre à PORT dans .env ou par défaut)
EXPOSE 5015

# Utiliser le script d'entrée pour les migrations et le démarrage
ENTRYPOINT ["./docker-entrypoint.sh"]
