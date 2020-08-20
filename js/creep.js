let ninjastar = new Image();
ninjastar.src = "img/star.png";

class BaseCreep extends GameObject {
    // Speed in grid units per second
    static get speed() {
        throw new Error("Abstract property speed must be overridden by subclass");
    }
    // The creep's sprite
    static get image() {
        throw new Error("Abstract property image must be overridden by subclass");
    }
    // The creep's sprite's scale
    static get scale() {
        throw new Error("Abstract property scale must be overridden by subclass");
    }
    // The creep's base hit points
    static get health() { return 1; }
    // The amount of money the player gets when the creep is killed
    static get value() { return 1; }
    // Damage done to player HP when the creep reaches the end of the path
    static get damage() { return 1; }
    // Should the creep draw a health bar?
    static get drawHealthBar() { return false; }

	constructor(distance) {
		let pos = controller.map.getPosition(distance || 0);
        super(undefined, pos[0], pos[1], 0, undefined);
        this.image = this.constructor.image;
        this.scale = this.constructor.scale;
        this.speed = this.constructor.speed;
        this.health = this.constructor.health;
        this.initial_health = this.constructor.health;
        this.value = this.constructor.value;
        this.drawHealthBar = this.constructor.drawHealthBar;

		this.pathlength = controller.map.path.length - 1;
		// Distance traveled along the path for this creep
		this.distance = distance || 0;
		this.lastx = this.x;
		this.lasty = this.y;

		//Pathtile this creep is currently at. For collisiondetection purposes
		this.pathtile = controller.map.path[0];
		this.pathtile.add(this);
        controller.registerObject(this);
	}
	onHit(projectile) {
		this.health -= projectile.damage;
		if(this.health <= 0){
			this.onDeath();
		}
	}
	affectedBy(projectile){
		return true;
	}
	onDeath() {
		this.despawnTimer = 2;
		this.image = ninjastar;
		this.angle = 360 * Math.random();
		controller.money += this.value;
		if(this.pathtile !== null){
			this.pathtile.remove(this);
	        this.pathtile = null;
		}
	}
	onGoal() {
        controller.hp -= this.constructor.damage;
        this.despawn();
    }
    //Call this on update if you want the creep to rotate its sprite according to the path
    rotateMe(offset) {
        if (!(this.x === this.lastx && this.y === this.lasty))
            this.angle = (offset || 0) + Math.PI / 2 + Math.atan2(this.y - this.lasty, this.x - this.lastx);
    }
	update() {
		if (this.id === null)
			return;
		if(this.despawnTimer >= 0){
			super.update();
			return;
		}

		// Move object
		this.lastx = this.x;
		this.lasty = this.y;

        this.distance = Math.max(0, Math.min(this.pathlength, this.distance + this.speed / controller.updateInterval));
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
				let pt = controller.map.getGridAt(Math.round(this.x), Math.round(this.y));

				if (pt !== this.pathtile) {
					this.pathtile.remove(this);
					this.pathtile = pt;
					this.pathtile.add(this);
				}
			}
		}

		// Draw ourselves at new position.
        super.update();
    }

    despawn(){
    	if(this.pathtile !== null){
			this.pathtile.remove(this);
	        this.pathtile = null;
		}
		super.despawn();
    }
    
	draw(gameArea){
		super.draw(gameArea);
		if (this.drawHealthBar)
            gameArea.bar(this.x, this.y, 0.5, 0.8, 3, this.health / this.initial_health);
	}
}


class MatryoshkaCreep extends BaseCreep {
    // The creep that spawns when this one is killed
    static get innerCreep() {
        throw new Error("Abstract property innerCreep must be overridden by subclass");
    }
    // Number of inner creeps that spawn
    static get innerCreepCount() { return 1; }
    // Overrides BaseCreep.damage
    static get damage() { return 1 + this.innerCreep.damage * this.innerCreepCount; }

    // static get value() { return 0; }

    constructor(distance){
    	super(distance);
    	this.innerCreepCount = this.constructor.innerCreepCount;
    }

    onDeath() {
        for (let i = 0; i < this.innerCreepCount; i++){
            let nc = new this.constructor.innerCreep(
                Math.min(controller.map.path.length - 1, Math.max(0, this.distance + this.speed * (0.5 + i - this.constructor.innerCreepCount / 2)))
            );

            // Persistent effects carry over
            this.effects.forEach(function(obj){
				if(obj.constructor.persistent){
					nc.addEffect(obj);
				}
			});

            // Om projectilen skadade oss mer �n vi hade h�lsa skadas v�ra barn ocks�
            if(this.health < 0){
            	nc.health--;
            	this.health++;
				if(nc.health <= 0){
					nc.onDeath();
				}
            }

        }
        super.onDeath();
    }
}
