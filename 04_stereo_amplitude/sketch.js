var soundFile;
var fft;
var fftBands = 512;
var amplitude;
var mic;

var description = 'loading';
var p;
let playing = true;
let pauseButton;
let maxLength;

// This will be an array of amplitude values from lowest to highest frequencies
var frequencySpectrum = [];

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('resources/track.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  maxLength = min(width, height) * 3 / 4;

  colorMode(HSB, 360, 360, 360);
  angleMode(DEGREES);

  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  mic = new p5.AudioIn();

  pauseButton = createButton('Play');
  pauseButton.position(20, 20);
  pauseButton.mousePressed(togglePlayPause);
  pauseButton.size(100, AUTO);

  // set the master volume;
  masterVolume(.5);
}

function draw() {
  background(0, 0, 30);

  var levelLeft = mic.amplitude.getLevel(0);
  var sizeLeft = map(levelLeft, 0, 1, 0, height);
  ellipse(width/4, height/2, sizeLeft, sizeLeft);

  var levelRight = mic.amplitude.getLevel(1);
  var sizeRight = map(levelRight, 0, 1, 0, height);
  ellipse(width*3/4, height/2, sizeRight, sizeRight);

  var panning = map(mouseX, 0, width, -1, 1);
  soundFile.pan(panning);

  // // Draw every value in the frequencySpectrum array
  // for (var i = 10; i < fftBands; i++){
  //   var theta = map(i, 10, fftBands, 0, 720);
  //   let length = map(frequencySpectrum[i], 0, 255, 0, maxLength);

  //   var x = length * cos(theta);
  //   var y = length * sin(theta);

  //   //let hue = 100 + map(i, 0, fftBands, 180);
  //   stroke(theta % 360, 255, 255);
  //   if (i % 2 == 0) {
  //     stroke(theta % 360, 255, 155);
  //   }
  //   strokeWeight(6 - 5 * i / fftBands);
  //   line(width/2, height/2, width/2 - x, height/2 - y);
  //   line(width/2, height/2, width/2 + x, height/2 - y) ;
  // }
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
