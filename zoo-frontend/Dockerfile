FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node --max-old-space-size=4096 ./node_modules/@angular/cli/bin/ng build --configuration production
FROM node:22-slim AS runtime
EXPOSE 4200
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
CMD ["node", "dist/zoo-connect-web/server/server.mjs"]