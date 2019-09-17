let layer1, layer2, layer3;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Create layers
    layer1 = new Layer(layer1Setup, layer1Draw);
    layer2 = new Layer(layer2Setup, layer2Draw);
    layer3 = new Layer(layer3Setup, layer3Draw);
}

function draw() {
    background(30, 100, 100);
    strokeWeight(10);
    line(width/2, height/2, mouseX, mouseY);

    // Display layers in order
    layer1.show();
    layer2.show();
    layer3.show();
}

// LAYER 1
function layer1Setup(me) {
    me.noStroke();
    me.fill(255, 0, 0);
}
function layer1Draw(me) {
    me.clear();
    me.ellipse(mouseX, mouseY, 200, 200);
}

// LAYER 2
function layer2Setup(me) {
    me.strokeWeight(3);
}
function layer2Draw(me) {
    if (frameCount % 100 == 0) {
        me.clear();
    }
    me.ellipse(random(width), random(height), 30, 30);
}

// LAYER 3
function layer3Setup(me) {
    me.noStroke();
    me.fill(255, 255, 0);
}
function layer3Draw(me) {
    me.clear();
    me.ellipse(mouseX, mouseY, 150, 150);
}