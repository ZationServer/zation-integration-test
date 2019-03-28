FROM node:8.9

LABEL appName="zation-integration-test"
LABEL version="1.0.0"
LABEL description="Zation application server"

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

RUN npm install

RUN npm install pm2 -g

RUN npm run build

RUN rm -rf /usr/src/src

EXPOSE 3000

CMD ["npm", "run", "start:docker"]