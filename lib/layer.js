
class Layer {
    constructor(mySetup, myDraw) {
        this.canvas = createGraphics(width, height);
        this.setup = mySetup;
        this.update = function() {
            myDraw(this.canvas);
        }
        
        // Run setup
        this.setup(this.canvas);
    }

    draw = function() {
        this.update(this.canvas);
        this.show(this.canvas);
    }

    show = function () {
        image(this.canvas, 0, 0);
    }

    getBlendImage(layer1, layer2, blendMode) {
        // Convert layers to images (seems like blend only works for images at the moment)
        let im1 = createImage(layer1.canvas.width, layer1.canvas.height);
        im1.copy(layer1.canvas, 0, 0, layer1.canvas.width, layer1.canvas.height, 0, 0, layer1.canvas.width, layer1.canvas.height);
        let im2 = createImage(layer2.canvas.width, layer2.canvas.height);
        im2.copy(layer2.canvas, 0, 0, layer2.canvas.width, layer2.canvas.height, 0, 0, layer2.canvas.width, layer2.canvas.height);

        // Blend images
        im2.blend(im1, 0, 0, width, height, 0, 0, width, height, blendMode);

        // Create new layer from the blended layers
        // this.canvas.image(im2, 0, 0, width, height);
        // console.log("Does it blend?");
        // console.log(this);
        return im2;
    }
}