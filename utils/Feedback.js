class Feedback {
  constructor(question, date, options) {
    this.question = question;
    this.date = date;
    this.anger = options.anger;
    this.fear = options.fear;
    this.joy = options.joy;
    this.sadness = options.sadness;
    this.analytical = options.analytical;
    this.confident = options.confident;
    this.tentative = options.tentative;
  }

  getInfo() {
    return {
      question: this.question,
      date: this.date,
      anger: this.anger,
      fear: this.fear,
      joy: this.joy,
      sadness: this.sadness,
      analytical: this.analytical,
      confident: this.confident,
      tentative: this.tentative
    };
  }
}

modules.export = Feedback;
