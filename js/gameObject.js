class GameObject {
    constructor(image, x, y, angle, scale) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.scale = scale;
        this.id = null;

        // Status effect currently affecting this creep
        this.effects = new Set();

        this.despawnTimer = -1;
    }
    update() {
    	
    	// Apply status effects
		this.effects.forEach(function(obj){
			obj.update(this);
		}.bind(this));
        	
        if (this.despawnTimer >= 0){
        	if(--this.despawnTimer <= 0){
        		this.despawn();
        	}
        }
    }
    draw(gameArea) {
        gameArea.draw(this.image, this.x, this.y, this.angle, this.scale);   
    }
    despawn() {
    	this.id = null;
    }
    addEffect(effect) {
		for (var it = this.effects.values(), val=null; val=it.next().value; ) {
			if(val.constructor == effect.constructor){
				val.cdtime = effect.cooldown;
				return;
			}
		}

		this.effects.add(effect);
		effect.init(this);
	}
	removeEffect(effect){
		this.effects.delete(effect);
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


class BaseEffect {

	constructor(cooldown){

		this.cooldown = cooldown;
		this.cdtime = this.cooldown;
	}

	init(object){

	}

	update(object){
		if(this.cdtime-- <= 0){
			this.cdtime = this.cooldown;
			this.apply(object);
		}
	}

	apply(object){

	}

	remove(object){
		object.removeEffect(this);
	}

}