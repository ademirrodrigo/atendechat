FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY .env.example ./.env
EXPOSE 3333
CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
