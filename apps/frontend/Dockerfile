FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm install

COPY . .

WORKDIR /app/apps/frontend

CMD ["npm", "run", "dev", "--", "--host"]
