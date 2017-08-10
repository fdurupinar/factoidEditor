Factoid User Guide
=======================================

Factoid allows authors to extract pathway information from their manuscripts. 
The extracted pathways can be edited and saved. 
On the server side, we have an application server that keeps the model, handles
communication across clients, and performs operational transformation.
Model visualization and editing are handled on the client side. The
editor visualizes information about cellular processes and pathways in
SBGN (Systems Biology Graphical Notation) format. It allows for
automatic graph layout, editing and highlighting facilities.

Installation
------------

### Install dependencies on Debian/Ubuntu

Install node.js and mongodb servers first.

Node:

```
curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash - <br />
sudo apt-get install -y nodejs <br />
```

Mongo:
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com/ --recv EA312927 <br />
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list <br />
sudo apt-get update <br />
sudo apt-get install -y mongodb-org <br />
```
If mongo does not work:
```
sudo apt-get install upstart-sysv
```

### Install dependencies on Mac

```
brew install node
brew install tcl-tk
brew install mongodb
brew install nodejs
```

### Clone from github and install node modules
```
https://github.com/fdurupinar/factoidEditor.git
cd factoidEditor
npm install
```

### Install cytoscape extensions
```
cd public
npm install
npm run build-bundle-js
cd ..

```
Running the server
------------------
```
node server
```
or if you made changes to newt or chise (under public/app) run the script: runbundle:

```
./runbundle.sh
  ```

In order to open a client enter `http://localhost:3000` in the address bar of your browser.

Installing via Docker
---------------------
```
docker-compose up
```