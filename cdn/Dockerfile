FROM node:14-alpine as base

FROM base as deps

RUN mkdir /app/

WORKDIR /app/

ADD package.json package-lock.json ./

RUN npm install

FROM base as app

RUN mkdir /app/

WORKDIR /app/

ADD package.json package-lock.json ./

COPY --from=deps /app/node_modules /app/node_modules

CMD ["npm", "run", "start"]
