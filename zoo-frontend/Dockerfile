FROM oven/bun:1.2-slim AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1.2-slim AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 4200
USER bun
CMD ["bun", "dist/zoo-connect-web/server/server.mjs"]
