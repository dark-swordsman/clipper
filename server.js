const { Clipper } = require('./modules');
const config = require('./config.json');

console.log('\nWelcome to Clipper!');

const clipper = new Clipper(config);

(async () => {
  await clipper.initialize();
  await clipper.getClipsMetadataByBroadcasterId();
  await clipper.createClipFolder();
  await clipper.batchDownloadClips();
})()