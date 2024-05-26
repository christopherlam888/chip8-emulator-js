class Speaker {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    this.audioCtx = new AudioContext();

    // Create a gain, which will allow us to control the volume
    this.gain = this.audioCtx.createGain();
    this.finish = this.audioCtx.destination;

    // Connect the gain to the audio context
    this.gain.connect(this.finish);
  }

  mute() {
    this.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
  }

  unmute() {
    this.gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
  }

  play(frequency) {
    if (this.audioCtx && !this.oscillator) {
      this.oscillator = this.audioCtx.createOscillator();

      // Set the frequency
      this.oscillator.frequency.setValueAtTime(
        frequency || 440,
        this.audioCtx.currentTime,
      );

      this.oscillator.type = "square";

      this.oscillator.connect(this.gain);
      this.oscillator.start();
    }
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
  }
}

export default Speaker;
