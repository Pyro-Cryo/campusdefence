class GameObject {
    constructor(image, x, y, angle, scale) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.scale = scale;
        this.id = null;

        this.despawnTimer = -1;
    }
    update() {
        	
        if (this.despawnTimer >= 0){
        	if(--this.despawnTimer <= 0){
        		this.id = null;
        	}
        }
    }
    draw(gameArea) {
        gameArea.draw(this.image, this.x, this.y, this.angle, this.scale);   
    }
}

//Subimages should be arranged left to right
class SubimagedGameObject extends GameObject {
    constructor(image, subimageIndex, subimageWidth, x, y, angle, scale) {
        super(image, x, y, angle, scale);
        this.subimageIndex = subimageIndex;
        this.subimageWidth = subimageWidth;
    }
    draw(gameArea) {
        gameArea.drawSubimage(this.image, this.subimageIndex, this.subimageWidth, this.x, this.y, this.angle, this.scale);
    }
}