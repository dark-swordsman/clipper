class Progress {
  constructor(message) {
    this.state = {
      step: 0,
      complete: false,
      stepValues: ['/', '-', '\\', '|'],
      completeValues: ['SUCCESSFUL', 'FAILURE'],
    },
    this.loop = null;
    this.message = message;
  }

  setState(newState) {
    this.state = {...this.state, ...newState};
  }

  async startAutomatic() {
    await this.printInital();
    this.loop = setTimeout(() => this.automatic(), 200);
  }

  automatic() {

  }

  async bumpProgressIndicator() {
    const { step, values } = this.state;
    
    if (step === values.length - 1) {
      this.setState('step', 0);
    } else {
      this.setProgressIndicator('step', state + 1)
    }

    return;
  }

  async printInital() {
    const { step, values } = this.state;
    process.stdout.write(`\n${this.message}: ${values[step]}`);

    return;
  }

  async printNext() {
    const { step, values, complete, completeValues } = this.state;

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${this.message}: ${complete ? completeValues[step] : values[step]}`);

    return;
  }

  async nextStep() {
    await this.bumpProgressIndicator();
    await this.printNext();
  }

  async endProgress(success) {
    if (success) {

    }
  }
}