# Use the official Node.js image as the base image
FROM node:22-alpine

RUN apk add --no-cache bash

RUN addgroup app && adduser -S -G app app

USER app
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY --chown=app:app package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY --chown=app:app . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build