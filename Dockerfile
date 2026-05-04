FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./

EXPOSE 3000

# With compose bind-mount ./tmp/api_node_modules -> /app/node_modules, host `npm i` in the
# repo root does not populate that path. Always `npm ci` so the mounted volume matches the lockfile.
CMD ["sh", "-c", "npm ci && exec npm run start:dev"]
