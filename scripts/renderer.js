class Renderer {
  constructor({ scale }) {
    // CHIP-8 has a 64 x 32 display
    this.cols = 64;
    this.rows = 32;

    this.scale = scale;

    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = this.cols * this.scale;
    this.canvas.height = this.rows * this.scale;

    this.display = new Array(this.cols * this.rows);
  }

  setPixel(x, y) {
    // If the x, y values go beyond the screen, wrap them.

    if (x > this.cols) {
      x -= this.cols;
    } else if (x < 0) {
      x += this.cols;
    }

    if (y > this.rows) {
      y -= this.rows;
    } else if (y < 0) {
      y += this.rows;
    }

    // Calculate the pixel location using the formula:
    let pixelLoc = x + y * this.cols;

    // XOR the pixel value
    this.display[pixelLoc] ^= 1;

    // Returns true if a pixel was erased
    return !this.display[pixelLoc];
  }

  clear() {
    this.display = new Array(this.cols * this.rows);
  }

  render() {
    // Clear the display every render cycle
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Every pixel in the display array
    for (let i = 0; i < this.cols * this.rows; i++) {
      let x = (i % this.cols) * this.scale;
      let y = Math.floor(i / this.cols) * this.scale;

      if (this.display[i]) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, this.scale, this.scale);
      }
    }
  }
}

export default Renderer;
