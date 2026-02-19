FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies (basic approach, can be optimized for monorepo)
RUN npm install

COPY . .

WORKDIR /app/apps/api
RUN npm run build

CMD ["npm", "run", "start:prod"]
