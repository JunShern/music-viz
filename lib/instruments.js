
class EPComp {
    constructor() {
        this.minHeight = height - height / 3;
        this.height = this.minHeight;
        this.thickness = 5;
        this.wave = [];
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
        this.wave = [];
        this.numStrings = 0;
    }

    // Draw the lines
    draw(cnv) {
        cnv.push();
        cnv.stroke(255);

        let xOffset = width / 4;
        let xWidth = width / 2;

        let y = height * 2 / 3;
        for (var i = 0; i < this.numStrings; i++) {
            let x = random(xOffset, xOffset + xWidth);
            // cnv.stroke(random(100, 255), 100, random(100, 255));
            cnv.stroke(random(colorPalette));
            cnv.strokeWeight(random(2, 5));
            cnv.line(x, y, x, 0);
            cnv.line(x, y, width * (x - xOffset) / xWidth, height);
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
        EPLine.staticCount = (EPLine.staticCount + 1) % colorPalette.length;
        this.color = colorPalette[EPLine.staticCount];
        this.thickness = 5;

        this.draw = function (cnv) {
            let xpos = this.noteXPositions[note];
            if (xpos) {
                cnv.stroke(white);
                cnv.strokeWeight(this.thickness);

                cnv.fill(this.color);
                cnv.rect(xpos, height / 3, width / 12, height / 3);
            }
        };
    }
}
EPLine.staticCount = 0;

class Painter {
    constructor() {
        this.memory = [];
        this.brushWidth = 5;
        this.scaleFactor = 1;
        this.centerPoint = createVector(width / 2, height / 2);
        this.counter = 0;

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

        this.draw = function (cnv, pos) {
            cnv.fill(black);
            cnv.stroke(black);
            cnv.push();
            cnv.translate(pos.x, pos.y);
            cnv.beginShape();
            for (var i = 0; i < this.memory.length; i++) {
                let normalizedPoint = p5.Vector.sub(this.memory[i], this.centerPoint).mult(this.scaleFactor);
                var x = normalizedPoint.x + random(-this.brushWidth, this.brushWidth);
                var y = normalizedPoint.y + random(-this.brushWidth, this.brushWidth);
                cnv.curveVertex(x, y);
            }
            for (var i = this.memory.length - 1; i >= 0; i--) {
                let normalizedPoint = p5.Vector.sub(this.memory[i], this.centerPoint).mult(this.scaleFactor);;
                var x = normalizedPoint.x + random(-this.brushWidth, this.brushWidth);
                var y = normalizedPoint.y + random(-this.brushWidth, this.brushWidth);
                cnv.curveVertex(x, y);
            }
            cnv.endShape(CLOSE);
            cnv.pop();
        }
    }
}

class Dot {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.size = 10;
        this.color = [random(255), random(255), random(255)];
        this.thickness = 1;
    }
    draw(cnv) {
        // cnv.ellipse(0, 0, this.size, this.size)
        this.pos.add(createVector(random(-1, 1), random(-1, 1)));
        cnv.strokeWeight(this.thickness);
        cnv.line(
            this.pos.x - this.size / 2, this.pos.y,
            this.pos.x + this.size / 2, this.pos.y);
    }
}
