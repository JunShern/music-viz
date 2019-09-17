let colorPalette = [
    "#010059",
    "#52437b",
    "#ff7a8a",
    "#fcf594"
]; // https://colorhunt.co/palette/150928

let fft;
let fftBands;
let audio;

let epComp;
let epLines = {};

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

    epComp = new EPComp();

    // Drawing layers
    
    layer1 = new Layer();
    layer1.draw = function () {
        me = this.canvas;
        me.clear();

        me.noStroke();
        
        me.fill(255, 0, 0);
        me.ellipse(mouseX, mouseY, 200, 200);
    }

    layer2 = new Layer();
    layer2.canvas.strokeWeight(3);
    layer2.draw = function () {
        me = this.canvas;

        if (frameCount % 100 == 0) {
            me.clear();
        }

        me.ellipse(random(width), random(height), 30, 30);
    }

    layer3 = new Layer();
    layer3.draw = function () {
        me = this.canvas;
        me.clear();

        me.noStroke();
        
        me.fill(255, 255, 0);
        me.ellipse(mouseX, mouseY, 150, 150);
    }
}

function draw() {
    background(0, 90);

    // FFT
    fftBands = fft.analyze();
    wave = fft.waveform();

    // // console.log(wave);
    // var levelLeft = audio.amplitude.getLevel(0);
    // var sizeLeft = map(levelLeft, 0, 1, 0, height);
    // ellipse(width/4, height/2, sizeLeft, sizeLeft);

    for (let note of Object.keys(epLines)) {
        epLines[note].draw();
    }

    epComp.fall();
    epComp.draw();

    // electricPianoNotes.forEach(note => {
    //   note.draw();
    // });
}

let firstNote = 0;
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

class EPComp {
    constructor() {
        this.minHeight = height - height / 3;
        this.height = this.minHeight;
        this.thickness = 5;
        this.wave = [];

        // Draw the waveform
        this.draw = function () {
            push();
            stroke(255);
            strokeWeight(this.thickness);
            // fill(random(255), 100, 100);
            fill(0);

            beginShape();
            vertex(width / 4, this.minHeight);
            for (var i = 0; i < this.wave.length; i++) {
                var x = width / 4 + i * width / this.wave.length / 2;
                var y = this.height - 100 - this.wave[i] * 100;
                vertex(x, y);
            }
            vertex(3 * width / 4, this.minHeight);
            endShape(CLOSE);
            pop();
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

        this.draw = function () {
            let xpos = this.noteXPositions[note];
            if (xpos) {
                fill(this.color);
                // noFill();
                stroke(255);
                strokeWeight(this.thickness);

                rect(xpos, height / 3, width / 12, height / 3);
            }
        };
    }
}
