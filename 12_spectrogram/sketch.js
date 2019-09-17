/**
 *  A spectrograph plots the FFT of the frequency spectrum over time.
 *
 *  Lowest frequencies are at the bottom, highest at the top.
 *  Time starts at the right and moves left at a variable speed.
 *
 *  Colors represent amplitude at that part of the frequency spectrum.
 *
 *  Press L to toggle scaling between logarithmic (default) and linear.
 *
 *  Press T to toggle source.
 */

var mic, osc, soundFile;

var fft;
var binCount = 1024;
var bins = new Array(binCount);

var speed = 10;

// canvas is global so we can copy it
var cnv;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  colorMode(HSB);

  mic = new p5.AudioIn();
  mic.start();

  var smoothing = 0.6;
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(mic);
}

function draw() {

  var spectrum = fft.analyze();
  console.log(spectrum);

  // copy the sketch and move it over based on the speed
  copy(cnv, 0, 0, width, height, -speed, 0, width, height);

  // iterate thru current freq spectrum
  for (var i = 0; i < spectrum.length; i++) {
    var value;
    if (logView) {
      logIndex = logScale(i, spectrum.length);
      value = spectrum[logIndex];
    } else {
      value = spectrum[i];
    }
    var c = value;
    fill(c, 255, c);
    var percent = i / spectrum.length;
    var y = percent * height;
    rect(width - speed, height - y, speed, height / spectrum.length);
  }

}


// ==============================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

// in p5, keyPressed is not case sensitive, but keyTyped is
function keyPressed() {
  if (key == 'L') {
    toggleScale();
  }
}

var logView = true;
function toggleScale() {
  logView = !logView;
}


// helper functions via
// https://github.com/borismus/spectrograph/blob/master/g-spectrograph.js
// MIT license

/**
 * Given an index and the total number of entries, return the
 * log-scaled value.
 */
function logScale(index, total, opt_base) {
  var base = opt_base || 2;
  var logmax = logBase(total + 1, base);
  var exp = logmax * index / total;
  return Math.round(Math.pow(base, exp) - 1);
}

function logBase(val, base) {
  return Math.log(val) / Math.log(base);
}
