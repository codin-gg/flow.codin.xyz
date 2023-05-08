FROM node:18.16.0-alpine3.15 AS base

FROM base AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN yarn build
RUN yarn export

FROM busybox:1.35 AS runner
RUN adduser -D static
USER static
WORKDIR /home/static
COPY --from=builder /app/out /home/static
EXPOSE 80
CMD ["busybox", "httpd", "-f", "-v", "-p", "80"]