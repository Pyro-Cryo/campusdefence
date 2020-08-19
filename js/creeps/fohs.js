let ofimg = new Image();
ofimg.src = "img/transparent/of.png";

let sfimg = new Image();
sfimg.src = "img/transparent/sf.png";

let tfimg = new Image();
tfimg.src = "img/transparent/tf.png";

let doors = [];
for (var i = 0; i < 5; i++) {
    let img = new Image();
    img.src = "img/door" + (i+1).toString() + ".png";
    doors.push(img);
}


class BaseFohs extends BaseCreep {

    constructor(distance){
        super(distance);
        this.despawnTime = doors.length*3;
        this.fudge = 7;
    }

    update(){
        if(this.despawnTimer >= 0){
            let dt = this.despawnTime / doors.length;
            for (var i = 0; i < doors.length; i++) {
                if(this.despawnTimer >= this.despawnTime+this.fudge - dt*(i+1)){
                    this.image = doors[i];
                    break;
                }
            }
        }
        super.update();
    }

    onGoal(){
        controller.hp -= this.health;
        this.despawn();
    }

    addEffect(effect) {
        if(effect instanceof Converted){
            effect = new Distracted(effect.cooldown*controller.updateInterval*0.8);
            effect.multiplier = Math.sqrt(effect.multiplier);
        }

        super.addEffect(effect);
    }

    onDeath(){
        super.onDeath();
        this.scale = 1.0;
        // this.image = doors[0];
        this.angle = 0;
        this.despawnTimer = this.despawnTime + this.fudge;
    }

}

class TF_1 extends BaseFohs {
    static get speed() { return 0.35; }
    static get image() { return tfimg; }
    static get scale() { return 0.2; }
    static get health() { return 23; }
    static get drawHealthBar() { return true; }
    static get value() { return 50; }

    addEffect(effect) {
        // TF har oändlig fokus
        if(effect instanceof Converted)
            return;
        if(effect instanceof Distracted)
            return;
        super.addEffect(effect);
    }

    static get creepCount() { return 3; }
    static get spread() { return 1; }
    static get ninjaType() { return Ninja; }

    onHit(projectile){
        const maxdist = controller.map.path.length - 1;
        let low = -Math.floor(this.constructor.creepCount/2);
        let high = Math.ceil(this.constructor.creepCount/2);
        let type = this.constructor.ninjaType;
        console.log(low, high);
    	for (var i = low; i < high; i++) {
    		new type(Math.max(0, Math.min(maxdist, this.distance+i*this.constructor.spread)));
    	}
    	super.onHit(projectile);
    }

}


class SF_1 extends BaseFohs {
    static get speed() { return 0.7; }
    static get image() { return sfimg; }
    static get scale() { return 0.2; }
    static get health() { return 80; }
    static get drawHealthBar() { return true; }
    static get value() { return 50; }

    onHit(projectile) {
        if(projectile instanceof Hug){
            // SF kramas inte!
            projectile.damage *= 2;
        }
        else{
            projectile.damage = 1;
        }
        super.onHit(projectile);
    }
}

class OF_1 extends BaseFohs {
    static get speed() { return 0.5; }
    static get image() { return ofimg; }
    static get scale() { return 0.2; }
    static get health() { return 20; }
    static get drawHealthBar() { return true; }
    static get value() { return 75; }
    static get cooldown() { return 1000; }

    constructor(distance) {
    	super(distance);
    	this.cooldown = this.constructor.cooldown / controller.updateInterval;
    	this.cdTimer = 0;
    }

    addEffect(effect) {
        // ÖF kan inte konverteras
        if(effect instanceof Converted)
            return;
        super.addEffect(effect);
    }

    update() {
    	if(this.cdTimer > 0){
    		this.cdTimer--;
    	}
    	super.update();
    }

    onHit(projectile) {
        // ÖF slår tillbaka! 
        if(this.cdTimer == 0){
	        let proj = new Payback(this, projectile.sourceTower);
	        controller.registerObject(proj);
	        this.cdTimer = this.cooldown;
	    }
        
        super.onHit(projectile);
    }

}

class TF_2 extends TF_1 {
    static get health() { return TF_1.health + 8; }
    static get speed(){ return 0.5; }
    static get creepCount() { return TF_1.creepCount+2; }
    static get ninjaType() { return Red; }
}

class SF_2 extends SF_1 {
    static get health() { return Math.floor(SF_1.health*1.4); }
    static get speed(){ return 0.5; }
}

class OF_2 extends OF_1 {
    static get health() { return OF_1.health + 12; }
    static get cooldown() { return 950; }
    static get speed(){ return 0.5; }
}

class TF_3 extends TF_2 {
    static get health() { return TF_2.health + 8; }
    static get ninjaType() { return Blue; }
}

class SF_3 extends SF_2 {
    static get health() { return Math.floor(SF_2.health*1.4); }
}

class OF_3 extends OF_2 {
    static get health() { return OF_1.health + 15; }
    static get cooldown() { return 850; }
}

class TF_inf extends TF_1 {
    static get creepCount() { 
        if(controller.levelNumber < 30)
            return 3;
        if(controller.levelNumber < 40)
            return 5;
        return 7;
    }
    static get spread() { return 3/TF_inf.creepCount; }
    static get ninjaType() { 
        if(controller.levelNumber < 30)
            return Pink;
        if(controller.levelNumber < 40)
            return Green;
        if(controller.levelNumber < 50)
            return Violet;
        return Orange;
    }
    constructor(distance){
        super(distance);
        this.speed = 0.5;
        this.health = controller.levelNumber * 3;
    }
}

class SF_inf extends SF_1 {
    constructor(distance){
        super(distance);
        this.speed = 0.5;
        this.health = controller.levelNumber * 9;
    }
}

class OF_inf extends OF_1 {
    constructor(distance){
        super(distance);
        this.speed = 0.5;
        this.cooldown *= 50/controller.levelNumber;
        this.health = Math.floor(controller.levelNumber * 2.5);
    }
}


let pbimg = new Image();
pbimg.src = "img/boom.png";
class Payback extends InverseProjectile {

    constructor(source, target){
        super(pbimg, source, target, 0.5, 1/controller.updateInterval);

    }
    hitTower(tower) {
        tower.CDtimer = 4000 / controller.updateInterval + tower.CDtime;
    }
}
