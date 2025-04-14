FROM cgr.dev/chainguard/node:latest
ENV NODE_ENV=production

WORKDIR /app

# Copy package files to install dependencies
COPY --chown=node:node package.json package-lock.json ./

RUN npm install --production

# Copy the remaining app files
COPY --chown=node:node . .

# Expose the port your app runs on (optional, depending on the app)
EXPOSE 3000

ENTRYPOINT ["node", "src/index.js"]

