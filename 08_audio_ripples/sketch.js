let midiInput, midiOutput;

var fft;
var audio;
var waves = [];
var currentWave;
var maxRings = 20;
var rotationCounter = 0;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB); // Max values: 360, 100, 100, 1
    noStroke();
    angleMode(DEGREES);

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
}

function draw() {
    background(10);

    // FFT
    fftBands = fft.analyze();
    currentWave = fft.waveform();

    var ringSeparation = height / 15;

    // Update current wave
    waves[0] = currentWave;
    // Draw previous waves
    for (var i = waves.length - 1; i >= 0; i--) {
        let wave = waves[i];
        let hue = (60 * i / waves.length + frameCount*5) % 360;
        fill(hue, 200, 50, 1);

        push();
        translate(width / 2, height / 2);
        // Rotate even/odd rings
        if (i%2) {
            rotate(rotationCounter);
        } else {
            rotate(-rotationCounter);
        }
        // Draw rings
		beginShape();
		let val = 0;
		for (var j = 0; j < wave.length; j+=3) {
			val = wave[j] * 0.5 + val * 0.5; // Moving average
            var r = (i + 2) * (ringSeparation) + (val * ringSeparation);
            r += currentWave[j] * ringSeparation;
            var x = r * cos(j * 360 / wave.length);
            var y = r * sin(j * 360 / wave.length);
            curveVertex(x, y);
		}
        endShape(CLOSE);
        pop();
    }
    rotationCounter += audio.amplitude.getLevel() * 10;
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
	WebMidi.enable(function(err) {
		if(err) {
			console.log("WebMidi could not be enabled.", err);
		}

		// Print to console available MIDI in/out id/names
		WebMidi.inputs.forEach(function(element, c) {
			print("in  \[" + c + "\] " + element.name);
		});
		WebMidi.outputs.forEach(function(element, c) {
			print("out \[" + c + "\] " + element.name);
		});

		// assign in channel:
		if(typeof idIn === 'number') {
			midiInput = WebMidi.inputs[idIn];
		} else {
			midiInput = WebMidi.getInputByName(idIn);
		}

		if(typeof idOut === 'number') {
			midiOutput = WebMidi.outputs[idOut];
		} else {
			midiOutput - WebMidi.getOutputByName(idOut);
		}

		// noteOn
		midiInput.addListener('noteon', "all", function(e) {
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
		midiInput.addListener('noteoff', "all", function(e) {
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
		midiInput.addListener('pitchbend', "all", function(e) {
			let pitch = {
				type : 'pitchbend'
			};
			pitch.channel = e.channel;
			pitch.value = floor(127 * e.value);
			pitchBend(pitch);
		});

		// controlChange
		midiInput.addListener('controlchange', "all", function(e) {
			let control = {
				type : 'controlchange'
			};
			control.channel = e.channel;
			control.controllerNumber = e.controller.number;
			control.controllerName = e.controller.name;
			control.value = e.value
			controlChange(control);
		});

	});
}