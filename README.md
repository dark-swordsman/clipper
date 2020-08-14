# clipper

Node.js utility to download all latest twitch clips from a specific broadcaster.

## Prerequisites

- [Node.js v8.17.0](https://nodejs.org/download/release/v8.17.0/) (Any node major version 8 or higher *should* work, it just hasn't been tested).
- A registered applicaiton on [Twitch Developer Console](https://dev.twitch.tv/console).
- Knowledge of how to install/run Node and use npm.

## If you're new

First of all, this is a **Node.js program**. It is **not** a Windows executable. You **can not** simply download it and press "clipper.exe". 

Since most of you viewing this are *probably* on Windows 10, have never heard of "NPM" or "Node", and I don't want github issues of "how do i run this?!", I invite you to read the following guide:

[How to Install Node.js® and NPM on Windows](https://blog.teamtreehouse.com/install-node-js-npm-windows)

## How to use it

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console) and register a new app.
2. Download the zip **or** `git clone` this repo to a location on your computer.
3. Copy `config.example.json` and rename the new copy "`config.json`".
4. Fill in the `config.json` with information from your [app page](https://i.imgur.com/4RTULc1.png) and other info, and make sure to save it:
    - `clientId`
    - `clientSecret`
    - `broadcasterName` (the streamer you want to download clips from)
    - `downloadLocation` (where you want the clips to download)
      - preferably from the root of the drive to **an existing folder**, such as:
        - `C:/Users/Bob/Videos/clipperclips/`
5. Run `npm i` to install required packages.
6. Once it finishes, run `npm start` or `npm run start`.
7. The application will prompt you for the time period (in days from today).
    - For example: `7` days from today would be a week ago.
8. The application will download the clips to a new folder in the specified download directory named `clips_<broadcaster name>_<MM-DD-YYYY_hhmmss>`, and exit automatically.

## Collaboration

I didn't provide a license because I really don't care what you do with this. If you want to steal it, modify it, and use it in your enterprise application, go right ahead. I don't even care if you copy the repo and say you made it. I just use this program for myself.

### Submitting PRs

If you want to make a fork and submit PRs, go right ahead. Just make sure you submit PRs against `develop` and not `master`.