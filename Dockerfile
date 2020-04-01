FROM node:12.16-slim

WORKDIR /usr/bot

RUN apt-get update

RUN apt-get upgrade -y

RUN apt-get install ffmpeg -y

COPY . .

RUN npm install -g pm2

RUN yarn

CMD ["yarn", "start"]