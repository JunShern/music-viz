var fft;
var fftBands;
var ampLeft, ampRight;
var audio;

var p;
let playing = true;
let pauseButton;
let maxLength;

var balls = [];
var numBalls = 50;
var colorPalette = [
    [132, 94, 194, 255],
    [214, 93, 177, 255],
    [255, 111, 145, 255],
    [255, 150, 113, 255],
    [255, 199, 95, 255],
    [249, 248, 113, 255]
];

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
    //colorMode(HSB); // Max values: 360, 100, 100, 1
    noStroke();
    angleMode(DEGREES);
    frameRate(20);

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
    for (var i = 0; i < numBalls; i++) {
        var ball = new Ball();
        balls.push(ball);
    }
    background(30);
}

function draw() {

    background(30);
    noStroke();
    for (var i = 0; i < balls.length; i++) {
        balls[i].display();
        balls[i].update();
        balls[i].color[3] += audio.amplitude.getLevel() * 1000;
        balls[i].direction.x *= 1 + audio.amplitude.getLevel();
        balls[i].direction.y *= 1 + audio.amplitude.getLevel();
    }
    stroke(255);
    strokeWeight(10);
    line(0, height - audio.amplitude.getLevel() * height, width, height - audio.amplitude.getLevel() * height);
    fill(255);

    // // FFT
    // fftBands = fft.analyze();
    // wave = fft.waveform();

    // push();
    // stroke(255);
    // strokeWeight(2);
    // noFill();
    // translate(width / 2, height / 2);
    // beginShape();
    // for (var i = 0; i < wave.length; i++) {
    //     var r = height / 4 + wave[i] * height / 2;
    //     var x = r * cos(i * 360 / wave.length);
    //     var y = r * sin(i * 360 / wave.length);
    //     vertex(x, y);
    // }
    // endShape(CLOSE);
    // pop();

    // // Remove dead lightBlobs
    // for (let key in lightBlobs) {
    //     lightBlobs[key].draw();
    //     if (lightBlobs[key].life < 0.005) {
    //         delete lightBlobs[key];
    //     }
    // }
}

function onMIDIMessage(data) {
    msg = new MIDI_Message(data.data);
    console.log(msg);
    console.log(msg.type);

    // Light up
    if (msg.type === MIDI_Message.NOTE_OFF || msg.velocity < 0.01 || msg.cmd == 8) {
        // lightBlobs[msg.note].endLife();
    } else if (msg.type === MIDI_Message.NOTE_ON) {
        balls.shift();
        console.log("After shifting " + balls.length);
        var ball = new Ball();
        balls.push(ball);
        console.log("After adding " + balls.length);
    }
}

function Ball() {
    this.position = createVector(random(width), random(height));
    this.diameter = random(5, 20);
    this.color = random(colorPalette).slice();
    this.direction = createVector(random(-5, 5), random(-5, 5));

    this.display = function () {
        fill(this.color);
        ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
    };
    this.update = function () {
        // Add damping
        this.direction.x = this.direction.x * 0.97;
        this.direction.y = this.direction.y * 0.97;

        // Reset direction if almost stopped
        if (abs(this.direction.x) + abs(this.direction.y) < 0.1) {
            this.direction = createVector(random(-5, 5), random(-5, 5));
        }

        // Update position
        this.position.x = this.position.x + this.direction.x;
        this.position.y = this.position.y + this.direction.y;
        if (this.position.x <= 0 || this.position.x >= width) {
            this.direction.x = - this.direction.x;
        }
        if (this.position.y <= 0 || this.position.y >= height) {
            this.direction.y = - this.direction.y;
        }
        this.position.x = constrain(this.position.x, 0, width);
        this.position.y = constrain(this.position.y, 0, height);

        // Fade color over time
        if (this.color[3] > 10) {
            this.color[3] -= 10;
        }
    };
}