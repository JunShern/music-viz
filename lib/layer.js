
class Layer {
    constructor(mySetup, myDraw) {
        this.canvas = createGraphics(width, height);
        this.setup = mySetup;
        this.draw = myDraw;
        this.show = function () {
            this.draw(this.canvas);
            image(this.canvas, 0, 0);
        }
        
        // Run setup
        this.setup(this.canvas);
    }
}