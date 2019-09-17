// COLOR SCHEME
// https://coolors.co/2f2f2f-e65f5c-73eedc-ffff82-ffffff
let black = "#2F2F2F", red = "#E65F5C", blue = "#73EEDC", yellow = "#FFFF82", white = "#FFFFFF";
let colorPalette = [
    red, blue, yellow
];

// AUDIO INPUTS
let audio, midiInput;
let fft, fftBands, wave;
// TRACKS
let epComp;
let epLines = {};

// DRAWING LAYERS
let layer1, layer2, layer3, layer4, layer5;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB); // Max values: 360, 100, 100, 1
    noStroke();
    angleMode(DEGREES);
    //frameRate(20);

    // Audio input
    audio = new p5.AudioIn();
    audio.start();
    fft = new p5.FFT();
    fft.setInput(audio);
    // FFT
    fftBands = fft.analyze();
    wave = fft.waveform();

    // MIDI input
    midiInput = new MIDIInput();
    // Override onMIDIMessage callback with custom function
    midiInput.onMIDIMessage = onMIDIMessage;

    // Layers
    layer1 = new Layer(layer1Setup, layer1Draw);
    layer2 = new Layer(layer2Setup, layer2Draw);
}

function draw() {
    background(black);
    // Analyze audio
    fftBands = fft.analyze();
    wave = fft.waveform();

    // Draw layers
    layer2.show();
    layer1.show();
}

function onMIDIMessage(data) {
    msg = new MIDI_Message(data.data);
    // console.log(msg);

    if (msg.channel == 0) {
        if (msg.cmd === MIDI_Message.NOTE_ON_CMD) {
            epComp.jump();
            epComp.updateWave(wave);
        }
    }
    else if (msg.channel == 1) {
        if (msg.cmd === MIDI_Message.NOTE_ON_CMD) {
            epLines[msg.note] = new EPLine(msg.note);
        } else if (msg.cmd === MIDI_Message.NOTE_OFF_CMD) {
            delete epLines[msg.note];
        }
    }
}

// LAYER 1
function layer1Setup(canvas) {
    epComp = new EPComp();
}
function layer1Draw(canvas) {
    canvas.clear();
    epComp.fall();
    epComp.draw(canvas);
}

// LAYER 2
function layer2Setup(canvas) {}
function layer2Draw(canvas) {
    canvas.clear();
    for (let note of Object.keys(epLines)) {
        epLines[note].draw(canvas);
    }
}

class EPComp {
    constructor() {
        this.minHeight = height - height / 3;
        this.height = this.minHeight;
        this.thickness = 5;
        this.wave = [];

        // Draw the waveform
        this.draw = function (c) {
            c.push();
            c.stroke(255);
            c.strokeWeight(this.thickness);
            // fill(random(255), 100, 100);
            c.fill(black);

            c.beginShape();
            c.vertex(width / 4, this.minHeight);
            for (var i = 0; i < this.wave.length; i++) {
                var x = width / 4 + i * width / this.wave.length / 2;
                var y = this.height - 100 - this.wave[i] * 100;
                c.vertex(x, y);
            }
            c.vertex(3 * width / 4, this.minHeight);
            c.endShape(CLOSE);
            c.pop();
        };

        // Update the waveform
        this.updateWave = function (newWave) {
            this.wave = newWave;
        }

        // Waveform bounces up and down
        this.jump = function () {
            this.height -= 50;
        };
        this.fall = function () {
            // Height dropping
            this.height += 20; // Falling
            this.height = min(this.height, this.minHeight); // Floor
        };
    }
}

class EPLine {
    constructor(note) {
        this.noteXPositions = {
            46: width / 4 + 0 * width / 12,
            48: width / 4 + 1 * width / 12,
            49: width / 4 + 2 * width / 12,
            51: width / 4 + 3 * width / 12,
            53: width / 4 + 4 * width / 12,
            56: width / 4 + 5 * width / 12,
        };
        this.note = note;
        this.color = random(colorPalette);
        this.thickness = 5;

        this.draw = function (c) {
            let xpos = this.noteXPositions[note];
            if (xpos) {
                c.fill(this.color);
                // noFill();
                c.stroke(255);
                c.strokeWeight(this.thickness);

                c.rect(xpos, height / 3, width / 12, height / 3);
            }
        };
    }
}
