// One Last Time by Shereen Cheong
// with live-coded visuals by Chan Jun Shern

// COLOR SCHEME
// https://coolors.co/2f2f2f-e65f5c-73eedc-ffff82-ffffff
let black = "#202020", red = "#E65F5C", blue = "#73EEDC", yellow = "#FFFF82", white = "#FFFFFF";
let colorPalette = [
    red, blue, yellow
];
let CHANNELS = {
    "EPCOMP": 0,
    "EPLINE": 1,
    "STRINGS": 2,
    "BASS": 3,
    "PIANO": 4,
    "SYNTH": 5,
}

// AUDIO INPUTS
let audio, midiInput;
let fft, fftBands, wave, amplitude;

// DRAWING LAYERS
let cnv;
let layerEPComp, layerStrings, layerEPLine, layerPiano, layerSynth,
    layerPrechorus, layerStarfield, layerStrobe, layerBridge, layerPixelGrid,
    layerFinale;
let mtcMillis;
let fonts;
function preload() {
    fonts = [
        loadFont("resources/fonts/Kanit-Black.ttf"),
        loadFont("resources/fonts/AbrilFatface-Regular.ttf"),
        loadFont("resources/fonts/Anton-Regular.ttf"),
        loadFont("resources/fonts/CantataOne-Regular.ttf"),
        loadFont("resources/fonts/CarterOne-Regular.ttf"),
        loadFont("resources/fonts/Chewy-Regular.ttf"),
        loadFont("resources/fonts/CoveredByYourGrace-Regular.ttf"),
        loadFont("resources/fonts/FascinateInline-Regular.ttf"),
        loadFont("resources/fonts/HomemadeApple-Regular.ttf"),
        loadFont("resources/fonts/Kanit-Black.ttf"),
        loadFont("resources/fonts/Kanit-Bold.ttf"),
        loadFont("resources/fonts/Kanit-ExtraBold.ttf"),
        loadFont("resources/fonts/LexendZetta-Regular.ttf"),
        loadFont("resources/fonts/LiuJianMaoCao-Regular.ttf"),
        loadFont("resources/fonts/Lusitana-Bold.ttf"),
        loadFont("resources/fonts/Lusitana-Regular.ttf"),
        loadFont("resources/fonts/Modak-Regular.ttf"),
        loadFont("resources/fonts/Monoton-Regular.ttf"),
        loadFont("resources/fonts/MontserratSubrayada-Bold.ttf"),
        loadFont("resources/fonts/NothingYouCouldDo-Regular.ttf"),
        loadFont("resources/fonts/NotoSerif-BoldItalic.ttf"),
        loadFont("resources/fonts/NotoSerif-Bold.ttf"),
        loadFont("resources/fonts/NotoSerif-Italic.ttf"),
        loadFont("resources/fonts/NotoSerif-Regular.ttf"),
        loadFont("resources/fonts/OleoScript-Regular.ttf"),
        loadFont("resources/fonts/Pacifico-Regular.ttf"),
        loadFont("resources/fonts/PTMono-Regular.ttf"),
        loadFont("resources/fonts/Raleway-Black.ttf"),
        loadFont("resources/fonts/RockSalt-Regular.ttf"),
        loadFont("resources/fonts/SpicyRice-Regular.ttf"),
        loadFont("resources/fonts/Srisakdi-Bold.ttf"),
        loadFont("resources/fonts/Srisakdi-Regular.ttf")
    ];
}
let resizeFactor;

function setup() {
    cnv = createCanvas(1920, 1080);
    resizeFactor = height / 720; // Resize from original 1080x720 application
    frameRate(30);
    noStroke();
    angleMode(DEGREES);

    // Audio input
    audio = new p5.AudioIn();
    audio.start();
    fft = new p5.FFT();
    fft.setInput(audio);

    // MIDI input
    midiInput = new MIDIInput();
    mtcMillis = midiInput.getMTCMilliseconds();

    // Layers
    layerEPComp = new Layer(setupEPComp, drawEPComp);
    layerStrings = new Layer(setupStrings, drawStrings);
    layerEPLine = new Layer(setupEPLine, drawEPLine);
    layerPiano = new Layer(setupPiano, drawPiano);
    layerBass = new Layer(setupBass, drawBass);
    layerSynth = new Layer(setupSynth, drawSynth);
    layerStarfield = new Layer(setupStarfield, drawStarfield);
    layerStrobe = new Layer(setupStrobe, drawStrobe);
    layerBridge = new Layer(setupBridge, drawBridge);
    layerPixelGrid = new Layer(setupPixelGrid, drawPixelGrid);
    layerFinale = new Layer(setupFinale, drawFinale);
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
    mtcMillis = midiInput.getMTCMilliseconds();
    mtcBeatNumber = int(mtcMillis / 60000 * 96);
    mtcBarNumber = int(mtcMillis / 2500);

    // Clauses are ordered in time, from bottom to top
    if (mtcMillis > 239500) {
        layerFinale.draw();
        if (mtcMillis > 240500) {
            layerPiano.draw();
        }
    } else if (mtcMillis > 219700) {
        layerFinale.update();
        layerBridge.update();
        let blendedImg = layerStrings.getBlendImage(layerBridge, layerFinale, LIGHTEST);
        image(blendedImg, 0, 0, width, height);
    } else if (mtcMillis > 169800) {
        layerBridge.update();
        layerPixelGrid.draw();
        layerStrobe.draw();
        if (mtcMillis > 218700) {
            // layerBridge.draw();
        } else if (mtcMillis > 217333 && mtcMillis < 219600 && mtcMillis % 5) {
            // layerBridge.draw();
            background(black);
        }
    } else if (mtcMillis > 130000) {
        layerStrings.update();
        layerStarfield.update();
        let blendedImg = layerStrings.getBlendImage(layerStrings, layerStarfield, MULTIPLY);
        image(blendedImg, 0, 0, width, height);
    } else if (mtcMillis > 109000) {
        layerStrings.update();
        layerStarfield.update();
        let blendedImg = layerStrings.getBlendImage(layerStrings, layerStarfield, MULTIPLY);
        image(blendedImg, 0, 0, width, height);
        layerPiano.draw();
    } else if (mtcMillis > 99200) {
        layerStrings.draw();
    } else if (mtcMillis > 79933) {
        layerSynth.draw();
    } else if (mtcMillis > 30000) {
        layerBass.draw();
        layerPiano.draw();
    } else if (mtcMillis < 30000 && mtcMillis > 0) {
        layerEPLine.draw();
        layerEPComp.draw();
        layerStrings.draw();
    }

    // copy the sketch and move it over based on the speed
    shake = amplitude * 10;
    if (mtcMillis < 30000) {
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
        if (mtcMillis > 9730) {
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
        if (mtcMillis > 16930) {
            strings.numStrings++;
        }
    });
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_OFF_CMD].push(function (msg) {
        strings.numStrings--;
        strings.numStrings = max(strings.numStrings, 0);
    });
}
function drawStrings(canvas) {
    if (mtcMillis < 99200) {
        canvas.clear();
    }
    strings.draw(canvas);
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
        if (mtcMillis < 60000) {
            paintdrop = new Paintdrop(random(
                poseKeypoints.getNormalizedPoints(createVector(width / 2, height / 2))
            ));
            paintdrops.push(paintdrop);
        } else if (mtcMillis < 79266) {
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

    let shiftY = 0, shiftX = 0;
    if (mtcMillis > 127400 && mtcMillis < 131000) {
        shiftY = height * (mtcMillis - 127400) / (130000 - 127400);
    }
    if (mtcMillis > 240500 && mtcMillis < 255500) {
        shiftX = width * (1 - (mtcMillis - 240500) / (255500 - 240500));
    }

    // Get pose detection output
    poseKeypoints.update();
    let points = poseKeypoints.getNormalizedPoints(createVector(width / 2 + shiftX, height / 2 + shiftY));

    if (mtcMillis < 109000) {
        // Water level rising
        canvas.fill(black);
        canvas.noStroke();
        waterLevel = map(mtcMillis, 60000, 79000, 0, height);
        // Draw water using wave
        canvas.noStroke();
        canvas.fill(black);
        canvas.beginShape();
        canvas.vertex(0, height);
        for (var i = 0; i < waterWave.length; i++) {
            var x = width * i / waterWave.length;
            var y = height - waterLevel + (50 * resizeFactor * waterWave[i]);
            canvas.vertex(x, y);
        }
        canvas.vertex(width, height);
        canvas.endShape(CLOSE);
        //canvas.rect(0, height - waterLevel, width, waterLevel);

        // Splash paintdrops on every keypress
        paintdrops.forEach(function (paintdrop) {
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
        this.centerPoint = createVector(width / 2, height / 2);
    }

    getNormalizedPoints(pos) {

        // Find min/max bounds to rescale
        let minX = this.points.reduce((prev, curr) => prev.x < curr.x ? prev : curr, 0).x;
        let maxX = this.points.reduce((prev, curr) => prev.x > curr.x ? prev : curr, width).x;
        let minY = this.points.reduce((prev, curr) => prev.y < curr.y ? prev : curr, 0).y;
        let maxY = this.points.reduce((prev, curr) => prev.y > curr.y ? prev : curr, height).y;

        let scaleFactor, centerPoint;
        if (mtcMillis < 119800) {
            scaleFactor = resizeFactor;
            centerPoint = createVector(1920 / 2, 1080 / 2);
        } else {
            // Scale to % of canvas
            scaleFactor = 0.6 * min(width / (maxX - minX), height / (maxY - minY));
            // Find center
            centerPoint = createVector(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2);
        }

        // Normalize
        let normalizedPoints = this.points.map(point => p5.Vector.sub(point, centerPoint).mult(scaleFactor).add(pos));
        return normalizedPoints;
    }

    update() {
        // Get current playback time
        let frameIndex = int(30 * mtcMillis / 1000); // Video was recorded in 30 FPS
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
                // this.centerPoint = createVector(body[3], body[4]); // Take the neck base as the center

                // Pick which keypoints we want to display, and in what order
                // https://github.com/CMU-Perceptual-Computing-Lab/openpose/blob/master/doc/output.md

                // Right Hand
                [0, 1, 2, 3, 4, 3, 2, 1, 0, 5, 6, 7, 8, 7, 6, 5, 0, 9, 10, 11, 12, 11, 10, 9, 0, 13, 14, 15, 16, 15, 14, 13, 0, 17, 18, 19, 20, 19, 18, 17, 0].forEach(function (pose_idx) {
                    let x = rightHand[pose_idx * 3];
                    let y = rightHand[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // if (mtcMillis < 149266) {
                // Right arm
                [4, 3, 2, 1].forEach(function (pose_idx) {
                    let x = body[pose_idx * 3];
                    let y = body[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Head
                [8, 1, 17, 15, 0, 16, 18, 1, 8].forEach(function (pose_idx) {
                    let x = body[pose_idx * 3];
                    let y = body[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Left arm
                [1, 5, 6, 7].forEach(function (pose_idx) {
                    let x = body[pose_idx * 3];
                    let y = body[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
                // Left Hand
                [0, 1, 2, 3, 4, 3, 2, 1, 0, 5, 6, 7, 8, 7, 6, 5, 0, 9, 10, 11, 12, 11, 10, 9, 0, 13, 14, 15, 16, 15, 14, 13, 0, 17, 18, 19, 20, 19, 18, 17, 0].forEach(function (pose_idx) {
                    let x = leftHand[pose_idx * 3];
                    let y = leftHand[pose_idx * 3 + 1];
                    if (x != 0 && y != 0) {
                        poseKeypoints.points.push(createVector(x, y));
                    }
                });
            }
        }.bind(this));
    }
}

// BASS LAYER
let dots = [];
let newBass = false;
function setupBass(canvas) {
    canvas.stroke(255);
    canvas.fill(255);
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
let synthCountX = 1;
let synthCountY = 1;
function setupSynth(canvas) {
    neon = new Neon();
    // React to MIDI message
    midiInput.callbacks[CHANNELS.SYNTH][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (mtcMillis < 84233) {
            synthCountX = 1;
            synthCountY = 1;
        } else if (mtcMillis < 89000) {
            synthCountX = 2;
            synthCountY = 2;
        } else {
            synthCountX = 3;
            synthCountY = 2;
        }
        neon.addRandomPoint();
    });
}
function drawSynth(canvas) {
    canvas.background(32, 100);
    for (let i = 0; i < synthCountX; i++) {
        for (let j = 0; j < synthCountY; j++) {
            canvas.push();
            let denomX = synthCountX + 1;
            let denomY = synthCountY + 1;
            canvas.translate(width / denomX + i * width / denomX, height / denomY + j * height / denomY);
            neon.draw(canvas);
            canvas.pop();
        }
    }
    let speed = 4;
    canvas.image(canvas, -speed / 2, -speed / 2, width + speed, height + speed);
}


// STARFIELD LAYER
let starfield;
let sky;
let wormholes = [];
let numWorms = 5;
function setupStarfield(canvas) {
    starfield = new Starfield();
    // React to MIDI message
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        starfield.life++;
    });
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_OFF_CMD].push(function (msg) {
        starfield.life = max(starfield.life - 1, 0);
    });

    sky = new Sky();
    // React to MIDI message
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (mtcMillis > 109866) {
            sky.numBars++;
        }
    });
    midiInput.callbacks[CHANNELS.STRINGS][MIDI_Message.NOTE_OFF_CMD].push(function (msg) {
        strings.numBars--;
        strings.numBars = max(strings.numBars, 0);
    });

    for (let i = 0; i < 100; i++) {
        wormholes.push(new Wormhole());
    }
    // React to MIDI message
    midiInput.callbacks[CHANNELS.SYNTH][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        wormholes.map(wh => wh.changeDirection());
    });
}
function drawStarfield(canvas) {
    if (mtcMillis > 129866) {
        canvas.background(0);

        numWorms = 8 * int(1 + (mtcMillis - 129866) / 5000);
        wormholes.slice(0, numWorms).map(wh => wh.draw(canvas));

        if (mtcMillis > 149800 && mtcMillis < 169933) {
            canvas.translate(width / 2, height / 2);
            if (int(1 + (mtcMillis - 129866) / 5000) % 2) {
                canvas.rotate(0.02);
            } else {
                canvas.rotate(-0.02);
            }
            canvas.translate(-width / 2, -height / 2);
        }
        // let speed = 10;
        // canvas.image(canvas, -speed / 2, -speed / 2, width + speed, height + speed);
    } else {
        sky.draw(canvas);
        starfield.draw(canvas);
    }
}

class Ring {
    constructor(pos, radius) {
        this.pos = pos;
        this.radius = radius;
        this.thickness = 2 * resizeFactor;
    }

    draw(cnv) {
        cnv.noFill();
        let alpha = 255 - 255 * (mtcMillis - 168000) / (169933 - 168000);
        cnv.stroke(alpha);
        cnv.strokeWeight(this.thickness);
        cnv.ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    }
}
class Wormhole {
    constructor() {
        this.ringRadius = 10 * resizeFactor;
        this.rings = [];
        this.maxNumRings = 10;
        this.pos = createVector(width / 2, height / 2);
        this.vel = random([
            createVector(this.ringRadius, -this.ringRadius),
            createVector(-this.ringRadius, -this.ringRadius),
            createVector(-this.ringRadius, this.ringRadius),
            createVector(this.ringRadius, this.ringRadius)
        ]);
    }

    changeDirection() {
        // console.log((mtcBarNumber - 52));
        // console.log(int((mtcBarNumber - 52) / 2) % 2);
        // if (int((mtcBeatNumber - 52*4 - 1) / 8) % 2) {
        if (int(1 + (mtcMillis - 129866) / 5000) % 2) {

            if (Math.sign(this.vel.x) == Math.sign(this.vel.y)) {
                this.vel = random([
                    createVector(this.ringRadius, -this.ringRadius),
                    createVector(-this.ringRadius, this.ringRadius)
                ]);
            } else {
                this.vel = random([
                    createVector(this.ringRadius, this.ringRadius),
                    createVector(-this.ringRadius, -this.ringRadius)
                ]);
            }
        } else {
            if (this.vel.x == 0) {
                this.vel = random([
                    createVector(this.ringRadius, 0),
                    createVector(-this.ringRadius, 0)
                ]);
            } else {
                this.vel = random([
                    createVector(0, this.ringRadius),
                    createVector(0, -this.ringRadius)
                ]);
            }
        }
    }

    newRing() {
        let r = new Ring(createVector(this.pos.x, this.pos.y), this.ringRadius);
        this.rings.push(r);
        if (this.rings.length > this.maxNumRings) {
            this.rings.shift();
        }
    }

    draw(cnv) {
        this.rings.forEach(function (ring) {
            ring.draw(cnv);
        })
        this.newRing();

        this.pos.add(this.vel);
        if (mtcMillis < 149800) {
            if (this.pos.x < 0 || this.pos.x > width) {
                this.vel.x *= -1;
            }
            if (this.pos.y < 0 || this.pos.y > height) {
                this.vel.y *= -1;
            }
        }
    }
}

// STROBE LAYER
let strobeAlpha = 255;
function setupStrobe(canvas) {
    // React to MIDI message
    midiInput.callbacks[CHANNELS.EPCOMP][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (abs(mtcMillis - lastStrobe) > 100) { // Ignore messages that are too nearby
            strobeAlpha = 255;
        }
        lastStrobe = mtcMillis;
    });
}
function drawStrobe(canvas) {
    strobeAlpha -= 10;
    canvas.clear();
    if (mtcMillis < 189800) {
        canvas.background(0, strobeAlpha);
    }
}

// BRIDGE LAYER
function setupBridge(canvas) {
    canvas.textFont(fonts[0]);
    canvas.textSize(200 * resizeFactor);
    canvas.background(black);
    canvas.fill(white);
    canvas.textAlign(CENTER);
    canvas.text("ONE", width / 2, height * 2 / 5);
    canvas.text("LAST", width / 2, height * 3 / 5);
    canvas.text("TIME", width / 2, height * 4 / 5);

    // React to MIDI message
    midiInput.callbacks[CHANNELS.SYNTH][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        if (mtcMillis > 219700) {
            canvas.textFont(random(fonts));
            canvas.textSize(random(180, 220) * resizeFactor);
        }
    });
}
function drawBridge(canvas) {
    canvas.background(black);
    canvas.text("ONE", width / 2, height * 2 / 5);
    canvas.text("LAST", width / 2, height * 3 / 5);
    canvas.text("TIME", width / 2, height * 4 / 5);
}

// PIXELGRID LAYER
let resolutionX = 100;
let resolutionY = 50;
let particles = [];
let lastStrobe = 0;
function setupPixelGrid(canvas) {
    canvas.noStroke();
}
function drawPixelGrid(canvas) {
    let w = width / resolutionX;
    let h = height / resolutionY;

    // Fire
    if (mtcMillis < 199800) {
        // Paint background
        canvas.background(0);
        // console.log("I am clearing though");
        // canvas.image(backgroundImg, 0, 0);

        // Draw fire
        let timeRatio = (mtcMillis - 170000) / (200000 - 170000);
        let maxHeight = 3 * height * timeRatio;
        if (mtcMillis < 202000) {
            for (let i = 0; i < 5 + timeRatio*10; i++) {
                let p = new FireParticle(maxHeight);

                if (mtcMillis > 189866) {
                    if (random(100) > 98) {
                        p.x = random(width);
                        p.y = random(height);
                    }
                }
                particles.push(p);
            }
        }
        for (let n = particles.length - 1; n >= 0; n--) {
            particles[n].update();
            // Convert to grid coordinates
            let i = int(particles[n].x / w);
            let j = int(particles[n].y / h);
            let x = i * w;
            let y = j * h;
            // Draw pixel
            // Increase probability of redness if close to edges
            let distFromCenter = abs(particles[n].x - width/2);
            let distFromBottom = height - particles[n].bottomPadding - particles[n].y;
            if (
                random(particles[n].maxWidth) < distFromCenter || 
                random(particles[n].maxHeight / 2) < distFromBottom
            ) {
                canvas.fill(red);
            } else {
                canvas.fill(yellow);
            }
            if (mtcMillis > 189866) {
                if (random(100) > 95) {
                    canvas.fill(random(colorPalette));
                }
            }
            canvas.rect(x, y, w, h);
            // Draw multiple
            while (random(10) > 3) {
                let i_ = i + int(random(-2, 2));
                let j_ = j + int(random(-2, 2));
                canvas.rect(i_ * w, j_ * h, w, h);
            }
            // Grow fire height
            particles[n].maxHeight = maxHeight;
            
            // End of life
            if (particles[n].finished()) {
                particles.splice(n, 1);
            }
        }
    } else {

        // canvas.background(0);
        // Draw background
        let timeRatio = (mtcMillis - 199800) / (213000 - 199800);
        let expansion = timeRatio * width/2;
        for (let n = 0; n < 100; n++) {
            let angle = random(360);
            let x = width/2 + expansion * cos(angle);
            let y = height/2 + expansion * sin(angle);
            let i = int(x / w);
            let j = int(y / h);
            x = i * w;
            y = j * h;
            canvas.fill(random([black, 50]));
            canvas.rect(x, y, w, h);
        }

        for (let n = 0; n < 30; n++) {
            let i = int(random(resolutionX / 4, 3 * resolutionX / 4));
            let j = int(random(0, resolutionY));

            // Draw on the text
            let x = i * w;
            let y = j * h;
            canvas.fill(random(colorPalette));
            let px = layerBridge.canvas.get(x, y);
            if (px[0] == 255) {
                canvas.fill(random([red, red, yellow]));
                canvas.rect(x, y, w, h);
            }
        }
    }
}
class FireParticle {
    constructor(maxHeight) {
        this.maxHeight = maxHeight;
        this.maxWidth = maxHeight * 100 / height;
        this.bottomPadding = 50 * resizeFactor;
        this.x = randomGaussian(width/2, this.maxWidth/2);
        this.y = height - this.bottomPadding - (abs(this.x - width/2) ** 1.1) / 5; // Curve up as we get further from the center
        this.vx = random(-1, 1) * resizeFactor;
        this.vy = random(-5, -1) * resizeFactor;
        this.alpha = 255;
    }

    finished() {
        return random(this.alpha) < 5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha = 255 - 255 * (height - this.y) / this.maxHeight;
    }
}


// FINALE LAYER
let neonResolutionX = 4;
let neonResolutionY = 2;
let neonW, neonH;
let neonImg;
let neonPoly;
let activatedIdxs = [];
let paintballParty;
function setupFinale(canvas) {
    canvas.background(black);
    canvas.noStroke();

    paintballParty = new PaintballParty();
    for (let i = 0; i < 100; i++) {
        paintballParty.newBall();
    }
    
    neonW = width / neonResolutionX;
    neonH = height / neonResolutionY;

    // neonPoly = new NeonPoly();
    
    neonImg = createGraphics(neonW, neonH);

    // React to MIDI message
    midiInput.callbacks[CHANNELS.SYNTH][MIDI_Message.NOTE_ON_CMD].push(function (msg) {
        // let polyNumber = 6 - int((mtcMillis - 219500) / 5000);
        // neonPoly.setPolyNumber(polyNumber, neonImg);
        // neonPoly.addVertex(neonImg);

        // activatedIdxs.shift();
        // activatedIdxs.push(int(random(neonResolutionX * neonResolutionY)));
        // while (activatedIdxs.length < polyNumber) {
        //     activatedIdxs.push(int(random(neonResolutionX * neonResolutionY)));
        // }
    });
}
function drawFinale(canvas) {
    paintballParty.draw(canvas);

    if (mtcMillis > 239000) {

        if (mtcMillis < 243500) {
            paintballParty.bgImg.fill(black);
            paintballParty.bgImg.textSize(200 * resizeFactor);
            paintballParty.bgImg.textFont(fonts[0]);
            paintballParty.bgImg.textAlign(CENTER);
            paintballParty.bgImg.text("ONE", width / 2, height * 2 / 5);
            paintballParty.bgImg.text("LAST", width / 2, height * 3 / 5);
            paintballParty.bgImg.text("TIME", width / 2, height * 4 / 5);    
        }

        paintballParty.balls.forEach(ball => ball.explode(paintballParty.bgImg));
        if (mtcMillis > 240500) {
            if (paintballParty.balls.length) {
                paintballParty.balls.shift();
            }
        }
    }
    // if (mtcMillis > 240500) {
    //     if (mtcMillis < 243500) {
    //         paintballParty.bgImg.fill(black);
    //         paintballParty.bgImg.textSize(200 * resizeFactor);
    //         paintballParty.bgImg.textFont(fonts[0]);
    //         paintballParty.bgImg.textAlign(CENTER);
    //         paintballParty.bgImg.text("ONE", width / 2, height * 2 / 5);
    //         paintballParty.bgImg.text("LAST", width / 2, height * 3 / 5);
    //         paintballParty.bgImg.text("TIME", width / 2, height * 4 / 5);
    //     }
    //     paintballParty.balls.forEach(ball => ball.explode(paintballParty.bgImg));
    //     if (paintballParty.balls.length) {
    //         paintballParty.balls.shift();
    //     }
    // } if (mtcMillis > 239000) {
    //     paintballParty.balls.forEach(ball => ball.explode(paintballParty.bgImg));
    // }

    // // Update the neon image
    // neonPoly.update(neonImg);
    // neonImg.clear();

    // // Get pose detection output
    // poseKeypoints.update();
    // let points = poseKeypoints.getNormalizedPoints(createVector(neonImg.width / 2, neonImg.height / 2));
    // let scaleFactor = neonImg.height / height;
    // points = points.map(function(point) {
    //     point.x = neonImg.width / 2 + point.x * scaleFactor;
    //     point.y = neonImg.height / 2 + point.y * scaleFactor;
    //     return point;
    // });

    // // Draw musician based on pose detection output
    // painter.clear();
    // points.forEach(point => painter.addPoint(createVector(point.x, point.y)));
    // painter.draw(neonImg);

    // // Copy the graphics to each cell
    // for (let i = 0; i < neonResolutionX; i++) {
    //     for (let j = 0; j < neonResolutionY; j++) {
    //         let x = i * neonW;
    //         let y = j * neonH;
    //         canvas.image(neonImg, x, y);
    //     }
    // }
}

class Paintball {
    constructor(pos, vel) {
        this.pos = pos;
        this.vel = vel;
        this.color = random(colorPalette);
        this.rad = random(10, 30) * resizeFactor;
        this.explosionRadius = 100 * resizeFactor;
        this.explosionScatter = 10;
    }
    draw(cnv) {
        cnv.noStroke();
        cnv.fill(this.color);

        cnv.ellipse(this.pos.x, this.pos.y, this.rad, this.rad);
        // cnv.beginShape();
        // cnv.vertex(this.pos.x + random(-this.rad, this.rad), this.pos.y);
        // cnv.vertex(this.pos.x, this.pos.y + random(-this.rad, this.rad));
        // cnv.vertex(this.pos.x + random(-this.rad, this.rad), this.pos.y + random(-this.rad, this.rad));
        // cnv.endShape();

        this.pos.add(this.vel);
        if (this.pos.x < 0 || this.pos.x > width) {
            this.vel.x *= -1;
        }
        if (this.pos.y < 0 || this.pos.y > height) {
            this.vel.y *= -1;
        }
    }
    explode(cnv) {
        cnv.fill(this.color);
        cnv.push();
        cnv.translate(this.pos);
        cnv.rotate(atan2(this.vel.y, this.vel.x));
        for (let i=0; i<this.explosionScatter; i++) {
            let side = randomGaussian(0, this.explosionRadius / 2);
            let forward = randomGaussian(0, this.explosionRadius);
            cnv.ellipse(side, forward, random(this.rad/2), random(this.rad/2) * 2);   
        }
        cnv.pop();
    }
}
class PaintballParty { 
    constructor() {
        this.balls = [];
        this.maxBalls = 100;
        this.bgImg = createGraphics(width, height);
        this.bgImg.background(black);
        this.bgImg.noStroke();
        this.spray = 100 * resizeFactor;
    }
    newBall() {
        let pos = createVector(random(width), random(height));
        // let vec = createVector(
        //     width/2 + random(-this.spray, this.spray), 
        //     height/2 + random(this.spray/2, this.spray)
        //     ).sub(pos).normalize().mult(20);
        let vec = createVector(random(-width, width), random(-height, height)).normalize().mult(20);
        this.balls.push(new Paintball(pos, vec));

        if (this.balls.length > this.maxBalls) {
            // this.balls[0].explode(this.background);
            this.balls.shift();
        }
    }
    draw(cnv) {
        cnv.image(this.bgImg, 0, 0);

        if (mtcMillis < 239500) {
            for (let i = 0; i < this.balls.length; i++) {
                this.balls[i].draw(cnv);
    
                // Linking to closest neighbors
                let numNeighbors = 3;
    
                let c = color(this.balls[i].color);
                c.setAlpha(100);
                cnv.fill(c);
    
                cnv.beginShape();
                cnv.vertex(this.balls[i].pos.x, this.balls[i].pos.y);
                for (let j = i; j < this.balls.length; j++) {
                    let sqDist = (this.balls[i].pos.x - this.balls[j].pos.x)**2 + (this.balls[i].pos.y - this.balls[j].pos.y)**2;
                    if (sqDist < 30000) {
                        cnv.vertex(this.balls[j].pos.x, this.balls[j].pos.y);
                        numNeighbors--;
                    }
                    if (numNeighbors <= 0) {
                        break;
                    }
                }
                cnv.endShape();
            }    
        }
    }
}

// class NeonPoly {
//     constructor() {
//         this.vertices = [];
//         this.thickness = 2 * resizeFactor;
//         this.jitter = 2 * resizeFactor;
//         this.polyNumber = 3;
//         this.color = color(colorPalette[this.polyNumber % colorPalette.length]);
//     }
//     setPolyNumber(polyNumber, cnv) {
//         if (this.polyNumber != polyNumber) {
//             this.polyNumber = polyNumber;

//             // Restart if we are changing to a different polygon type
//             this.vertices = [];
//             this.addVertex(cnv);
//             this.addVertex(cnv);
//             this.addVertex(cnv);

//             this.color = color(colorPalette[this.polyNumber % colorPalette.length]);
//         }
//     }
//     addVertex(cnv) {
//         if (this.vertices.length > 20) {
//             this.vertices = [];
//         }
//         this.vertices.push(this.generateNewPolyVertex(cnv, this.polyNumber));
//     }
//     generateNewPolyVertex(cnv, numSides) {
//         let vertexCount = this.vertices.length + 1;

//         let distFromCenter = cnv.width/2 * (0.7 ** int((vertexCount - 1) / numSides));
//         let angle = (180 / numSides) + (360 / numSides) * (vertexCount % numSides);
        
//         let x = distFromCenter * cos(angle);
//         let y = distFromCenter * sin(angle);
//         return createVector(x, y);
//     }
//     update(cnv) {
//         cnv.background(black);
//         cnv.noFill();

//         cnv.push();
//         cnv.strokeWeight(this.thickness*2);
//         cnv.translate(cnv.width/2, cnv.height/2);
//         cnv.rotate(frameCount / 10);
        
//         // cnv.noStroke();
//         // let c = color(random(colorPalette));
//         // c.setAlpha(80);
//         // cnv.fill(c);
//         // cnv.beginShape(TRIANGLE_STRIP);
//         // this.vertices.forEach(function(vec) {
//         //     cnv.vertex(vec.x + random(-this.jitter, this.jitter), vec.y + random(-this.jitter, this.jitter));
//         // }.bind(this));
//         // cnv.endShape();

//         cnv.stroke(blue);
//         cnv.strokeWeight(this.thickness * 2);
//         cnv.beginShape();
//         this.vertices.forEach(function(vec) {
//             cnv.vertex(vec.x + random(-this.jitter, this.jitter), vec.y + random(-this.jitter, this.jitter));
//         }.bind(this));
//         cnv.endShape();

//         cnv.noFill();
//         cnv.strokeWeight(this.thickness);
//         cnv.stroke(white);
//         cnv.beginShape();
//         this.vertices.forEach(function(vec) {
//             cnv.vertex(vec.x + random(-this.jitter, this.jitter), vec.y + random(-this.jitter, this.jitter));
//         }.bind(this));
//         cnv.endShape();

//         cnv.pop();
//     }
// }


// INSTRUMENTS

class EPComp {
    constructor() {
        this.minHeight = height - height / 4;
        this.height = this.minHeight;
        this.thickness = 5 * resizeFactor;
        this.wave = new Array(1024).fill(0);
        this.waveAmplitude = 100 * resizeFactor;
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
            var y = this.height - this.waveAmplitude - this.wave[i] * this.waveAmplitude;
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
            var y = this.height - this.waveAmplitude - this.wave[i] * this.waveAmplitude;
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
        this.height -= (30 * resizeFactor);
        this.height = max(height / 4, this.height);
    }

    fall() {
        // Height dropping
        this.height += 20 * resizeFactor; // Falling
        this.height = min(this.height, this.minHeight); // Floor
    }
}

class Strings {
    constructor() {
        this.thickness = 5 * resizeFactor;
        this.numStrings = 0;
        this.pos = createVector(width / 2, height / 2);
        this.vel = createVector(100 * resizeFactor, 100 * resizeFactor);
        this.jitter = 500 * resizeFactor;
    }
    draw(cnv) {
        cnv.push();
        cnv.stroke(white);
        for (var i = 0; i < this.numStrings; i++) {

            // Part one - waterfall lines
            if (mtcMillis < 99200) {
                let xOffset = width / 4;
                let xWidth = width / 2;
                let y = height * 2 / 3;
                let x = random(xOffset, xOffset + xWidth);
                cnv.stroke(random(colorPalette));
                cnv.strokeWeight(random(2, 5) * resizeFactor);
                cnv.line(x, y, x, 0);
                cnv.line(x, y, width * (x - xOffset) / xWidth, height);

                // Part two - campfire kindling
            } else if (mtcMillis < 103200) {
                cnv.stroke(random(colorPalette));
                cnv.strokeWeight(random(2, 5) * resizeFactor);
                cnv.line(
                    this.pos.x + random(-this.jitter, this.jitter),
                    this.pos.y + random(-this.jitter, this.jitter),
                    this.pos.x + random(-this.jitter, this.jitter),
                    this.pos.y + random(-this.jitter, this.jitter));

                // Part three - colored polygons
            } else { //if (mtcMillis < 109866) {
                cnv.noStroke();
                let c = color(random(colorPalette));
                c.setAlpha(100);
                cnv.fill(c);
                cnv.beginShape(TRIANGLE_STRIP);
                cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
                cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
                cnv.vertex(this.pos.x + random(-this.jitter, this.jitter), this.pos.y + random(-this.jitter, this.jitter));
                cnv.endShape();
            }
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
        this.thickness = 5 * resizeFactor;
    }

    draw(cnv) {
        let xpos = this.noteXPositions[this.note];
        if (xpos) {
            cnv.stroke(white);
            cnv.strokeWeight(this.thickness);

            cnv.noFill();
            if (mtcMillis > 10266) {
                cnv.fill(this.color);
                cnv.noStroke();
            }
            if (mtcMillis < 20000) {
                cnv.rect(xpos, height / 4, width / 12, height / 2);
            } else {
                cnv.rect(xpos, 0, width / 12, height);
            }
        }
    }
}

class Painter {
    constructor() {
        this.memory = [createVector(width / 2, height / 2)];
        this.brushWidth = 5 * resizeFactor;
    }

    addPoint(vec) {
        this.memory.push(vec);
    }

    clear() {
        this.memory = [];
    }

    draw(cnv) {
        if (mtcMillis > 219600) {
            cnv.stroke(white);
            cnv.strokeWeight(10);
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

        } else if (mtcMillis > 109000) {
            cnv.stroke(random(colorPalette));
            cnv.strokeWeight(5 * resizeFactor);
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
            
        } else if (mtcMillis < 109000) {
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

        }

    }
}
class Paintdrop {
    constructor(originPoint) {
        this.brushWidth = 5 * resizeFactor;
        this.vel = createVector(random(-5, 5), random(-10, 0));
        this.pos = p5.Vector.add(originPoint, createVector(random(-20, 20), random(-10, 0)));
        this.acc = createVector(0, 0.5);
        this.radius = 8 * resizeFactor;
        this.jitter = 2 * resizeFactor;
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
        this.size = 10 * resizeFactor;
        this.thickness = 1 * resizeFactor;
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
        this.radius = 100 * resizeFactor;
        this.pos = createVector(0, 0);
        this.velocity = createVector(20, 10);
        this.age = 1;
        this.aging = false;
        this.curveTightness = 1;
        this.jitter = 3 * resizeFactor;
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
        cnv.strokeWeight(2 * resizeFactor);
        cnv.beginShape();
        for (let i = 0; i < this.memory.length; i++) {
            cnv.curveVertex(this.memory[i].x + random(-this.jitter, this.jitter), this.memory[i].y + random(-this.jitter, this.jitter));
        }
        cnv.endShape();
        cnv.pop();

        cnv.push();
        cnv.stroke(0, 0, 255, alpha);
        cnv.strokeWeight(2 * resizeFactor);
        cnv.beginShape();
        for (let i = 0; i < this.memory.length; i++) {
            cnv.curveVertex(this.memory[i].x + random(-this.jitter, this.jitter), this.memory[i].y + random(-this.jitter, this.jitter));
        }
        cnv.endShape();
        cnv.pop();

        cnv.push();
        cnv.stroke(255, alpha);
        cnv.strokeWeight(3 * resizeFactor);
        cnv.beginShape();
        for (let i = 0; i < this.memory.length; i++) {
            cnv.curveVertex(this.memory[i].x + random(-2, 2), this.memory[i].y + random(-2, 2));
        }
        cnv.endShape();
        cnv.pop();
    }
}

class Sky {
    constructor() {
        this.thickness = 5 * resizeFactor;
        this.numBars = 0;
    }
    draw(cnv) {
        let horizonHeight = 0.3 * height;
        if (mtcMillis < 130000) {
            for (var i = 0; i < this.numBars; i++) {
                cnv.stroke(0);
                cnv.strokeWeight(20 * resizeFactor);
                for (let i = 0; i < 5; i++) {
                    let x = random(width);
                    let y = height - horizonHeight * sin(180 * x / width);
                    cnv.line(x, 0, x, y);
                }
            }
        }

        if (mtcMillis > 127400 && mtcMillis < 130000) {
            let shift = horizonHeight * (mtcMillis - 127400) / (130000 - 127400);
            let copyHeight = int(horizonHeight * 2);
            cnv.copy(cnv, 0, height - copyHeight, width, copyHeight, 0, height - copyHeight + shift, width, copyHeight);
        }
    };
}

class Starfield {
    constructor() {
        this.memory = [];
        this.maxLength = 50;
        this.edges = [];
        this.maxEdges = 10;
        // Stars
        this.jitter = 1;
        this.radius = 5 * resizeFactor;
        this.life = false;
    }

    addRandomPoint() {
        let x = random(width);
        let y = random(height);
        this.addPoint(x, y);
    }

    addPoint(x, y) {
        this.memory.push(createVector(x, y));
        if (this.memory.length > this.maxLength) {
            this.memory.shift();
        }
    }

    draw(cnv) {
        for (let i = 0; i < this.memory.length; i++) {
            cnv.fill(white);
            cnv.noStroke();
            cnv.ellipse(
                this.memory[i].x + random(-this.jitter, this.jitter),
                this.memory[i].y + random(-this.jitter, this.jitter),
                5, 5);

            if (mtcMillis > 119800) {
                let awayFromCenterVec = p5.Vector.sub(this.memory[i], createVector(width / 2, height / 2)).div(50);
                this.memory[i].add(awayFromCenterVec);
            }
        }

        if (this.life) {
            for (let i = 0; i < 3; i++) {
                this.addRandomPoint();
            }
        }
    }
}