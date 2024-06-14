FROM node:18-alpine as build

WORKDIR /app

COPY package*.json .

RUN npm install

FROM node:18-apine as deploy

COPY --from=build /app/node_modules ./node_modules

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start"]