class PrerenderedObject {

	constructor(image, scale, angle){
		this.image = image;
		this.scale = scale;
		this.angle = angle;

		this.imageDirty = true;
	}

	set image(v) {
		this._image = v;
		this.imageDirty = true;
	}
	get image() { 
		return this._image;
	}
	set scale(v) {
		this._scale = v;
		this.imageDirty = true;
	}
	get scale() {
		return this._scale;
	}
	set angle(v) {
		if (Math.abs(v) > Math.PI / 2)
            v -= Math.sign(v) * Math.PI;

        // 
        if(Math.abs(this._angle - v) < 5 * Math.PI/180)
        	return;
		this._angle = v;
		this.imageDirty = true;
	}
	get angle() {
		return this._angle;
	}
	draw(gameArea, x, y) {
		if(this.imageDirty)
			this.prerender();

		if(this.imagecache === null)
			return;
		if(this.imagecache.width == 0 || this.imagecache.height == 0)
			return;
        gameArea.draw(this.imagecache, x, y, 0, 1);
	}
    prerender() {
        if (this.image === null || (this.image instanceof Image && !this.image.complete)) {
			this.imagecache = null;
			return;
		}
		if(!this.imagecache)
			this.imagecache = document.createElement("canvas");
		else
			this.imagecontext.clearRect(0, 0, this.imagecache.width, this.imagecache.height);

		this.imagecache.height = Math.ceil((this.image.height * Math.abs(Math.cos(this.angle)) + this.image.width * Math.abs(Math.sin(this.angle))) * this.scale);
		this.imagecache.width = Math.ceil((this.image.height * Math.abs(Math.sin(this.angle)) + this.image.width * Math.abs(Math.cos(this.angle))) * this.scale);
		this.imagecontext = this.imagecache.getContext("2d");

		this.imagecontext.translate(this.imagecache.width/2, this.imagecache.height/2);
		this.imagecontext.rotate(this.angle);

		this.imagecontext.drawImage(
			this.image, -this.image.width * this.scale/2, -this.image.height * this.scale/2,
			this.image.width * this.scale, this.image.height * this.scale
		);

        this.imageDirty = false;
	}
}

class GameObject extends PrerenderedObject {
    constructor(image, x, y, angle, scale) {
    	super(image, scale, angle);
        this.x = x;
        this.y = y;
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
    	super.draw(gameArea, this.x, this.y);

        var index = 0;
        this.effects.forEach(function(obj){
			index = obj.draw(this, gameArea, index);
		}.bind(this));
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

// //Subimages should be arranged left to right
// class SubimagedGameObject extends GameObject {
//     constructor(image, subimageIndex, subimageWidth, x, y, angle, scale) {
//         super(image, x, y, angle, scale);
//         this.subimageIndex = subimageIndex;
//         this.subimageWidth = subimageWidth;
//     }
//     draw(gameArea) {
//         gameArea.drawSubimage(this.image, this.subimageIndex, this.subimageWidth, this.x, this.y, this.angle, this.scale);
//     }
// }


class BaseEffect extends PrerenderedObject {

	// Om effecten förs över till MatryoshkaCreep-barn
	static get persistent() { return false; }
	static get image() { return null; }
	static get scale() { return 1; }

	constructor(cooldown){
		super(null, 1, 0);

		this.image = this.constructor.image;
		this.scale = this.constructor.scale;

		this.cooldown = cooldown;
		this.cdtime = this.cooldown;
		this.timesinitialized = 0;
	}

	init(object){
		this.timesinitialized++;
	}

	update(object){
		if(this.cdtime-- <= 0){
			this.cdtime = this.cooldown;
			this.apply(object);
		}
	}

	draw(object, gameArea, index) {
		let x = object.x + 0.5 - 0.3*index;
		let y = object.y - 0.5;

		super.draw(gameArea, x, y);
		return index+1;
	}

	apply(object){

	}

	remove(object){
		object.removeEffect(this);
	}

}