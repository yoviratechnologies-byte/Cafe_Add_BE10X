# Multi-stage production container manifest
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy application files
COPY . .

EXPOSE 8080

CMD ["node", "server/server.js"]
