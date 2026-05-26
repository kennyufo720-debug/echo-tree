# ╔══════════════════════════════════════════════════════════════╗
# ║  Dockerfile — Echo Tree  (Next.js 16, standalone output)     ║
# ║  Three-stage build: deps → builder → runner                  ║
# ║  Final image: ~150 MB  (vs ~1 GB without standalone)         ║
# ╚══════════════════════════════════════════════════════════════╝

# ── Stage 1: install ALL node_modules (build needs devDeps) ─────
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat: required by some native addons on musl-based Alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts


# ── Stage 2: build the Next.js app ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are embedded into the JS bundle at build time.
# Pass them as build-args: docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=...
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ── Stage 3: minimal runtime image ──────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Non-root user — principle of least privilege
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output is self-contained:
#   .next/standalone/  → server.js + only the node_modules it needs
#   .next/static/      → hashed client assets (served by server.js)
#   public/            → static files (fonts, icons, images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3000

# Health check — used by Docker and docker-compose depends_on
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
