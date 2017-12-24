FROM node:9-alpine

WORKDIR /usr/src/app

COPY . .
RUN npm install
CMD ["npm", "start"]
