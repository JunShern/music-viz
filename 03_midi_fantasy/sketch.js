
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

        // Always draw the empty key first, assuming note is off
        // fill(this.colour_off);
        // rect(left_edge, height - h, 2, height);
        // Draw coloured key based on velocity (will end up transparent for NOTE_OFF since velocity=0)
        this.colour_on[3] = this.velocity * 0.2;
        fill(this.colour_on);
        rect(left_edge, h/3, 2, height/3);
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
    frameRate(10);

    midiInput = new MIDIInput();
    // Override onMIDIMessage callback with custom function
    midiInput.onMIDIMessage = onMIDIMessage;

    mic = new p5.AudioIn();
    mic.start();

    // Key display
    var NUM_KEYS = 128;
    for (var i = 0; i < NUM_KEYS; i++) {
        key = new Key(i)
        keys.push(key);
    }
    background(0);
}

function draw() {
    background(0, 0.1);

    for (var i = 0; i < keys.length; i++) {
        keys[i].draw();
    }
    // Remove dead lightBlobs
    for (let key in lightBlobs) {
        lightBlobs[key].draw();
        if (lightBlobs[key].radius < 1) {
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
    if (msg.type === MIDI_Message.NOTE_ON) {
        lightBlobs[msg.note] = new LightBlob;
    } else if (msg.type === MIDI_Message.NOTE_OFF) {
        lightBlobs[msg.note].decay = 0.5;
    }
}

// function keyPressed() {
//     lightBlobs[1] = new LightBlob;
// }

function LightBlob() {
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

    this.draw = function() {
        this.color[0] += random(-3, 3);
        fill(this.color[0], this.color[1], this.color[2]);
        for (let i = 0; i < 10; i++) {
            fill(this.color[0], this.color[1], this.color[2], i / 10);
            this.x = this.x + random(-this.vigor, this.vigor);
            this.y = this.y + random(-this.vigor, this.vigor);
            let radius = 2 + (10 - i)/10 * this.radius;
            ellipse(this.x, this.y, radius, radius);
        }
        this.radius *= this.decay;
    }
}