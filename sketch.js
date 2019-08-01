var soundFile;
var fft;
var fftBands = 512;

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
  createCanvas(windowWidth, windowHeight, WEBGL);
  maxLength = min(width, height) * 3 / 4;

  colorMode(HSB, 360, 360, 360);
  angleMode(DEGREES);

  fft = new p5.FFT();

  pauseButton = createButton('Play');
  pauseButton.position(20, 20);
  pauseButton.mousePressed(togglePlayPause);
  pauseButton.size(100, AUTO);

  // set the master volume;
  masterVolume(.5);
}

function draw() {
  background(0, 0, 30);
  orbitControl();

  /** 
   * Analyze the sound.
   * Return array of frequency volumes, from lowest to highest frequencies.
   */
  frequencySpectrum = fft.analyze();

  //normalMaterial();
  rotateZ(frameCount * 0.5);
  rotateX(frameCount * 0.5);
  rotateY(frameCount * 0.5);
  translate(-200, 0, 0);
  // Draw every value in the frequencySpectrum array
  let gridRows = 15;
  let spacing = 20;
  stroke(360, 0, 360);
  strokeWeight(2);
  ambientLight(360);
  for (var i = 0; i < gridRows; i++) {
    for (var j = 0; j < gridRows; j++) {
      let index = i * gridRows + j;
      //var theta = map(i, 10, fftBands, 0, 720);
      let length = map(frequencySpectrum[index], 0, 255, 100, 300);

      let hue = (length + 100) % 360;
      ambientMaterial(hue, 360, 360);

      push();
      translate(i * spacing, 0 - length/2, j * spacing);
      box(15, length, 15);
      pop();
    }
  }

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
