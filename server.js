const { Clipper } = require('./modules');
const config = require('./config.json');

console.log('\nWelcome to Clipper!');

const clipper = new Clipper({
  twitchOAuth: config.twitchOAuth
});

clipper.initialize();