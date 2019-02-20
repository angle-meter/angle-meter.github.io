/*
Install node express http server using commands:
  npm -g install express
  npm link express

Start it using command:
  start node server.js && start http://localhost/
*/

const express = require('express');
const app = express();
app.use(express.static('.'));

app.listen(80, () => console.log('Server started'));