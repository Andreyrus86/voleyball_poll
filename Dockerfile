FROM node:19

WORKDIR /app
COPY . .

RUN npm install -g @nestjs/cli
RUN npm install
RUN nest build

EXPOSE 8080

CMD ["/bin/bash", "-c", "node ./migrations/migrate.js migrate; node ./dist/main.js"]