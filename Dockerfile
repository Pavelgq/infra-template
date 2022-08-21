FROM node:16.3.0-alpine AS build
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.19-alpine
COPY --from=build /app/build /opt/site
COPY nginx.conf /etc/nginx/nginx.conf