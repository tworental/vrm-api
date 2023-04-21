FROM node:16-alpine

# Read docker arguments
ARG NODE_ENV=production
ARG RELEASE_ID=

# Set up ENV variables
ENV NODE_ENV $NODE_ENV
ENV RELEASE_ID $RELEASE_ID

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Upgrade npm to the latest version
RUN npm install -g npm

# Install dependencies
RUN [[ "$NODE_ENV" == "test" || "$NODE_ENV" == "development" ]] && npm install || npm ci --only production

# Bundle app source
COPY knexfile.js ./
COPY ./bin ./bin
COPY ./config ./config
COPY ./database ./database
COPY ./src ./src

# Configure custom entrypoint to run migrations
ENTRYPOINT ["/bin/sh", "./bin/entrypoint"]

EXPOSE 3000

CMD [ "npm", "start" ]
