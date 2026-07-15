# STAGE 1: Builder — installs deps & generates Prisma client
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY src ./src
COPY seed*.js ./

# STAGE 2: Runtime — minimal final image
FROM node:24-alpine

WORKDIR /app

# Copy only what's needed to run the app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/seed*.js ./
COPY package*.json ./

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Run as non-root for security
RUN chown -R node:node /app
USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]