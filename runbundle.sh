cd public
npm run build-bundle-js
cd ..
node --max_old_space_size=4096 server.js

