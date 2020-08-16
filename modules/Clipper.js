// standard modules
const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
// custom modules
const ask = require('./Ask');
const ClipperError = require('./ClipperError');
const Prog = require('./Prog');
const { profile } = require('console');

class Clipper {
  constructor(config) {
    // static configs
    this.config = {
      oauth: {
        ...config.twitchOAuth,
        token: {}
      },
      clips: {
        ...config.clips
      }
    }
    // live data
    this.state = {
      clips: [],
      broadcasterId: '',
      tempDate: '',
      tempFolder: '',
    }
  }

  async setState(newState) {
    if (!(newState instanceof Object)) {
      throw new ClipperError({
        errorType: 'CODE ERROR',
        errorLocation: 'Clipper.setState()',
        message: `newState is of type "${typeof newState}". Type "Object" required.\n\nExiting program to prevent any further errors with state...`,
        exit: true
      })
    }

    this.state = { ...this.state, ...newState };
    return;
  }

  checkDir(dir) {
    return dir.split('')[dir.length - 1] === '/' ? true : false;
  }

  async initialize() {
    console.log('\n-------------------------\n Initializing Clipper...\n-------------------------\n');
    await this.checkOAuthConfig();
    await this.authenticate();
    await this.getBroadcasterIdByBroadcasterName();
    console.log('\n---------------------------\n Initialization completed!\n---------------------------\n');
  }

  async checkOAuthConfig() {
    const { clientId, clientSecret, grantType, scope } = this.config.oauth;
    // console.log('\nChecking config.json...')
    const oauthProgress = new Prog({ message: 'Checking OAuth in config.json' });

    // check if credentials are valid
    const emptyFields = [];

    if (!clientId) emptyFields.push('clientId');
    if (!clientSecret) emptyFields.push('clientSecret');
    if (!grantType) emptyFields.push('grantType');
    if (!scope) emptyFields.push('scope');

    if (emptyFields.length > 0) { 
      oauthProgress.finish(false);
      throw new ClipperError({
        errorType: 'CONFIGURATION ERROR',
        errorLocation: 'AUTHENTICATION',
        message: `Please check config.json. Missing: [${emptyFields.join(', ')}]`,
        exit: true
      });
    } else {
      oauthProgress.finish(true);
      return false;
    }
  }

  async authenticate() {
    const { clientId, clientSecret, grantType, scope } = this.config.oauth;
    const authProgress = new Prog({ message: 'Getting OAuth credentials from Twitch' });
  
    try {
      // try to authenticate with Twitch's API
      const authenticationResponse = await axios({
        method: 'POST',
        url: `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}&scope=${scope}`
      });

      this.config.oauth.token = {...authenticationResponse.data};

      authProgress.finish(true);
    } catch (err) {
      authProgress.finish(false);
      new ClipperError({
        errorType: 'AXIOS ERROR',
        errorLocation: 'AUTHENTICATION',
        message: err,
        exit: true
      });
    }
  }

  async getBroadcasterIdByBroadcasterName() {
    const { oauth, clips } = this.config;

    const broadcasterProgress = new Prog({ message: `Getting broadcaster ID for "${clips.broadcasterName}"` });

    // check if broadcasterName is defined

    if (!clips.broadcasterName) {
      new ClipperError({
        errorType: 'CONFIGURATION ERROR',
        errorLocation: 'RETRIEVE BROADCASTER ID',
        message: 'broadcasterName is not set. Please check config.json.',
        exit: true
      })
    }

    try {
      const broadcasterResponse = await axios({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${oauth.token.access_token}`,
          'Client-Id': oauth.clientId
        },
        url: `https://api.twitch.tv/helix/users?login=${clips.broadcasterName}`
      });
  
      this.setState({ broadcasterId: broadcasterResponse.data.data[0].id });

      broadcasterProgress.finish(true);
    } catch(err) {
      broadcasterProgress.finish(false);
      new ClipperError({
        errorType: 'AXIOS ERROR',
        errorLocation: 'RETRIEVE BROADCASTER ID',
        message: err,
        exit: true
      });
    }
  }

  async getClipsMetadataByBroadcasterId() {
    const { token, clientId } = this.config.oauth;
    const { broadcasterId } = this.state;

    // confirm broadcaster id is set
    if (!broadcasterId) {
      new ClipperError({
        errorType: 'CONFIGURATION ERROR',
        errorLocation: 'getClipsMetadataByBroadcasterId()',
        message: 'broadcasterId is not set. This might be a twitch API issue.',
        exit: true
      });
    }
    
    // get time period
    let timePeriod = parseInt(await ask.q('Specify time period in days (from today): '));
    
    while (isNaN(timePeriod)) {
      console.log('\n  Not a number. Please try again.\n');
      
      timePeriod = parseInt(await ask.q('Specify time period in days (from today): '));
    }
    
    const startedAt = moment().subtract(timePeriod, 'days').toISOString();

    const clipMetaProgress = new Prog({ message: 'Getting clip metadata' });

    try {
      const clipResponse = await axios({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Client-Id': clientId
        },
        url: `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&started_at=${startedAt}&first=100`
      });

      this.setState({ clips: clipResponse.data.data });
      
      clipMetaProgress.finish(true);
      console.log(`Total clips: ${clipResponse.data.data.length}`);
    } catch (err) {
      clipMetaProgress.finish(false);
      new ClipperError({
        errorType: 'AXIOS ERROR',
        errorLocation: 'RETRIEVE CLIP METADATA',
        message: err,
        exit: true
      });
    }
  }

  async writeClipMetadataToFile() {
    // this method was mainly to view JSON during development, but why not leave it in incase anyone wants to use it? :D
    return new Promise((resolve, reject) => {
      const tempFileProgress = new Prog({ message: 'Writing clip metadata to temp file' });

      if (!this.metadataTempLocation) {
        tempFileProgress.finish(false);
        new ClipperError({
          errorType: 'FILE WRITE ERROR',
          errorLocation: 'WRITE METADATA TO FILE',
          message: '[metadataTempLocation] is empty in config.json',
          exit: false
        });

        return;
      }

      try {
        const data = JSON.stringify({ clips: this.clips }, 0, 2);
  
        fs.writeFile(this.metadataTempLocation, data, 'utf8', resolve);

        tempFileProgress.finish(true);
      } catch (err) {
        tempFileProgress.finish(false);
        new ClipperError({
          errorType: 'FILE WRITE ERROR',
          errorLocation: 'WRITE METADATA TO FILE',
          message: err,
          exit: false
        });
      }
    })
  }

  async createClipFolder() {
    const createFolderProgress = new Prog({ message: 'Creating clip folder' }); 

    try {
      const { downloadLocation, broadcasterName } = this.config.clips;
      const adjustedLocation = this.checkDir(downloadLocation) ? `${downloadLocation}`: `${downloadLocation}/`;
      const tempDate = moment().utc().format('MM-DD-YYYY_hhmmss');

      if (!downloadLocation) {
        throw new ClipperError({
          errorType: 'CONFIGURATION ERROR',
          errorLocation: 'createClipFolder()',
          message: '[downloadLocation] is empty in config.json',
          exit: true
        });
      }

      const folderName = `${broadcasterName}_clips_${tempDate}`;
      const fullDir = `${adjustedLocation}${folderName}`;
  
      if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir);
      }
      
      this.setState({ tempDate, tempFolder: fullDir });

      createFolderProgress.finish(true);
    } catch (err) {
      createFolderProgress.finish(false);
      new ClipperError({
        errorType: 'UNKNOWN',
        errorLocation: 'createClipFolder()',
        message: err,
        exit: true
      });
    }
  }
  
  async downloadClip(clipObject, i, length) {
    return new Promise((resolve, reject) => {
      const { tempFolder } = this.state;
      const { broadcasterName } = this.config.clips;

      const downloadProgress = new Prog({ message: `Downloading Clip ${i + 1}/${length}`});

      const writer = fs.createWriteStream(`${tempFolder}/${broadcasterName}_clip-${i + 1}_${clipObject.creator_name}.mp4`);
      const clipURL = `${clipObject.thumbnail_url.split('-preview-480x272.jpg')[0]}.mp4`;
      // axios get request for mp4 url, pipe into writestream
      axios({
        method: 'GET',
        url: clipURL,
        responseType: 'stream',
      }).then((res) => {
        res.data.pipe(writer);

        writer.on('error', (err) => {
          downloadProgress.finish(false);
          reject(new ClipperError({
            errorType: 'FS WRITE ERROR',
            errorLocation: 'downloadClip()',
            message: err,
            exit: false
          }));
        });

        writer.on('close', () => {
          downloadProgress.finish(true);
          resolve(true);
        });
      })
      // return when data feed stops
    })
  }

  async batchDownloadClips(clipArray) {
    const { clips } = this.state;
    
    try {
      console.log('\nDownloading All Clips...\n');

      for (let index = 0; index < clips.length; index++) {
        await this.downloadClip(clips[index], index, clips.length);
      }
    } catch (err) {
      new ClipperError({
        errorType: 'BATCH DOWNLOAD CLIPS',
        errorLocation: 'batchDownloadClips()',
        message: err,
        exit: true
      });
    }
    
    this.setState({
      clips: [],
      tempDate: '',
      tempFolder: '',
    })
  }
}

module.exports = Clipper;