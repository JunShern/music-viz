let midiInput, midiOutput;
var fft;
var audio;
let painter;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB); // Max values: 360, 100, 100, 1
    noStroke();
    angleMode(DEGREES);
    frameRate(20);

    stroke(255);
    strokeWeight(2);

    // Audio input
    audio = new p5.AudioIn();
    audio.start();
    fft = new p5.FFT();
    fft.setInput(audio);

    // MIDI input
    setupMidi(1, 0); // by id
    // setupMidi("LPK25", "LPK25"); // by name
    painter = new Painter();
}

function drawWavelet(wave, xpos, ypos, radius) {
    let maxVal = max(wave);
    let minVal = min(wave);
    // Draw rings
    beginShape();
    let val = 0;
    for (var j = 0; j < wave.length; j += 5) {
        let normVal = (wave[j] - minVal) / maxVal;
        val = normVal * 0.9 + val * 0.1; // Moving average
        var r = (radius / 2) + (val * radius / 4);
        var x = xpos + r * cos(j * 360 / wave.length);
        var y = ypos + r * sin(j * 360 / wave.length);
        curveVertex(x, y);
    }
    endShape(CLOSE);
}

function brush(xposes, yposes, brushWidth = 5) {
    beginShape();
    for (var i = 0; i < xposes.length; i++) {
        var x = xposes[i] + random(-brushWidth, brushWidth);
        var y = yposes[i] + random(-brushWidth, brushWidth);
        curveVertex(x, y);
    }
    for (var i = xposes.length - 1; i > 0; i--) {
        var x = xposes[i] + random(-brushWidth, brushWidth);
        var y = yposes[i] + random(-brushWidth, brushWidth);
        curveVertex(x, y);
    }
    endShape(CLOSE);
}

function draw() {
    background(10);

    // FFT
    let fftBands = fft.analyze();
    let currentWave = fft.waveform();

    painter.draw();
}

function mouseClicked() {
    painter.addPoint(mouseX, mouseY);
}

function Painter() {
    this.memoryX = [];
    this.memoryY = [];
    this.brushWidth = 5;

    this.addPoint = function(x, y) {
        this.memoryX.push(x);
        this.memoryY.push(y);
    }

    this.draw = function() {
        let hue = (frameCount * 10) % 360;
        fill(hue, 200, 50, 1);
        stroke(hue, 200, 50, 1);
        
        console.log(this.memoryX);
        console.log(this.memoryY);

        beginShape();
        for (var i = 0; i < this.memoryX.length; i++) {
            var x = this.memoryX[i] + random(-this.brushWidth, this.brushWidth);
            var y = this.memoryY[i] + random(-this.brushWidth, this.brushWidth);
            curveVertex(x, y);
        }
        for (var i = this.memoryX.length - 1; i >= 0; i--) {
            var x = this.memoryX[i] + random(-this.brushWidth, this.brushWidth);
            var y = this.memoryY[i] + random(-this.brushWidth, this.brushWidth);
            curveVertex(x, y);
        }
        endShape(CLOSE);

        //let xHead = this.memoryX.pop();
        //let yHead = this.memoryY.pop();
        //this.memoryX.unshift(xHead);
        //this.memoryY.unshift(yHead);
    }
}

function mousePressed() {
    // example of sending midi note
    sendNote(1, "C", 3, 1000, 127); // channel, note, octave, duration, velocity
}

function sendNote(channel, note, octave, duration, velocity) {
    midiOutput.playNote(note + octave, channel, {
        duration: duration,
        velocity: parseFloat(velocity) / 127.0
    });
}

function noteOn(note) {
    print(note); // .type, .channel, .name, .octave, .velocity
    waves.unshift(currentWave);
    if (waves.length > maxRings) {
        waves.pop();
    }
}

function noteOff(note) {
    print(note); // .type, .channel, .name, .octave, .velocity
}

function pitchBend(pitch) {
    print(pitch); // .type, .channel, .value
}

function controlChange(control) {
    print(control); // .type, .channel, .controllerNumber, .controllerName, .value
}


function setupMidi(idIn, idOut) {
    WebMidi.enable(function (err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        }

        // Print to console available MIDI in/out id/names
        WebMidi.inputs.forEach(function (element, c) {
            print("in  \[" + c + "\] " + element.name);
        });
        WebMidi.outputs.forEach(function (element, c) {
            print("out \[" + c + "\] " + element.name);
        });

        // assign in channel:
        if (typeof idIn === 'number') {
            midiInput = WebMidi.inputs[idIn];
        } else {
            midiInput = WebMidi.getInputByName(idIn);
        }

        if (typeof idOut === 'number') {
            midiOutput = WebMidi.outputs[idOut];
        } else {
            midiOutput - WebMidi.getOutputByName(idOut);
        }

        // noteOn
        midiInput.addListener('noteon', "all", function (e) {
            let note = {
                type: 'noteon'
            };
            note.channel = e.channel;
            note.name = e.note.name;
            note.octave = e.note.octave;
            note.velocity = floor(127 * e.velocity);
            noteOn(note);
        });

        // noteOff
        midiInput.addListener('noteoff', "all", function (e) {
            let note = {
                type: 'noteoff'
            };
            note.channel = e.channel;
            note.name = e.note.name;
            note.octave = e.note.octave;
            note.velocity = 0;
            noteOff(note);
        });

        // pitchBend
        midiInput.addListener('pitchbend', "all", function (e) {
            let pitch = {
                type: 'pitchbend'
            };
            pitch.channel = e.channel;
            pitch.value = floor(127 * e.value);
            pitchBend(pitch);
        });

        // controlChange
        midiInput.addListener('controlchange', "all", function (e) {
            let control = {
                type: 'controlchange'
            };
            control.channel = e.channel;
            control.controllerNumber = e.controller.number;
            control.controllerName = e.controller.name;
            control.value = e.value
            controlChange(control);
        });

    });
}