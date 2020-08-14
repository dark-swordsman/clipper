class Prog {
  constructor({ message, customSteps, customTime }) {
    this.step = 0;
    this.steps = customSteps ? customSteps : ['\\ ','| ','/ ','- '];
    this.time = customTime ? () => customTime instanceof Function ? customTime() : customTime : () => 100;
    this.message = message;
    this.loop = null;

    this.init();
  }

  replace(message) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(message);
  }

  init() {
    process.stdout.write(`${this.message}: ${this.steps[this.step]}`);
    this.loop = setTimeout(this.next.bind(this), this.time());
  }

  next() {
    this.step = this.step === this.steps.length - 1 ? 0 : this.step + 1;
    this.replace(`${this.message}: ${this.steps[this.step]}`);
    clearTimeout(this.loop);
    this.loop = setTimeout(this.next.bind(this), this.time());
  }

  finish(success) {
    clearTimeout(this.loop);
    if (success) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${this.message}: SUCCESSFUL\n`);
    } else {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${this.message}: FAILED\n`);
    }
  }
}

module.exports = Prog;