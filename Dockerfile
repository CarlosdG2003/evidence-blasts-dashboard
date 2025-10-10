FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    bash \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run sources

EXPOSE 3000

CMD ["sh", "-c", "node scripts/watcher.js & npm run dev -- --host 0.0.0.0"]