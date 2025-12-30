# Use Node 20 runtime
FROM node:20-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy project source
COPY . .

# Default PORT - Railway will inject correct env PORT
ENV PORT=8080
EXPOSE 8080

# Healthcheck – prevent 502 gateway timeout issues
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

CMD ["npm", "start"]
