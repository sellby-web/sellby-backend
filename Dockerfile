# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY /prisma ./
# --ignore-scripts defers postinstall so prisma generate doesn't run before the schema is present
RUN npm ci --ignore-scripts
COPY . .
RUN npx prisma generate && npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# --ignore-scripts skips the postinstall prisma generate — the schema isn't present here
# and prisma is a devDependency, so generation would fail anyway; copy the pre-built client from the builder instead
RUN npm ci --only=production --ignore-scripts && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
EXPOSE 3000
CMD ["node", "dist/src/main.js"]