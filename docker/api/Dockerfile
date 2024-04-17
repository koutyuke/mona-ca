ARG BUN_VERSION=1.1.3
ARG PORT=3001

# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags

FROM oven/bun:${BUN_VERSION}-slim AS builder

WORKDIR /mona-ca

COPY . .

RUN bun api install --frozen-lockfile --production

FROM oven/bun:${BUN_VERSION}-distroless

WORKDIR /mona-ca 

COPY --chown=nonroot:nonroot --from=builder /mona-ca/node_modules node_modules
COPY --chown=nonroot:nonroot /apps/api/src ./apps/api/src

WORKDIR /mona-ca/apps/api/

ENV NODE_ENV=production
ENV PORT=${PORT}
CMD [ "./src/index.ts" ]