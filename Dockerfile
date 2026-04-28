FROM node:22-alpine
WORKDIR /app

# Copy and build frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Copy and setup backend
COPY backend/ ./backend/
RUN cd backend && npm install

# Set port
ENV PORT=3001
EXPOSE 3001

# Start backend server
WORKDIR /app/backend
CMD ["node", "src/index.js"]
