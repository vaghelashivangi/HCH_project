# Use an official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project files into the container
COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Start the Vite development server with --host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
