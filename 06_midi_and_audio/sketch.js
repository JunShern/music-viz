var fft;
var fftBands;
var ampLeft, ampRight;
var audio;

var p;
let playing = true;
let pauseButton;
let maxLength;

function Key(index) {
    this.index = index;
    this.type = MIDI_Message.NOTE_OFF;
    this.channel = 0;
    this.velocity = 0;
    this.colour_off = [0, 0, 1, 0.8];
    this.colour_on = [0, 0, 100, 1];

    this.draw = function () {
        let w = width / 128;
        let h = height;
        left_edge = index * w;

        noStroke();
        // Always draw the empty key first, assuming note is off
        // fill(this.colour_off);
        // rect(left_edge, height - h, 2, height);
        // Draw coloured key based on velocity (will end up transparent for NOTE_OFF since velocity=0)
        this.colour_on[3] = this.velocity * 0.2;
        fill(this.colour_on);
        rect(left_edge, h / 3, 2, height / 3);
    }
}

var keys = [];
var screenAngle = 0;
let lightBlobs = {};

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB); // Max values: 360, 100, 100, 1
    noStroke();
    angleMode(DEGREES);
    frameRate(10);

    // Audio input
    audio = new p5.AudioIn();
    audio.start();
    fft = new p5.FFT();
    fft.setInput(audio);

    // MIDI input
    midiInput = new MIDIInput();
    // Override onMIDIMessage callback with custom function
    midiInput.onMIDIMessage = onMIDIMessage;

    // Key display
    var NUM_KEYS = 128;
    for (var i = 0; i < NUM_KEYS; i++) {
        key = new Key(i)
        keys.push(key);
    }
    background(0);
}

function draw() {
    background(0, 0.9);

    // FFT
    fftBands = fft.analyze();
    wave = fft.waveform();
    
    push();
    stroke(255);
    strokeWeight(2);
    noFill();
    translate(width/2, height/2);
    beginShape();
    for (var i = 0; i < wave.length; i++) {
        var r = height / 4 + wave[i] * height/2;
        var x = r * cos(i * 360 / wave.length);
        var y = r * sin(i * 360 / wave.length);
        vertex(x, y);
    }
    endShape(CLOSE);
    pop();

    // Remove dead lightBlobs
    for (let key in lightBlobs) {
        lightBlobs[key].draw();
        if (lightBlobs[key].life < 0.005) {
            delete lightBlobs[key];
        }
    }
}

function onMIDIMessage(data) {
    msg = new MIDI_Message(data.data);

    // Key display
    keys[msg.note].type = msg.type;
    keys[msg.note].channel = msg.channel;
    keys[msg.note].velocity = Math.round(msg.velocity / 127 * 100) / 100;

    // Light up
    if (msg.type === MIDI_Message.NOTE_OFF || msg.velocity < 0.01 || msg.cmd == 8) {
        lightBlobs[msg.note].endLife();
    } else if (msg.type === MIDI_Message.NOTE_ON) {
        lightBlobs[msg.note] = new Koi;
    }
}

class LightBlob {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.radius = random(10, 30);
        this.color = [
            random(150, 300),
            random(80, 100),
            random(80, 100)
        ];
        this.vigor = 2;
        this.decay = 0.95;
        this.velocity = random(0, 2);
        this.draw = function () {
            this.color[0] += random(-3, 3);
            fill(this.color[0], this.color[1], this.color[2]);
            for (let i = 0; i < 10; i++) {
                fill(this.color[0], this.color[1], this.color[2], i / 10);
                this.x = this.x + random(-this.vigor, this.vigor);
                this.y = this.y + random(-this.vigor, this.vigor);
                let radius = 2 + (10 - i) / 10 * this.radius;
                ellipse(this.x, this.y, radius, radius);
            }
            this.radius *= this.decay;
        };
        this.endLife = function () {
            this.decay = 0.70;
        }
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.plus = function (vec2) {
            return new Vec2(this.x + vec2.x, this.y + vec2.y);
        }

        this.times = function (scalar) {
            return new Vec2(this.x * scalar, this.y * scalar);
        }

        this.normalized = function () {
            let norm = sqrt(this.x ** 2 + this.y ** 2);
            let x = this.x / norm;
            let y = this.y / norm;
            return new Vec2(x, y);
        }
    }
}

class Koi {
    constructor() {
        this.pos = new Vec2(random(width), random(height));
        this.dir = (new Vec2(random(-5, 5), random(-5, 5))).normalized();
        this.radius = random(2, 10);
        this.color = [
            random(150, 300),
            random(80, 100),
            random(80, 100)
        ];
        this.vigor = 0.5;
        this.decay = 0.97;
        this.life = 1;
        this.segmentLength = random(10, 20);
        this.spine = [this.pos];
        this.spineSegments = [1.0, 1.0, 0.5, 0.3, 0, -0.3, -0.5, -0.5, 0];
        for (let i = 1; i < this.spineSegments.length; i++) {
            let vigor = new Vec2(random(-this.vigor, this.vigor), random(-this.vigor, this.vigor));
            this.dir = this.dir.times(5).plus(vigor).normalized();
            let pos = this.spine[this.spine.length - 1].plus(this.dir.times(this.segmentLength));
            this.spine.push(pos);
        }

        this.endLife = function () {
            this.decay = 0.70;
        }

        this.drawOutline = function () {
            noFill();
            stroke(this.color[0], this.color[1], this.color[2], this.life);
            strokeWeight(1);
            beginShape();
            for (let i = 0; i < this.spine.length - 1; i++) {
                let forwardVec = this.spine[i].plus(this.spine[i + 1].times(-1));
                let perpendicularVec = new Vec2(-forwardVec.y, forwardVec.x);
                let vertex = this.spine[i].plus(perpendicularVec.times(this.spineSegments[i]));
                curveVertex(vertex.x, vertex.y);
            }
            curveVertex(this.spine[this.spine.length - 1].x, this.spine[this.spine.length - 1].y);
            for (let i = this.spine.length - 2; i >= 0; i--) {
                let forwardVec = this.spine[i + 1].plus(this.spine[i].times(-1));
                let perpendicularVec = new Vec2(-forwardVec.y, forwardVec.x);
                let vertex = this.spine[i].plus(perpendicularVec.times(this.spineSegments[i]));
                curveVertex(vertex.x, vertex.y);
            }
            curveVertex(this.spine[0].x, this.spine[0].y);
            endShape();
        }

        this.draw = function () {

            // Update direction
            let vigor = new Vec2(random(-this.vigor, this.vigor), random(-this.vigor, this.vigor));
            this.dir = this.dir.plus(vigor).normalized();

            // Update position
            let pos = this.spine[this.spine.length - 1].plus(this.dir.times(this.segmentLength));
            this.spine.push(pos);
            // Circular buffer
            this.spine.shift(); // Remove the oldest

            for (let i = 0; i < 5; i++) {
                push();
                translate(this.dir.x * 2 * i, this.dir.y * 2 * i);
                this.color[0] += random(-5, 5);
                this.drawOutline();
                pop();
            }
            this.life *= this.decay;
        };
    }
}
