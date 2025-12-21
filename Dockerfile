# Use the official Node.js image as the base image
FROM node:20-alpine

RUN apk add --no-cache bash

RUN addgroup app && adduser -S -G app app

USER app
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

COPY --chown=app:node package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build

COPY --chown=app:node . .