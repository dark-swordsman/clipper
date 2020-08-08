// standard modules
const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
// custom modules
const ask = require('./Ask');
const ClipperError = require('./ClipperError');
const Prog = require('./Prog');

class Clipper {
  constructor({ twitchOAuth, broadcasterName }) {
    this.oauth = {
      ...twitchOAuth,
      token: {}
    };
    this.clips = [];
    this.broadcasterName = broadcasterName;
    this.broadcasterId = '';
  }

  async initialize() {
    console.log('\n-------------------------\n Initializing Clipper...\n-------------------------\n');
    await this.checkOAuthConfig();
    await this.authenticate();
    await this.getBroadcasterIdByBroadcasterName();
    console.log('\n---------------------------\n Initialization completed!\n---------------------------');
  }

  async checkOAuthConfig() {
    const { clientId, clientSecret, grantType, scope } = this.oauth;
    // console.log('\nChecking config.json...')
    const oauthProgress = new Prog('Checking OAuth in config.json');

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
    const { clientId, clientSecret, grantType, scope } = this.oauth;
    const authProgress = new Prog('Getting OAuth credentials from Twitch');
  
    try {
      // try to authenticate with Twitch's API
      const authenticationResponse = await axios({
        method: 'POST',
        url: `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}&scope=${scope}`
      });

      this.oauth.token = {...authenticationResponse.data};

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
    const broadcasterProgress = new Prog('Getting broadcaster ID');

    try {
      const broadcasterResponse = await axios({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.oauth.token.access_token}`,
          'Client-Id': this.oauth.clientId
        },
        url: `https://api.twitch.tv/helix/users?login=${this.broadcasterName}`
      });
  
      this.broadcasterId = broadcasterResponse.data;

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
    const clipMetaProgress = new Prog('Getting clip metadata');

    // confirm broadcaster id is set
    if (!this.broadcasterId) {
      new ClipperError({
        errorType: 'CONFIGURATION ERROR',
        errorLocation: 'RETRIEVE CLIP METADATA',
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

    try {
      const clipResponse = await axios({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.oauth.token.access_token}`,
          'Client-Id': this.oauth.clientId
        },
        url: `https://api.twitch.tv/helix/clips?broadcaster_id=${this.broadcasterId}&started_at=${startedAt}`
      });

      console.log(clipResponse.data);

      clipMetaProgress.finish(true);
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
  
  async downloadClip() {
  
  }
}

module.exports = Clipper;