FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --legacy-peer-deps
COPY . .
ARG PORT
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["node", "src/server/index.js"]
