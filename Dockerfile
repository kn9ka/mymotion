FROM node:24-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

FROM base AS prod-deps

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

FROM deps AS build

COPY . .

RUN npm run build

FROM base AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["node", "-e", "const port = process.env.PORT || 3000; const url = `http://127.0.0.1:${port}/health`; fetch(url, { cache: 'no-store' }).then((res) => { if (!res.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["./node_modules/.bin/react-router-serve", "build/server/index.js"]
