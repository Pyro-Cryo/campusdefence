class GameArea {
    constructor(canvas, gridWidth, gridHeight) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = this.canvas.getContext("2d");

        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;

        this.unitWidth = this.gridToCanvasX(1) - this.gridToCanvasX(0);
        this.unitHeight = this.gridToCanvasY(1) - this.gridToCanvasY(0);
        this._scaleFactor = Math.sqrt((Math.pow(this.unitWidth, 2) + Math.pow(this.unitHeight, 2)) / 2);
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    //Draws an image centered around (x, y) with the specified angle (in radians) and scale
    draw(image, _x, _y, angle, scale) {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
        if (!angle){
            if(scale == 1)
                this.context.drawImage(
                    image,
                    Math.floor(x - image.width / 2), Math.floor(y - image.height / 2)
                    );
            else
                this.context.drawImage(
                    image,
                    Math.floor(x - image.width * scale / 2), Math.floor(y - image.height * scale / 2),
                    Math.floor(image.width * scale), Math.floor(image.height * scale)
                );
        }
        else {
            this.context.translate(Math.floor(x), Math.floor(y));
            this.context.rotate(angle);
            if(scale == 1)
                this.context.drawImage(
                    image,
                    - Math.floor(image.width / 2), - Math.floor(image.height / 2)
                    );
            else
                this.context.drawImage(
                    image,
                    -Math.floor(image.width * scale / 2), -Math.floor(image.height * scale / 2),
                    Math.floor(image.width * scale), Math.floor(image.height * scale)
                );
            this.context.rotate(-angle);
            this.context.translate(-x, -y);
        }
    }
    //Draws a subimage from an image, centered around (x, y) with the specified angle (in radians) and scale
    drawSubimage(image, subimageIndex, subimageWidth, _x, _y, angle, scale) {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
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
    gridToCanvasX(x) {
        return (x + 0.5) * this.width / this.gridWidth;
    }
    gridToCanvasY(y) {
        return (y + 0.5) * this.height / this.gridHeight;
    }
    canvasToGridX(x) {
        return (x * this.gridWidth / this.width) - 0.5;
    }
    canvasToGridY(y) {
        return (y * this.gridHeight / this.height) - 0.5;
    }
    disc(_x, _y, radius, color) {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
        let fillStyle = this.context.fillStyle;
        this.context.fillStyle = color || "#000000";
        this.context.beginPath();
        this.context.arc(x, y, radius * this._scaleFactor, 0, 2 * Math.PI);
        this.context.fill();
        this.context.fillStyle = fillStyle;
    }
    square(_x, _y, color) {
        let x = this.gridToCanvasX(_x - 0.5);
        let y = this.gridToCanvasY(_y - 0.5);
        let fillStyle = this.context.fillStyle;
        this.context.fillStyle = color || "#000000";
        this.context.fillRect(x, y, this.unitWidth, this.unitHeight);
        this.context.fillStyle = fillStyle;
    }
    bar(_x, _y, offset, length, width, ratio, fgColor, bgColor) {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
        offset *= this.unitHeight;
        length *= this.unitWidth;
        let fillStyle = this.context.fillStyle;
        this.context.fillStyle = bgColor || "#FF0000";
        this.context.fillRect(x - length / 2, y + offset, length, width);
        this.context.fillStyle = fgColor || "#00FF00";
        this.context.fillRect(x - length / 2, y + offset, length * ratio, width);
        this.context.fillStyle = fillStyle;
    }
}