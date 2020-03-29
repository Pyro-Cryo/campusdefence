class GameArea {
    constructor(canvas, gridWidth, gridHeight) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = this.canvas.getContext("2d");

        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;

    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    //Draws an image centered around (x, y) with the specified angle (in radians) and scale
    draw(image, _x, _y, angle, scale) {
        let pos = this.gridToCanvas(_x,_y);
        let x = pos[0];
        let y = pos[1];
        if (!angle)
            this.context.drawImage(
                image,
                0, 0,
                image.width, image.height,
                x - image.width * scale / 2, y - image.height * scale / 2,
                image.width * scale, image.height * scale
            );
        else {
            this.context.translate(x, y);
            this.context.rotate(angle);
            this.context.drawImage(
                image,
                0, 0,
                image.width, image.height,
                -image.width * scale / 2, -image.height * scale / 2,
                image.width * scale, image.height * scale
            );
            this.context.rotate(-angle);
            this.context.translate(-x, -y);
        }
    }
    //Draws a subimage from an image, centered around (x, y) with the specified angle (in radians) and scale
    drawSubimage(image, subimageIndex, subimageWidth, _x, _y, angle, scale) {
        let pos = this.gridToCanvas(_x,_y);
        let x = pos[0];
        let y = pos[1];
        if (!angle) {
            this.context.drawImage(
                image,
                subimageIndex * subimageWidth, 0,
                subimageWidth, image.height,
                x - subimageWidth * scale / 2, y - image.height * scale / 2,
                image.width * scale, image.height * scale
            );
        } else {
            this.context.translate(x, y);
            this.context.rotate(angle);
            this.context.drawImage(
                image,
                subimageIndex * subimageWidth, 0,
                subimageWidth, image.height,
                -subimageWidth * scale / 2, -image.height * scale / 2,
                subimageWidth * scale, image.height * scale
            );
            this.context.rotate(-angle);
            this.context.translate(-x, -y);
        }
    }
    gridToCanvas(x,y) {
        return [
            (x + 0.5) * this.width / this.gridWidth,
            (y + 0.5) * this.height / this.gridHeight
        ];
    }
    canvasToGrid(x,y){
        return [
            (x * this.gridWidth / this.width) - 0.5,
            (y * this.gridHeight / this.height) - 0.5
        ];
    }
}