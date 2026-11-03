# syntax=docker/dockerfile:1
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# The bottom-left corner shows the commit. The image is built on the pull
# request and only retagged on merge, so the commit is a placeholder that
# deploy/entrypoint.sh fills in from WWW_VERSION when the container starts.
ARG BUILD_TIME BUILD_URL
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_BUILD_SHA=__BUILD_SHA__ \
    NEXT_PUBLIC_BUILD_TIME=$BUILD_TIME \
    NEXT_PUBLIC_BUILD_URL=$BUILD_URL
# The home page is prerendered with the member list, so the build reads
# Keycloak. The secrets reach it as mounts; the fetch cache goes in the same
# step, since the registry cache keeps this stage and is public.
RUN --mount=type=secret,id=KEYCLOAK_URL,env=KEYCLOAK_URL \
    --mount=type=secret,id=KEYCLOAK_REALM,env=KEYCLOAK_REALM \
    --mount=type=secret,id=KEYCLOAK_ADMIN_CLIENT_ID,env=KEYCLOAK_ADMIN_CLIENT_ID \
    --mount=type=secret,id=KEYCLOAK_ADMIN_CLIENT_SECRET,env=KEYCLOAK_ADMIN_CLIENT_SECRET \
    bun run build && rm -rf .next/cache

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node deploy/entrypoint.sh /entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["sh", "/entrypoint.sh"]
CMD ["node", "server.js"]
