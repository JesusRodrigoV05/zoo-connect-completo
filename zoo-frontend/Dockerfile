FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g bun
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build --configuration production

FROM oven/bun:alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 4200
CMD ["bun", "dist/zoo-connect-web/server/server.mjs"]
