FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY .env .env
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
