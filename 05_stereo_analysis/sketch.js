// var soundFile;
var splitter;
var fft;
var fftBands = 512;
var amp, ampLeft, ampRight;
var mic;

var p;
let playing = true;
let pauseButton;
let maxLength;

// This will be an array of amplitude values from lowest to highest frequencies
var frequencySpectrum = [];

function preload() {
    soundFormats('mp3', 'ogg');
    soundFile = loadSound('resources/track_right.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    maxLength = min(width, height) / 2;
    textAlign(CENTER, CENTER);
    textSize(40);

    colorMode(HSB, 360, 360, 360);
    angleMode(DEGREES);

    pauseButton = createButton('Play');
    pauseButton.position(20, 20);
    pauseButton.mousePressed(togglePlayPause);
    pauseButton.size(100, AUTO);

    // Audio

    mic = new p5.AudioIn();
    mic.start();

    fftLeft = new p5.FFT();
    fftRight = new p5.FFT();
    amp = new p5.Amplitude();
    ampLeft = new p5.Amplitude();
    ampRight = new p5.Amplitude();

    // Split into left and right channels
    splitter = getAudioContext().createChannelSplitter();
    soundFile.connect(splitter);
    // mic.output.connect(splitter);

    splitter.connect(fftLeft.input, 0, 0);
    splitter.connect(fftRight.input, 1, 0);

    amp.setInput(soundFile);
    splitter.connect(ampLeft, 0);
    splitter.connect(ampRight, 1);
}


function draw() {
    background(0, 0, 30);
    fill(100, 0.2);
    
    // var panning = map(mouseX, 0, width, -1, 1);
    // soundFile.pan(panning);

    // FFT

    leftBands = fftLeft.analyze();
    leftWave = fftLeft.waveform();
    visualizeFFTBands(width / 4, height / 4, leftBands);

    rightBands = fftRight.analyze();
    rightWave = fftRight.waveform();
    visualizeFFTBands(width * 3 / 4, height / 4, rightBands);

    // Amplitude

    var levelLeft = amp.getLevel(0);
    var sizeLeft = map(levelLeft, 0, 1, 0, height);
    ellipse(width / 4, height * 3 / 4, sizeLeft, sizeLeft);
    
    var levelRight = amp.getLevel(1);
    var sizeRight = map(levelRight, 0, 1, 0, height);
    ellipse(width * 3 / 4, height * 3 / 4, sizeRight, sizeRight);

    var levelLeftSplitter = ampLeft.getLevel();
    var sizeLeftSplitter = map(levelLeftSplitter, 0, 1, 0, height);
    ellipse(width / 4, height / 4, sizeLeftSplitter, sizeLeftSplitter);
    
    var levelRightSplitter = ampRight.getLevel();
    var sizeRightSplitter = map(levelRightSplitter, 0, 1, 0, height);
    ellipse(width * 3 / 4, height / 4, sizeRightSplitter, sizeRightSplitter);
    
    fill(255);
    text("Amp Left", width / 4, height * 3 / 4);
    text("Amp Right", width * 3 / 4, height * 3 / 4);
    text("Splitter Left", width / 4, height / 4);
    text("Splitter Right", width * 3 / 4, height / 4);
}

function visualizeFFTBands(xpos, ypos, bands) {
    for (var i = 10; i < bands.length; i += 5) {
        var theta = map(i, 10, bands.length, 0, 720);
        let length = map(bands[i], 0, 255, 0, maxLength);

        var x = length * cos(theta);
        var y = length * sin(theta);

        // let hue = 100 + map(i, 0, fftBands, 180);
        stroke(theta % 360, 255, 255);
        if (i % 2 == 0) {
            stroke(theta % 360, 255, 155);
        }
        strokeWeight(3 - 2 * i / bands.length);
        line(xpos, ypos, xpos - x, ypos - y);
        line(xpos, ypos, xpos + x, ypos - y);
    }
}

function visualizeWaveform(minX, maxX, waveform) {
    noFill();
    // Draw snapshot of the waveform
    beginShape();
    for (var i = 0; i < waveform.length; i++) {
        stroke(205);
        strokeWeight(2);
        vertex(minX + (maxX - minX) * i / waveform.length, map(waveform[i], -1, 1, height, 0));
    }
    endShape();
}

function togglePlayPause() {
    if (soundFile.isPlaying()) {
        soundFile.pause();
        pauseButton.html('Play');
    } else {
        soundFile.play();
        pauseButton.html('Pause');
    }
}
