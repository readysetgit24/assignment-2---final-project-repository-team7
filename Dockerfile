FROM node:14.17.4

LABEL version="1.0"

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

CMD [ "node", "server/server.js" ]