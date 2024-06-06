# Use the specific Node.js runtime as the base image
FROM node:16.16.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json yarn.lock ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080


# Default command to serve the application in development mode
CMD ["npm", "run", "serve"]
