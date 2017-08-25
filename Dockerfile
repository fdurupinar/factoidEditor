FROM node:boron

#Create app directory
RUN mkdir -p /usr/src/factoid
WORKDIR /usr/src/factoid

#install dependencies
COPY package.json /usr/src/factoid
RUN npm install


#BUNDLE app source
COPY . /usr/src/factoid

EXPOSE 3000

#CMD [ "MONGO_HOST=mongo ", "npm", "start"]
CMD [  "npm", "start"]
