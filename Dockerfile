FROM node:22-alpine
WORKDIR /app

# Install serve for frontend
RUN npm install -g serve

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Setup backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend/

# Copy built frontend into backend public folder
RUN cp -r /app/frontend/dist /app/backend/public

EXPOSE 3001
ENV PORT=3001

WORKDIR /app/backend
CMD ["node", "src/index.js"]
