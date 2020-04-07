class BaseCreep extends GameObject {
	constructor(image, scale, map, speed) {
		let pos = map.getPosition(0);
		super(image, pos[0], pos[1], 0, scale);

		// Speed of this creep
		this.speed = speed;
		// Health of this creep 
		this.health = 1;
		// Value gained when killed
		this.value = 1;

		this.pathlength = map.path.length - 1;
		// Distance traveled along the path for this creep
		this.distance = 0;
		this.lastx = this.x;
		this.lasty = this.y;

		//Pathtile this creep is currently at. For collisiondetection purposes
		this.pathtile = map.path[0];
		this.pathtile.add(this);
		// Status effect currently affecting this creep
        this.effects = new Set();
        controller.registerObject(this);
	}
	addEffect(effect) {
		this.effects.add(effect);
	}
	removeEffect(effect){
		this.effects.delete(effect);
	}
	onHit(projectile) {
		if(--this.health <= 0){
			this.onDeath();
		}
	}
	onDeath() {
		this.id = null;
		this.pathtile.remove(this);
		this.pathtile = null;
		controller.money += this.value;
	}
	onGoal() {
		this.id = null;
		this.pathtile.remove(this);
		this.pathtile = null;
		controller.hp--;
	}
	update(gameArea) {
		if (this.id === null)
			return;

		// Apply status effects
		this.effects.forEach(function(obj){
			obj.update(this);
		}.bind(this));

		// Move object
		this.lastx = this.x;
		this.lasty = this.y;

		this.distance = Math.max(0, Math.min(this.pathlength, this.distance + this.speed));
		let pos = controller.map.getPosition(this.distance);
		this.x = pos[0];
		this.y = pos[1];

		// Check if we are at finish,
		if (this.distance >= this.pathlength) {
			this.onGoal();
		}
		else {
			// Else add ourselves to pathtile for hit detection
			if (controller.map.validPosition(this.x, this.y)) {
				let pt = controller.map.getGridAt(Math.floor(this.x), Math.floor(this.y));

				if (pt !== this.pathtile) {
					this.pathtile.remove(this);
					this.pathtile = pt;
					this.pathtile.add(this);
				}
			}
		}

		// Draw ourselves at new position.
		super.update(gameArea);
	}
}

class BaseEffect {

	constructor(cooldown){
		this.cooldown = cooldown;
		this.cdtime = this.cooldown;
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