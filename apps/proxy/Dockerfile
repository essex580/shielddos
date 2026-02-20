FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/proxy/package*.json ./apps/proxy/

RUN npm install

COPY . .

WORKDIR /app/apps/proxy
RUN npm run build

CMD ["npm", "start"]
