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
    // Does the creep respect the limit on number of creeps per PathTile?
    static get respectPathTileCap() { return true; }
    // Does this creep regenerate health?
    static get regenerative() { return false; }
    // Default regenerate one per second if not hit
    static get regenerationspeed() { return 1100 / controller.updateInterval; }

    static totalValue(){
        return this.value;
    }


	constructor(distance) {
		let pos = controller.map.getPosition(distance || 0);
        super(undefined, pos[0], pos[1], 0, undefined);
        this.image = this.constructor.image;
        this.scale = this.constructor.scale;
        this.speed = this.constructor.speed;
        this.speedModifiers = [];
        this.health = this.constructor.health;
        this.initial_health = this.constructor.health;
        this.value = this.constructor.value;
        this.drawHealthBar = this.constructor.drawHealthBar;
        this.respectPathTileCap = this.constructor.respectPathTileCap;

        this.regenerative = this.constructor.regenerative;
        this.regenerationspeed = this.constructor.regenerationspeed;
        this.regenerationtimer = 0;

		this.pathlength = controller.map.path.length - 1;
		// Distance traveled along the path for this creep
		this.distance = distance || 0;
		this.lastx = this.x;
		this.lasty = this.y;

		//Pathtile this creep is currently at. For collisiondetection purposes
		this.pathtile = controller.map.path[0];
		this.pathtile.add(this);
        controller.registerObject(this);

        this.isdead = false;
	}
	onHit(projectile) {
		this.health -= projectile.damage;
        this.regenerationtimer = this.regenerationspeed;
		if(this.health <= 0){
			this.onDeath();
		}
    }
	onDeath() {
        if (this.isdead){
            return; // Vi bör dö max en gång
        }
        this.isdead = true;
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
        this.lastdistance = this.distance;

        let modified_speed = this.speed;
        for (var i = 0; i < this.speedModifiers.length; i++) {
            modified_speed *= this.speedModifiers[i];
        }

		if (this.pathtile.diagonality & (this.distance - Math.trunc(this.distance) < 0.5 ? DIAGONAL_OUTGOING : DIAGONAL_INCOMING))
			this.distance += 0.7071 * modified_speed / controller.updateInterval;
		else
			this.distance += modified_speed / controller.updateInterval;
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
                    const oldpt = this.pathtile;
                    if (pt.add(this, !this.respectPathTileCap)) {
                        oldpt.remove(this);
                        this.pathtile = pt;
                    } else { // Next pathtile is full, don't move
                        this.x = this.lastx;
                        this.y = this.lasty;
                        this.distance = this.lastdistance;
                    }
				}
			}
		}

        if (this.regenerative && this.health < this.initial_health)
            if (--this.regenerationtimer <= 0){
                this.health += 1;
                this.regenerationtimer = this.regenerationspeed;
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

    static totalValue(){
        return this.value + this.innerCreep.totalValue() * this.innerCreepCount;
    }

    constructor(distance){
    	super(distance);
    	this.innerCreepCount = this.constructor.innerCreepCount;
    }

    onDeath() {
        for (let i = 0; i < this.innerCreepCount; i++){
            let nc = new this.constructor.innerCreep(
                Math.min(controller.map.path.length - 1, Math.max(0, this.distance + Math.max(this.speed, 0.2) * (0.5 + i - this.constructor.innerCreepCount / 2)))
            );

            // Persistent effects carry over
            this.effects.forEach(function(obj){
				if (obj.constructor.persistent || obj.persistent) {
					nc.addEffect(obj);
				}
			});

            // Om projectilen skadade oss mer �n vi hade h�lsa skadas v�ra barn ocks�
            if(this.health < 0){
            	nc.health -= 1;
            	this.health += 1;
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
	static get health() { return this.creepType.health+1; }
	static get value() { return this.creepType.value; }
	static get drawHealthBar() { return this.creepType.drawHealthBar; }
    static get innerCreep() { return this.creepType.innerCreep; }
    static get innerCreepCount() { return this.creepType.innerCreepCount; }
    static get damage() { return this.creepType.damage; }
    static get regenerative() { return this.creepType.regenerative; }
    static get regenerationspeed() { return this.creepType.regenerationspeed; }


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

let nopeimg = new Image();
nopeimg.src = "img/nope_gray.png";

function generateImmunityEffectImage(immunityImg, immunityImgScale) {
    const totalImgScale = 1.2;
    const immunityImgScaleFactor = 0.9;

    if (!nopeimg.complete || immunityImg === null || (immunityImg instanceof Image && !immunityImg.complete))
        return null;

    let canvas = document.createElement("canvas");
    canvas.width = Math.ceil(immunityImg.width * immunityImgScale * totalImgScale);
    canvas.height = Math.ceil(immunityImg.height * immunityImgScale * totalImgScale);
    let ctx = canvas.getContext("2d");

    let dx = (canvas.width - Math.ceil(immunityImg.width * immunityImgScale * immunityImgScaleFactor)) / 2;
    let dy = (canvas.height - Math.ceil(immunityImg.height * immunityImgScale * immunityImgScaleFactor)) / 2;
    ctx.drawImage(immunityImg, dx, dy,
        Math.ceil(immunityImg.width * immunityImgScale * immunityImgScaleFactor),
        Math.ceil(immunityImg.height * immunityImgScale * immunityImgScaleFactor)
    );

    let nopescale = Math.min(canvas.width / nopeimg.width, canvas.height / nopeimg.height);
    dx = (canvas.width - Math.ceil(nopeimg.width * nopescale)) / 2;
    dy = (canvas.height - Math.ceil(nopeimg.height * nopescale)) / 2;
    ctx.drawImage(nopeimg, dx, dy, Math.ceil(nopeimg.width * nopescale), Math.ceil(nopeimg.height * nopescale));

    return canvas;
}

function generateImmuneCreepImage(immunityEffectImage, creepType) {
    if (immunityEffectImage === null || (immunityEffectImage instanceof Image && !immunityEffectImage.complete)
            || creepType.image == null || (creepType.image instanceof Image && !creepType.image.complete))
        return null;

    let canvas = document.createElement("canvas");
    canvas.width = creepType.image.width;
    canvas.height = creepType.image.height;
    let ctx2 = canvas.getContext("2d");

    ctx2.drawImage(creepType.image, 0, 0);
    let immunityeffectscale = Math.min(creepType.image.width / immunityEffectImage.width, creepType.image.height / immunityEffectImage.height) / 2;
    let dx = creepType.image.width - Math.ceil(immunityEffectImage.width * immunityeffectscale);
    ctx2.drawImage(immunityEffectImage, dx, 0, Math.ceil(immunityEffectImage.width * immunityeffectscale), Math.ceil(immunityEffectImage.height * immunityeffectscale));

    return canvas;
}

let _immunecreepTypeId = 1;
function ImmuneCreep(creepType, immunityTypes, immunityImg, immunityImgScale, probabilities, persistent) {
    let canvas = null;
    // Callbacks! :)))
    // Borde kanske göras med async eller nåt men det känns som ett helt eget projekt att hålla på och byta ut allt så
    let tmp = () => {
        let tmp2 = () => {
            canvas = generateImmunityEffectImage(immunityImg, immunityImgScale);

            let tmp3 = () => {
                let onload = (_immuneCreep.image || {}).onload;
                _immuneCreep.image = generateImmuneCreepImage(canvas, creepType);
                if (onload)
                    onload();
            };
            if (creepType.image instanceof Image) {
                if (creepType.image.complete)
                    tmp3();
                else
                    creepType.onload = tmp3;
            }
        };
        if (nopeimg.complete)
            tmp2();
        else
            nopeimg.onload = tmp2;
    };

    function _immuneCreep() {
        const c = new creepType();
        c.addEffect(new Immunity(immunityTypes, canvas, probabilities, persistent));
		return c;
	};
    _immuneCreep.prototype = creepType;
    _immuneCreep.image = { complete: false, onload: null };
    _immuneCreep._immunecreepTypeId = _immunecreepTypeId++;

    if (immunityImg.complete)
        tmp();
    else
        immunityImg.onload = tmp;

	return _immuneCreep;
}

class Immunity extends BaseEffect {

    constructor(types, img, probabilities, persistent) {
		super(Number.POSITIVE_INFINITY);
        this.immunities = types instanceof Array ? types : [types];
        probabilities = probabilities || 1;
        this.probabilities = probabilities instanceof Array ? probabilities : new Array(this.immunities.length).fill(probabilities);
        if (this.immunities.length !== this.probabilities.length)
            throw new Error("Probabilities and Immunities lengths must match");
        this.image = img;
        this.persistent = !!persistent;
	}
	init(object) {
        let tmp = object.onHit.bind(object);
        object.onHit = (projectile) => {
            let ind = this.immunities.findIndex(i => i === projectile.constructor);
            if (ind === -1 || Math.random() > this.probabilities[ind])
                tmp(projectile);
		};

        let tmp2 = object.addEffect.bind(object);
		object.addEffect = (effect) => {
            let ind = this.immunities.findIndex(i => i === effect.constructor);
            if (ind === -1 || Math.random() > this.probabilities[ind])
                tmp2(effect);
		};
	}
}