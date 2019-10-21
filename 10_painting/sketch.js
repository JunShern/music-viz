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

    painter = new Painter();

    noLoop();
}

function draw() {
    background(10);

    painter.draw(createVector(width/2, height/2));
    setTimeout(getNextFrame, 30);
}

function getNextFrame() {
    // Read json file
    frameString = String(frameCount % 400).padStart(3, "0");
    $.getJSON("pose_keypoints/video_000000000" + frameString + "_keypoints.json", function (json) {
        painter.clear();
        let poseKeypoints = json;
        for (let i = 0; i < poseKeypoints.people.length; i++) {
            let leftHand = poseKeypoints.people[i].hand_left_keypoints_2d;
            let rightHand = poseKeypoints.people[i].hand_right_keypoints_2d;
            let body = poseKeypoints.people[i].pose_keypoints_2d;
            let allKeypoints = leftHand.concat(body, rightHand);
            for (let j = 0; j < allKeypoints.length; j += 3) {
                let x = allKeypoints[j];
                let y = allKeypoints[j + 1];
                if (x != 0 && y != 0) {
                    painter.addPoint(createVector(x, y));
                }
            }
        }
        redraw();
    });
}

function Painter() {
    this.memory = [];
    this.brushWidth = 4;
    this.scaleFactor = 0.7;
    this.centerPoint = createVector(width/2, height/2);

    this.addPoint = function (vec) {
        this.memory.push(vec);
        // Moving average - linear interpolation
        this.centerPoint = p5.Vector.add(
            p5.Vector.mult(this.centerPoint, 0.99), 
            p5.Vector.mult(vec, 0.01)
            );
    }

    this.clear = function () {
        this.memory = [];
    }

    this.draw = function (pos) {
        // let hue = (frameCount * 10) % 360;
        // fill(random(0, 100));
        // stroke(random(100, 255));
        // strokeWeight(random(3, 5));
        // fill(hue, 200, 50, 1);
        // stroke(hue, 200, 50, 1);
        fill(255);

        push();
        translate(pos.x, pos.y);
        beginShape();
        for (var i = 0; i < this.memory.length; i++) {
            let normalizedPoint = p5.Vector.sub(this.memory[i], this.centerPoint).mult(this.scaleFactor);
            var x = normalizedPoint.x + random(-this.brushWidth, this.brushWidth);
            var y = normalizedPoint.y + random(-this.brushWidth, this.brushWidth);
            curveVertex(x, y);
        }
        for (var i = this.memory.length - 1; i >= 0; i--) {
            let normalizedPoint = p5.Vector.sub(this.memory[i], this.centerPoint).mult(this.scaleFactor);;
            var x = normalizedPoint.x + random(-this.brushWidth, this.brushWidth);
            var y = normalizedPoint.y + random(-this.brushWidth, this.brushWidth);
            curveVertex(x, y);
        }
        endShape(CLOSE);
        pop();
        //let xHead = this.memoryX.pop();
        //let yHead = this.memoryY.pop();
        //this.memoryX.unshift(xHead);
        //this.memoryY.unshift(yHead);
    }
}
