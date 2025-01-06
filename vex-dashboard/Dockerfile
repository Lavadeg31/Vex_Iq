FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Install all dependencies, including devDependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Install ESLint and type definitions first, then build
RUN npm install --save-dev eslint @typescript-eslint/eslint-plugin@^5.62.0 @typescript-eslint/parser@^5.62.0 eslint-config-next@14.2.16 @types/bcryptjs && \
    npm run lint && \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"] 
