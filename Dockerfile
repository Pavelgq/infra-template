FROM node:16-alpine
WORKDIR /
COPY . .
RUN npm i
RUN npm build
CMD npm start