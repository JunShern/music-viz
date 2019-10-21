// One Last Time by Shereen Cheong
// with live-coded visuals by Chan Jun Shern

// COLOR SCHEME
// https://coolors.co/2f2f2f-e65f5c-73eedc-ffff82-ffffff
let black = "#202020", red = "#E65F5C", blue = "#73EEDC", yellow = "#FFFF82", white = "#FFFFFF";
let colorPalette = [
    red, blue, yellow
];
let CHANNELS = {
    "EPCOMP":0,
    "EPLINE":1,
    "STRINGS":2,
    "BASS":3,
    "PIANO":4,
    "SYNTH":5,
}

// AUDIO INPUTS
let audio, midiInput;
let fft, fftBands, wave, amplitude;

// DRAWING LAYERS
let cnv;
let layerEPComp, layerStrings, layerEPLine, layerSpectro, layerPiano, layerSynth,
layerPrechorus;

function setup() {
    cnv = createCanvas(1280, 720);
    colorMode(HSB); // Max values: 360, 100, 100, 1
    noStroke();
    angleMode(DEGREES);

    // Audio input
    audio = new p5.AudioIn();
    audio.start();
    fft = new p5.FFT();
    fft.setInput(audio);

    // MIDI input
    midiInput = new MIDIInput();

    // Layers
    layerEPComp = new Layer(setupEPComp, drawEPComp);
    layerStrings = new Layer(setupStrings, drawStrings);
    layerEPLine = new Layer(setupEPLine, drawEPLine);
    layerPiano = new Layer(setupPiano, drawPiano);
    layerBass = new Layer(setupBass, drawBass);
    layerSynth = new Layer(setupSynth, drawSynth);
}

// To overcome Chrome autoplay policy
let first = true;
function keyPressed() {
    if (first) {
        getAudioContext().resume();
        console.log("Resumed audio context");
        first = false;
    }
}

function draw() {
    background(black);
    // Analyze audio
    fftBands = fft.analyze();
    wave = fft.waveform();
    amplitude = audio.amplitude.getLevel();

    // Draw layers
    let mtc_millis = midiInput.getMTCMilliseconds();
    // console.log(mtc_millis);
    if (mtc_millis < 30000) {
        layerEPLine.show();
        layerEPComp.show();
        layerStrings.show();
    }
    if (30000 < mtc_millis && mtc_millis < 79000) {
        layerBass.show();
        layerPiano.show();
    }
    if (79933 < mtc_millis && mtc_millis < 99200) {
        layerSynth.show();
        strings = new StringsRadial();
    }
    if (mtc_millis > 99200) {
        layerStrings.show();
    }
    if (mtc_millis > 109000) {
        layerPiano.show();
    }

    // copy the sketch and move it over based on the speed
    shake = amplitude * 10;
    if (mtc_millis < 30000) {
        copy(cnv, 0, 0, width, height, int(random(-shake, shake)), int(random(-shake, shake)), width, height);
    }
}

// EP COMP LAYER
let epComp;
function setupEPComp(canvas) {
    epComp = new EPComp();
    // React to MIDI message
    midiInput.callbacks[CHANNELS.EPCOMP][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        epComp.jump();
        if (midiInput.getMTCMilliseconds() > 9730) {
            epComp.updateWave(wave);
        }
    });
}
function drawEPComp(canvas) {
    canvas.clear();
    epComp.fall();
    epComp.draw(canvas);
}

// EP LINE LAYER
let epLines = {};
function setupEPLine(canvas) {
    // React to MIDI message
    midiInput.callbacks[CHANNELS.EPLINE][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        epLines[msg.note] = new EPLine(msg.note);
    });
    midiInput.callbacks[CHANNELS.EPLINE][MIDI_Message.NOTE_OFF_CMD].push(function (msg) {
        delete epLines[msg.note];
    });
}
function drawEPLine(canvas) {
    canvas.clear();
    for (let note of Object.keys(epLines)) {
        epLines[note].draw(canvas);
    }
}

// STRINGS LAYER
let strings;
function setupStrings(canvas) {
    strings = new Strings();
    // React to MIDI message
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (midiInput.getMTCMilliseconds() > 16930) {
            strings.numStrings++;
        }
    });
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_OFF_CMD].push(function (msg) {
        strings.numStrings--;
        strings.numStrings = max(strings.numStrings, 0);
    });
}
function drawStrings(canvas) {
    if (midiInput.getMTCMilliseconds() < 99200) {
        canvas.clear();
    }
    strings.draw(canvas);
}

// SPECTROGRAM LAYER
let prechorus;
function setupSpectro(canvas) {
    canvas.colorMode(HSB, 255);
    canvas.angleMode(DEGREES);
    canvas.background(255);
    canvas.rectMode(CENTER);

    prechorus = new Threadweb();

    // React to MIDI message
    midiInput.callbacks[CHANNELS.EPCOMP][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        prechorus.pos = createVector(random(width), random(height));
    });
}
let speed = 2;
function drawSpectro(canvas) {
    prechorus.draw(canvas);
    // speed = 100;
    // canvas.fill(0);
    // canvas.rect(width/2, height/2, 10, 10);    
    canvas.image(canvas, -speed/2, -speed/2, width+speed, height+speed);
}
class Threadweb {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.speed = 2;
        this.color = random(colorPalette);
    }
    draw(cnv) {
        cnv.stroke(colorPalette[0]);
        cnv.line(random(width), 0, this.pos.x, this.pos.y);
        cnv.line(random(width), height, this.pos.x, this.pos.y);
        cnv.line(0, random(height), this.pos.x, this.pos.y);
        cnv.line(width, random(height), this.pos.x, this.pos.y);

        cnv.stroke(colorPalette[1]);
        cnv.line(random(width), 0, this.pos.x, this.pos.y);
        cnv.line(random(width), height, this.pos.x, this.pos.y);
        cnv.line(0, random(height), this.pos.x, this.pos.y);
        cnv.line(width, random(height), this.pos.x, this.pos.y);

        cnv.noStroke();
        cnv.fill(255);
        cnv.ellipse(this.pos.x, this.pos.y, 10, 10);
    }
}

// PIANO LAYER
let poseKeypoints;
let painter;
let paintdrops = [];
let waterLevel = 0;
let waterWave = new Array(1024).fill(0);
function setupPiano(canvas) {
    canvas.noStroke();
    canvas.angleMode(DEGREES);

    // Person detector
    poseKeypoints = new PoseKeypoints();

    // Renderer for our person
    painter = new Painter();

    // React to MIDI message
    midiInput.callbacks[CHANNELS.PIANO][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (midiInput.getMTCMilliseconds() < 60000) {
            paintdrop = new Paintdrop(random(
                poseKeypoints.getNormalizedPoints(createVector(width/2, height/2))
                ));
            paintdrops.push(paintdrop);
        } else if (midiInput.getMTCMilliseconds() < 79266) {
            paintdrop = new Paintdrop(createVector(random(width), random(height - waterLevel)));
            paintdrops.push(paintdrop);
            // Update water wave
            waterWave = wave;
        } else {
            paintdrops = []; // Clear
        }
    });
}
function drawPiano(canvas) {
    canvas.clear();

    // Get pose detection output
    poseKeypoints.update();
    let points = poseKeypoints.getNormalizedPoints(createVector(width/2, height/2));

    if (midiInput.getMTCMilliseconds() < 109000) {
        // Water level rising
        canvas.fill(black);
        canvas.noStroke();
        waterLevel = map(midiInput.getMTCMilliseconds(), 60000, 76000, 0, height);
        // Draw water using wave
        canvas.noStroke();
        canvas.fill(black);
        canvas.beginShape();
        canvas.vertex(0, height);
        for (var i = 0; i < waterWave.length; i++) {
            var x = width * i / waterWave.length;
            var y = height - waterLevel + 50 * waterWave[i];
            canvas.vertex(x, y);
        }
        canvas.vertex(width, height);
        canvas.endShape(CLOSE);
        //canvas.rect(0, height - waterLevel, width, waterLevel);

        // Splash paintdrops on every keypress
        paintdrops.forEach(function(paintdrop) {
            paintdrop.draw(canvas);
            if (paintdrop.pos.y > height - waterLevel) {
                paintdrop.color = [255, 255];
                paintdrop.acc.mult(0);
                paintdrop.vel.mult(0.1);
                paintdrop.decaying = true;
            }
        });
        // Remove paintdrops which have left the screen
        paintdrops = paintdrops.filter(paintdrop => paintdrop.pos.y < height || paintdrop.life < 10);
    }

    // Draw musician based on pose detection output
    painter.clear();
    points.forEach(point => painter.addPoint(createVector(point.x, point.y)));
    painter.draw(canvas);
}

class PoseKeypoints {
    constructor() {
        this.points = [];
    }

    getNormalizedPoints(pos) {
    
        // Find min/max bounds to rescale
        let minX = this.points.reduce( (prev,curr) => prev.x < curr.x ? prev : curr, 0).x;
        let maxX = this.points.reduce( (prev,curr) => prev.x > curr.x ? prev : curr, width).x;
        let minY = this.points.reduce( (prev,curr) => prev.y < curr.y ? prev : curr, 0).y;
        let maxY = this.points.reduce( (prev,curr) => prev.y > curr.y ? prev : curr, height).y;
        // Scale to 60% of canvas
        let scaleFactor = 0.6 * min( width / (maxX - minX), height / (maxY - minY) );

        // Find center
        let centerPoint = createVector( minX + (maxX - minX) / 2, minY + (maxY - minY) / 2 );

        // Normalize
        let normalizedPoints = this.points.map(point => p5.Vector.sub(point, centerPoint).mult(scaleFactor).add(pos));
        return normalizedPoints;
    }

    update() {
        // Get current playback time
        let mtc_millis = midiInput.getMTCMilliseconds();
        let frameIndex = int(30 * mtc_millis / 1000); // Video was recorded in 30 FPS
        // Read json file
        frameIndex = min(max(frameIndex - 265, 0), 7779); // Magic numbers to align video with audio time
        let frameString = String(frameIndex).padStart(5, "0");
        let jsonPath = "./output/performance_0000000" + frameString + "_keypoints.json";
        this.readPointsFromJSON(jsonPath);
    }

    readPointsFromJSON(jsonPath) {
        $.getJSON(jsonPath, function (json) {
            poseKeypoints.points = [];
            for (let i = 0; i < json.people.length; i++) {
                let leftHand = json.people[i].hand_left_keypoints_2d;
                let rightHand = json.people[i].hand_right_keypoints_2d;
                let body = json.people[i].pose_keypoints_2d;
    
                // Pick which keypoints we want to display, and in what order
                // https://github.com/CMU-Perceptual-Computing-Lab/openpose/blob/master/doc/output.md
    
                // Right Hand
                [0,1,2,3,4,3,2,1,0,5,6,7,8,7,6,5,0,9,10,11,12,11,10,9,0,13,14,15,16,15,14,13,0,17,18,19,20,19,18,17,0].forEach(function(pose_idx) {
                    let x = rightHand[pose_idx * 3];
                    let y = rightHand[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Right arm
                [4,3,2,1].forEach(function(pose_idx) {
                    let x = body[pose_idx * 3];
                    let y = body[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Head
                [8,1,17,15,0,16,18,1,8].forEach(function(pose_idx) {
                    let x = body[pose_idx * 3];
                    let y = body[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Left arm
                [1,5,6,7].forEach(function(pose_idx) {
                    let x = body[pose_idx * 3];
                    let y = body[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Left Hand
                [0,1,2,3,4,3,2,1,0,5,6,7,8,7,6,5,0,9,10,11,12,11,10,9,0,13,14,15,16,15,14,13,0,17,18,19,20,19,18,17,0].forEach(function(pose_idx) {
                    let x = leftHand[pose_idx * 3];
                    let y = leftHand[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
            }
        });
    }
}

// BASS LAYER
let dots = [];
let newBass = false;
function setupBass(canvas) {
    canvas.stroke(255);
    canvas.fill(255);
    canvas.textAlign(CENTER, CENTER);
    // React to MIDI message
    midiInput.callbacks[CHANNELS.BASS][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (dots.length < 1000) {
            for (let i = 0; i < 50; i++) {
                let dot = new Dot();
                dots.push(dot);
            }
        }
    });
}
function drawBass(canvas) {
    if (dots.length < 1500) {
        dots.forEach(function f(dot) {
            dot.draw(canvas);
            dot.size += random(-2, 10);
        });
    }
}

// SYNTH LAYER
let neon;
let synthCount = 1;
function setupSynth(canvas) {
    neon = new Neon();
    // React to MIDI message
    midiInput.callbacks[CHANNELS.SYNTH][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (midiInput.getMTCMilliseconds() < 84233) {
            synthCount = 1;
        } else if (midiInput.getMTCMilliseconds() < 89000) {
            synthCount = 2;
        } else {
            synthCount = 3;
        }
        neon.addRandomPoint();
    });
}
function drawSynth(canvas) {
    canvas.background(32, 100);
    for (let i = 0; i < synthCount; i++) {
        for (let j = 0; j < synthCount; j++) {
            canvas.push();
            let denom = synthCount + 1;
            canvas.translate(width / denom + i * width / denom, height / denom + j * height / denom);
            neon.draw(canvas);
            canvas.pop();
        }
    }
    let speed = 4;
    canvas.image(canvas, -speed / 2, -speed / 2, width + speed, height + speed);
}

class EPComp {
    constructor() {
        this.minHeight = height - height / 3;
        this.height = this.minHeight;
        this.thickness = 5;
        this.wave = new Array(1024).fill(0);
    }

    // Draw the waveform
    draw(cnv) {
        cnv.push();

        let xOffset = width / 4;
        let xWidth = width / 2;

        cnv.noStroke();
        cnv.fill(black);
        cnv.beginShape();
        cnv.vertex(0, height);
        for (var i = 0; i < this.wave.length; i++) {
            var x = xOffset + xWidth * (i / this.wave.length);
            var y = this.height - 100 - this.wave[i] * 100;
            cnv.vertex(x, y);
        }
        cnv.vertex(width, height);
        cnv.endShape(CLOSE);

        cnv.stroke(255);
        cnv.strokeWeight(this.thickness);
        cnv.noFill();
        cnv.beginShape();
        // cnv.vertex(xOffset, this.minHeight);
        for (var i = 0; i < this.wave.length; i++) {
            var x = xOffset + xWidth * (i / this.wave.length);
            var y = this.height - 100 - this.wave[i] * 100;
            cnv.vertex(x, y);
        }
        // cnv.vertex(xOffset + xWidth, this.minHeight);
        cnv.endShape();

        cnv.pop();
    }

    // Update the waveform
    updateWave(newWave) {
        this.wave = newWave;
    }

    // Waveform bounces up and down
    jump() {
        this.height -= 50;
        this.height = max(height / 4, this.height);
    }

    fall() {
        // Height dropping
        this.height += 20; // Falling
        this.height = min(this.height, this.minHeight); // Floor
    }
}

class Strings {
    constructor() {
        this.thickness = 5;
        this.numStrings = 0;
    }
    draw(cnv) {
        let xOffset = width / 4;
        let xWidth = width / 2;
        let y = height * 2 / 3;
        for (var i = 0; i < this.numStrings; i++) {
            let x = random(xOffset, xOffset + xWidth);
            cnv.stroke(random(colorPalette));
            cnv.strokeWeight(random(2, 5));
            cnv.line(x, y, x, 0);
            cnv.line(x, y, width * (x - xOffset) / xWidth, height);
        }
    };
}

class StringsRadial {
    constructor() {
        this.thickness = 5;
        this.numStrings = 0;
        this.pos = createVector(width/2, height/2);
        this.vel = createVector(100, 100);
        this.jitter = 500;
    }
    draw(cnv) {
        cnv.push();
        cnv.stroke(white);
        for (var i = 0; i < this.numStrings; i++) {
            if (midiInput.getMTCMilliseconds() < 103200) {
                cnv.strokeWeight(random(2, 5));
                cnv.line(
                    this.pos.x + random(-this.jitter, this.jitter), 
                    this.pos.y + random(-this.jitter, this.jitter),
                    this.pos.x + random(-this.jitter, this.jitter), 
                    this.pos.y + random(-this.jitter, this.jitter));
            } else { // if (midiInput.getMTCMilliseconds() < 106266) {
                cnv.noStroke();
                cnv.fill(random(colorPalette));
                cnv.beginShape(TRIANGLE_STRIP);
                cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
                cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
                cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
                cnv.endShape();
            }
            // } else {
            //     cnv.noStroke();
            //     cnv.fill(white);
            //     cnv.beginShape(TRIANGLE_STRIP);
            //     cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
            //     cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
            //     cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
            //     cnv.endShape();
            // }
        }
        this.pos.add(this.vel);
        if (this.pos.x < 0 || this.pos.x > width) {
            this.vel.x *= -1;
        }
        if (this.pos.y < 0 || this.pos.y > height) {
            this.vel.y *= -1;
        }
        cnv.pop();
    };
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
        this.color = colorPalette[this.note % colorPalette.length];
        this.thickness = 5;
    }

    draw(cnv) {
        let xpos = this.noteXPositions[this.note];
        if (xpos) {
            cnv.stroke(white);
            cnv.strokeWeight(this.thickness);

            cnv.noFill();
            if (midiInput.getMTCMilliseconds() > 20000) {
                cnv.fill(this.color);
            }
            cnv.rect(xpos, height / 3, width / 12, height / 3);
        }
    }
}

class Painter {
    constructor() {
        this.memory = [createVector(width / 2, height / 2)];
        this.brushWidth = 5;
    }

    addPoint(vec) {
        this.memory.push(vec);
    }

    clear() {
        this.memory = [];
    }

    draw(cnv) {
        if (midiInput.getMTCMilliseconds() < 109000) {
            cnv.fill(black);
            cnv.stroke(black);
            cnv.beginShape();
            for (var i = 0; i < this.memory.length; i++) {
                var x = this.memory[i].x + random(-this.brushWidth, this.brushWidth);
                var y = this.memory[i].y + random(-this.brushWidth, this.brushWidth);
                cnv.curveVertex(x, y);
            }
            for (var i = this.memory.length - 1; i >= 0; i--) {
                var x = this.memory[i].x + random(-this.brushWidth, this.brushWidth);
                var y = this.memory[i].y + random(-this.brushWidth, this.brushWidth);
                cnv.curveVertex(x, y);
            }
            cnv.endShape();

        } else {
            cnv.fill(black);
            cnv.noStroke();
            cnv.beginShape(TRIANGLE_STRIP);
            for (var i = 0; i < this.memory.length; i++) {
                var x = this.memory[i].x + random(-this.brushWidth, this.brushWidth);
                var y = this.memory[i].y + random(-this.brushWidth, this.brushWidth);
                cnv.vertex(x, y);
            }
            for (var i = this.memory.length - 1; i >= 0; i--) {
                var x = this.memory[i].x + random(-this.brushWidth, this.brushWidth);
                var y = this.memory[i].y + random(-this.brushWidth, this.brushWidth);
                cnv.vertex(x, y);
            }
            cnv.endShape();
        }

    }
}
class Paintdrop {
    constructor(originPoint) {
        this.brushWidth = 5;
        this.vel = createVector(random(-5, 5), random(-10, 0));
        this.pos = p5.Vector.add(originPoint, createVector(random(-20, 20), random(-10, 0)));
        this.acc = createVector(0, 0.5);
        this.radius = 8;
        this.jitter = 2;
        this.color = random([[32, 255], [230, 95, 92, 255]]);
        this.shape = [
            createVector(random(-this.radius, this.radius), random(-this.radius, this.radius)),
            createVector(random(-this.radius, this.radius), random(-this.radius, this.radius)),
            createVector(random(-this.radius, this.radius), random(-this.radius, this.radius)),
            createVector(random(-this.radius, this.radius), random(-this.radius, this.radius)),
            createVector(random(-this.radius, this.radius), random(-this.radius, this.radius)),
        ]
        this.life = 255;
        this.decaying = false;
    }

    draw(cnv) {
        this.color[this.color.length - 1] = this.life;
        cnv.fill(this.color);
        cnv.noStroke();
        cnv.beginShape();
        for (var i = 0; i < this.shape.length; i++) {
            let point = p5.Vector.add(this.pos, this.shape[i]);
            cnv.curveVertex(point.x, point.y);
            // Add jitter
            this.shape[i] = p5.Vector.add(
                this.shape[i],
                createVector(random(-this.jitter, this.jitter), random(-this.jitter, this.jitter))
            );
        }
        cnv.endShape(CLOSE);

        // Update physics
        this.vel.add(this.acc);
        this.pos.add(this.vel);

        // Update life
        if (this.decaying) {
            this.life -= 5;
        }
    }
}

class Dot {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.size = 10;
        this.thickness = 1;
    }
    draw(cnv) {
        cnv.stroke(255);
        this.pos.add(createVector(random(-1, 1), random(-1, 1)));
        cnv.strokeWeight(this.thickness);
        cnv.line(
            this.pos.x - this.size / 2, this.pos.y,
            this.pos.x + this.size / 2, this.pos.y);
    }
}

class Neon {
    constructor() {
        this.memory = [];
        this.maxLength = 6;
        // Balls
        this.radius = 100;
        this.pos = createVector(0, 0);
        this.velocity = createVector(20, 10);
        this.age = 1;
        this.aging = false;
        this.curveTightness = 1;
    }

    addRandomPoint() {
        let angle = random(360);
        let x = this.pos.x + this.radius * cos(angle);
        let y = this.pos.y + this.radius * sin(angle);
        this.addPoint(x, y);
    }

    addPoint(x, y) {
        this.memory.push(createVector(x, y));
        if (this.memory.length > this.maxLength) {
            this.memory.shift();
        }
        this.age = 1;
        this.curveTightness = 1;
    }

    draw(cnv) {
        while (this.memory.length < this.maxLength) {
            this.addRandomPoint();
        }
        this.curveTightness -= 0.01;
        cnv.curveTightness(this.curveTightness);
        cnv.noFill();

        this.age -= 0.005;
        let alpha = 255 * this.age;
        cnv.push();
        cnv.stroke(255, 0, 0, alpha);
        cnv.strokeWeight(2);
        cnv.beginShape();
        for (let i = 0; i < this.memory.length; i++) {
            cnv.curveVertex(this.memory[i].x + random(-2, 2), this.memory[i].y + random(-2, 2));
        }
        cnv.endShape();
        cnv.pop();

        cnv.push();
        cnv.stroke(0, 0, 255, alpha);
        cnv.strokeWeight(2);
        cnv.beginShape();
        for (let i = 0; i < this.memory.length; i++) {
            cnv.curveVertex(this.memory[i].x + random(-2, 2), this.memory[i].y + random(-2, 2));
        }
        cnv.endShape();
        cnv.pop();

        cnv.push();
        cnv.stroke(255, alpha);
        cnv.strokeWeight(3);
        cnv.beginShape();
        for (let i = 0; i < this.memory.length; i++) {
            cnv.curveVertex(this.memory[i].x + random(-2, 2), this.memory[i].y + random(-2, 2));
        }
        cnv.endShape();
        cnv.pop();
    }
}