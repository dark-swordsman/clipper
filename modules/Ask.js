class Ask {
  q(question) {
    return new Promise((resolve, reject) => {
      try {
        const rl = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });

        rl.question(`[QUESTION]: ${question}`, (input) => {
          rl.close();
          resolve(input);
        });
      } catch(err) {
        reject(err);
      }
    })
  }
}

module.exports = new Ask();