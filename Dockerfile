FROM mhart/alpine-node:14

WORKDIR /app
COPY . .

RUN npm ci --prod

USER node

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]
