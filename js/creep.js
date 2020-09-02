// DIAGONAL_INCOMING = 1;
// DIAGONAL_OUTGOING = 2;

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
    static get strength() { return 1; }
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
		this.angle = Math.PI * Math.random();
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

		if (this.pathtile.diagonality & (this.distance - Math.trunc(this.distance) < 0.5 ? DIAGONAL_OUTGOING : DIAGONAL_INCOMING))
			this.distance += 0.7071 * this.speed / controller.updateInterval;
		else
			this.distance += this.speed / controller.updateInterval;
        this.distance = Math.max(0, Math.min(this.pathlength, this.distance));
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

                if (pt !== this.pathtile && pt instanceof PathTile) {
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

    static get strength() { 
    	return this.innerCreep.strength * this.innerCreepCount + this.health; 
    }

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


let shields = [new Image(), new Image(), new Image()];
shields[0].src = "img/shield0.png";
shields[1].src = "img/shield1.png";
shields[2].src = "img/shield2.png";

class Shield extends GameObject {

	constructor(parent, health){
		super(shields[0], parent.x, parent.y, 0, 0.5);
		this.parent = parent;
		this.health = health;
		this.initial_health = this.health;
	}

	update(){
		this.x = this.parent.x;
		this.y = this.parent.y + 0.2;

		if(this.health / this.initial_health < 0.5){
			this.image = shields[2];
		}
		else if(this.health / this.initial_health < 0.8){
			this.image = shields[1];
		}
	}
}

class ShieldedCreep extends MatryoshkaCreep {

	static get shieldStrength() { return 10; }
	static get creepType() { 
		throw new Error("Abstract property creepType must be overridden by subclass");
	}

	// kopiera egenskaper från underliggande creep
	static get image() { return this.creepType.image; }
	static get speed() { return this.creepType.speed * 0.75; }
	static get scale() { return this.creepType.scale; }
	static get strength() { return this.creepType.strength + this.shieldStrength; }
	static get health() { return this.creepType.health; }
	static get value() { return this.creepType.value; }
	static get drawHealthBar() { return this.creepType.drawHealthBar; }
    static get innerCreep() { return this.creepType.innerCreep; }
    static get innerCreepCount() { return this.creepType.innerCreepCount; }
    static get damage() { return this.creepType.damage; }


	constructor(x,y){
		super(x,y);
		this.shield = new Shield(this, this.constructor.shieldStrength);
	}

	onHit(projectile) {
		if(this.shield === null){
			super.onHit(projectile);
			return;
		}

		this.shield.health -= projectile.damage;

		if(this.shield.health <= 0){
			// Om skölden har negativ hälsa tar vi skada motsvarande skillnaden till noll
			this.health += this.shield.health;
			this.shield = null;
		}

		if(this.health <= 0){
			this.onDeath();
		}
	}

	update() {
		super.update();
		if(this.shield !== null)
			this.shield.update();
	}

	draw(gameArea) {
		super.draw(gameArea);
		if(this.shield !== null)
			this.shield.draw(gameArea);
	}
}
