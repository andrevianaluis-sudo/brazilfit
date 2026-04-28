FROM node:22-alpine
WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Copy pre-built frontend dist
COPY frontend/dist ./frontend-dist

ENV PORT=3001
EXPOSE 3001

CMD ["node", "src/index.js"]
