# Production image for Coolify. Runtime secrets come from the platform, never from build args.
FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN npm install -g pnpm@12.8.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
RUN pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
# Coolify's healthcheck runs curl or wget inside the container.
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Uploaded photos live here; mount a persistent volume at this path.
RUN mkdir -p /app/.local/uploads && chown -R node:node /app/.local
USER node
EXPOSE 3000
CMD ["node", "server.js"]
