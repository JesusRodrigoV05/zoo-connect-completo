FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM node:24-slim AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 4200
CMD ["node", "dist/zoo-connect-web/server/server.mjs"]
