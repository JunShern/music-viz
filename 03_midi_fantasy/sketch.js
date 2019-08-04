
function Key(index) {
    this.index = index;
    this.type = MIDI_Message.NOTE_OFF;
    this.channel = 0;
    this.velocity = 0;
    this.colour_off = color(0, 0, 10);
    this.colour_on = _.range(16).map(i => color(Math.round((i + 7) % 16 * 360 / 16), 100, 100, 1));

    this.draw = function () {
        let w = width / 128;
        let h = 50;
        left_edge = index * w;

        // Always draw the empty key first, assuming note is off
        fill(this.colour_off);
        rect(left_edge, height - h, w - 4, height);
        // Draw coloured key based on velocity (will end up transparent for NOTE_OFF since velocity=0)
        this.colour_on[this.channel]._array[3] = this.velocity;
        // console.log(this.colour_on[this.channel]);
        fill(this.colour_on[this.channel]);
        rect(left_edge, height - h, w - 4, height);
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

    // Key display
    var NUM_KEYS = 128;
    for (var i = 0; i < NUM_KEYS; i++) {
        key = new Key(i)
        keys.push(key);
    }
    background(0);
}

function draw() {
    background(0, 0.5);

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
    this.radius = random(10, 20);
    this.color = [random(255), random(255), random(255)];
    this.vigor = 2;
    this.decay = 1;
    this.velocity = random(0, 2);

    this.draw = function() {
        fill(this.color[0], this.color[1], this.color[2]);
        for (let i = 0; i < 10; i++) {
            this.x = this.x + random(-this.vigor, this.vigor);
            this.y = this.y + random(-this.vigor, this.vigor);
            ellipse(this.x, this.y, this.radius, this.radius);    
        }
        this.radius *= this.decay;
    }
}