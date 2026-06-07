<<<<<<< HEAD
FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN npm run build
FROM oven/bun:1.2-slim AS runtime
EXPOSE 4200
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
USER bun
=======
FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
FROM oven/bun:1.2-slim AS runtime
EXPOSE 4200
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
USER bun
>>>>>>> 8585d29f67065f84845a9a98969c45d34d0ed0be
CMD ["bun", "dist/zoo-connect-web/server/server.mjs"]