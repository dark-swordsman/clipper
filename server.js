const { Clipper } = require('./modules');
const config = require('./config.json');

console.log('\nWelcome to Clipper!');

const clipper = new Clipper({
  twitchOAuth: config.twitchOAuth,
  broadcasterID: config.clips.broadcasterID
});

(async () => {
  await clipper.initialize();
  await clipper.getClipsMetadataByBroadcasterId();
})()