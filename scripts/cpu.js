class CPU {
  constructor(renderer, keyboard, speaker) {
    this.renderer = renderer;
    this.keyboard = keyboard;
    this.speaker = speaker;
    this.speed = 1;

    // 4KB (4096 bytes) of memory
    this.memory = new Uint8Array(4096);

    // 16 8-bit registers
    this.v = new Uint8Array(16);

    // Stores memory addresses. Set this to 0 since we aren't storing anything at initialization.
    this.i = 0;

    // Timers
    this.delayTimer = 0;
    this.soundTimer = 0;

    // Program counter. Stores the currently executing address.
    this.pc = 0x200;

    // Don't initialize this with a size in order to avoid empty results.
    this.stack = new Array();

    // Some instructions require pausing, such as Fx0A.
    this.paused = false;

    // Allow muting the sound.
    this.muted = false;
  }

  loadSpritesIntoMemory() {
    // Array of hex values for each sprite. Each sprite is 5 bytes.
    // The technical reference provides us with each one of these values.
    const sprites = [
      0xf0,
      0x90,
      0x90,
      0x90,
      0xf0, // 0
      0x20,
      0x60,
      0x20,
      0x20,
      0x70, // 1
      0xf0,
      0x10,
      0xf0,
      0x80,
      0xf0, // 2
      0xf0,
      0x10,
      0xf0,
      0x10,
      0xf0, // 3
      0x90,
      0x90,
      0xf0,
      0x10,
      0x10, // 4
      0xf0,
      0x80,
      0xf0,
      0x10,
      0xf0, // 5
      0xf0,
      0x80,
      0xf0,
      0x90,
      0xf0, // 6
      0xf0,
      0x10,
      0x20,
      0x40,
      0x40, // 7
      0xf0,
      0x90,
      0xf0,
      0x90,
      0xf0, // 8
      0xf0,
      0x90,
      0xf0,
      0x10,
      0xf0, // 9
      0xf0,
      0x90,
      0xf0,
      0x90,
      0x90, // A
      0xe0,
      0x90,
      0xe0,
      0x90,
      0xe0, // B
      0xf0,
      0x80,
      0x80,
      0x80,
      0xf0, // C
      0xe0,
      0x90,
      0x90,
      0x90,
      0xe0, // D
      0xf0,
      0x80,
      0xf0,
      0x80,
      0xf0, // E
      0xf0,
      0x80,
      0xf0,
      0x80,
      0x80, // F
    ];

    // According to the technical reference, sprites are stored in the interpreter section of memory starting at hex 0x000
    for (let i = 0; i < sprites.length; i++) {
      this.memory[i] = sprites[i];
    }
  }

  loadProgramIntoMemory(program) {
    for (let loc = 0; loc < program.length; loc++) {
      this.memory[0x200 + loc] = program[loc];
    }
  }

  loadRom(romName) {
    var request = new XMLHttpRequest();
    var self = this;

    // Handles the response received from sending (request.send()) our request
    request.onload = function () {
      // If the request response has content
      if (request.response) {
        // Store the contents of the response in an 8-bit array
        let program = new Uint8Array(request.response);

        // Load the ROM/program into memory
        self.loadProgramIntoMemory(program);
      }
    };

    // Initialize a GET request to retrieve the ROM from our roms folder
    request.open("GET", "roms/" + romName);
    request.responseType = "arraybuffer";

    // Send the GET request
    request.send();
  }

  cycle() {
    for (let i = 0; i < this.speed * 10; i++) {
      if (!this.paused) {
        // Each instruction is 16 bits, so we need to shift the first byte 8 bits to the left and then add the second byte.
        let opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        this.executeInstruction(opcode);
      }
    }

    if (!this.paused) {
      this.updateTimers();
    }

    this.playSound();
    this.renderer.render();
  }

  updateTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }

    if (this.soundTimer > 0) {
      this.soundTimer -= 1;
    }
  }

  playSound() {
    if (this.soundTimer > 0) {
      this.speaker.play(440);
    } else {
      this.speaker.stop();
    }
  }

  toggleMute() {
    if (this.muted) {
      this.speaker.unmute();
    } else {
      this.speaker.mute();
    }

    this.muted = !this.muted;
  }

  changeSpeed() {
    if (this.speed === 1) {
      this.speed = 2;
    } else if (this.speed === 2) {
      this.speed = 0.5;
    } else if (this.speed === 0.5) {
      this.speed = 1;
    }
  }

  pauseCPU() {
    this.paused = !this.paused;
  }

  executeInstruction(opcode) {
    this.pc += 2;

    // We only need the 2nd nibble, so grab the value of the 2nd nibble
    // and shift it right 8 bits to get rid of everything but that 2nd nibble.
    let x = (opcode & 0x0f00) >> 8;

    // We only need the 3rd nibble, so grab the value of the 3rd nibble
    // and shift it right 4 bits to get rid of everything but that 3rd nibble.
    let y = (opcode & 0x00f0) >> 4;

    switch (opcode & 0xf000) {
      case 0x0000:
        switch (opcode) {
          case 0x00e0:
            this.renderer.clear();
            break;
          case 0x00ee:
            this.pc = this.stack.pop();
            break;
        }

        break;
      case 0x1000:
        this.pc = opcode & 0xfff;
        break;
      case 0x2000:
        this.stack.push(this.pc);
        this.pc = opcode & 0xfff;
        break;
      case 0x3000:
        if (this.v[x] === (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x4000:
        if (this.v[x] !== (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x5000:
        if (this.v[x] === this.v[y]) {
          this.pc += 2;
        }
        break;
      case 0x6000:
        this.v[x] = opcode & 0xff;
        break;
      case 0x7000:
        this.v[x] += opcode & 0xff;
        break;
      case 0x8000:
        switch (opcode & 0xf) {
          case 0x0:
            this.v[x] = this.v[y];
            break;
          case 0x1:
            this.v[x] |= this.v[y];
            break;
          case 0x2:
            this.v[x] &= this.v[y];
            break;
          case 0x3:
            this.v[x] ^= this.v[y];
            break;
          case 0x4:
            let sum = this.v[x] + this.v[y];
            this.v[0xf] = sum > 0xff ? 1 : 0;
            this.v[x] = sum;
            break;
          case 0x5:
            this.v[0xf] = this.v[x] > this.v[y] ? 1 : 0;
            this.v[x] -= this.v[y];
            break;
          case 0x6:
            this.v[0xf] = this.v[x] & 0x1;
            this.v[x] >>= 1;
            break;
          case 0x7:
            this.v[0xf] = this.v[y] > this.v[x] ? 1 : 0;
            this.v[x] = this.v[y] - this.v[x];
            break;
          case 0xe:
            this.v[0xf] = this.v[x] >> 7;
            this.v[x] <<= 1;
            break;
        }

        break;
      case 0x9000:
        if (this.v[x] !== this.v[y]) {
          this.pc += 2;
        }
        break;
      case 0xa000:
        this.i = opcode & 0xfff;
        break;
      case 0xb000:
        this.pc = (opcode & 0xfff) + this.v[0];
        break;
      case 0xc000:
        this.v[x] = Math.floor(Math.random() * 0xff) & (opcode & 0xff);
        break;
      case 0xd000:
        let width = 8;
        let height = opcode & 0xf;

        this.v[0xf] = 0;

        for (let row = 0; row < height; row++) {
          let sprite = this.memory[this.i + row];

          for (let col = 0; col < width; col++) {
            if ((sprite & 0x80) > 0) {
              if (this.renderer.setPixel(this.v[x] + col, this.v[y] + row)) {
                this.v[0xf] = 1;
              }
            }

            sprite <<= 1;
          }
        }
        break;
      case 0xe000:
        switch (opcode & 0xff) {
          case 0x9e:
            if (this.keyboard.isKeyPressed(this.v[x])) {
              this.pc += 2;
            }
            break;
          case 0xa1:
            if (!this.keyboard.isKeyPressed(this.v[x])) {
              this.pc += 2;
            }
            break;
        }

        break;
      case 0xf000:
        switch (opcode & 0xff) {
          case 0x07:
            this.v[x] = this.delayTimer;
            break;
          case 0x0a:
            this.paused = true;

            this.keyboard.onNextKeyPress = function (key) {
              this.v[x] = key;
              this.paused = false;
            }.bind(this);
            break;
          case 0x15:
            this.delayTimer = this.v[x];
            break;
          case 0x18:
            this.soundTimer = this.v[x];
            break;
          case 0x1e:
            this.i += this.v[x];
            break;
          case 0x29:
            this.i = this.v[x] * 5;
            break;
          case 0x33:
            this.memory[this.i] = parseInt(this.v[x] / 100);
            this.memory[this.i + 1] = parseInt((this.v[x] % 100) / 10);
            this.memory[this.i + 2] = parseInt(this.v[x] % 10);
            break;
          case 0x55:
            for (let reg = 0; reg <= x; reg++) {
              this.memory[this.i + reg] = this.v[reg];
            }
            break;
          case 0x65:
            for (let reg = 0; reg <= x; reg++) {
              this.v[reg] = this.memory[this.i + reg];
            }
            break;
        }

        break;

      default:
        throw new Error("Unknown opcode " + opcode);
    }
  }
}

export default CPU;
