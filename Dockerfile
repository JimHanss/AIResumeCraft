FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
COPY apps/editor/package.json apps/editor/package.json
COPY apps/portfolio/package.json apps/portfolio/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile=false

COPY . .

EXPOSE 3000 5173

CMD ["pnpm", "dev"]
