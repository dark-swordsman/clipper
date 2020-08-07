// standard modules
const fs = require('fs');
const axios = require('axios');
// custom modules
const ClipperError = require('./ClipperError');

class Clipper {
  constructor({twitchOAuth}) {
    this.oauth = {
      ...twitchOAuth,
      token: null
    };
    this.clips = [];
  }

  async initialize() {
    console.log('\n-------------------------');
    console.log(' Initializing Clipper...');
    console.log('-------------------------');
    await this.checkOAuthConfig();
    await this.authenticate();
    console.log('\n-------------------------');
    console.log(' Initializing completed!');
    console.log('-------------------------');
  }

  async checkOAuthConfig() {
    const { clientID, clientSecret, grantType, scope } = this.oauth;
    // console.log('\nChecking config.json...')
    process.stdout.write('\nChecking config.json: ...');
    

    // check if credentials are valid
    const emptyFields = [];
    if (!clientID) emptyFields.push('clientID');
    if (!clientSecret) emptyFields.push('clientSecret');
    if (!grantType) emptyFields.push('grantType');
    if (!scope) emptyFields.push('scope');

    if (emptyFields.length > 0) { 
      throw new ClipperError({
        errorType: 'CONFIGURATION ERROR',
        errorLocation: 'AUTHENTICATION',
        message: `Please check config.json. Missing: [${emptyFields.join(', ')}]`,
        exit: true
      });
    } else {
       // end the line
      return false;
    }
  }

  async authenticate() {
    const { clientID, clientSecret, grantType, scope } = this.oauth;
    console.log('\nGetting OAuth credentials from Twitch...');
  
    try {
      // try to authenticate with Twitch's API
      authenticationResponse = await axios({
        method: 'POST',
        url: `https://id.twitch.tv/oauth2/token
              ?client_id=${clientID}
              &client_secret=${clientSecret}
              &grant_type=${grantType}
              &scope=${scope}`
      });
  
      console.log(authenticationResponse.data);
    } catch (err) {
      new ClipperError({
        errorType: 'AXIOS ERROR',
        errorLocation: 'AUTHENTICATION',
        message: err,
        exit: true
      });
    }
  }

  async retrieveClipMetadata(slug) {
    console.log('Getting clip metadata...\n');
  
    try {
      // TODO: Twitch API for getting clips;
    } catch (err) {
      console.error('\nDOWNLOAD FAILED');
      console.error(err);
    }
  }
  
  async downloadClip() {
  
  }
}

module.exports = Clipper;