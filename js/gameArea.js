class GameArea {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = this.canvas.getContext("2d");

    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(image, x, y, angle, scale) {
        if (!angle)
            this.context.drawImage(
                image,
                0, 0,
                image.width, image.height,
                x, y,
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
    drawSubimage(image, subimageIndex, subimageWidth, x, y, angle, scale) {
        if (!angle) {
            this.context.drawImage(
                image,
                subimageIndex * subimageWidth, 0,
                subimageWidth, image.height,
                x, y,
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
}

class GameObject {
    constructor(image, x, y, angle, scale) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.scale = scale;
        this.id = null;
    }
    update(gameArea) {
        gameArea.draw(this.image, this.x, this.y, this.angle, this.scale);
    }
}

class SubimagedGameObject extends GameObject {
    constructor(image, subimageIndex, subimageWidth, x, y, angle, scale) {
        super(image, x, y, angle, scale);
        this.subimageIndex = subimageIndex;
        this.subimageWidth = subimageWidth;
    }
    update(gameArea) {
        gameArea.drawSubimage(this.image, this.subimageIndex, this.subimageWidth, this.x, this.y, this.angle, this.scale);
    }
}