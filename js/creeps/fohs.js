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
    console.log(doors[i]);
}


class BaseFohs extends BaseCreep {

    constructor(x,y){
        super(x,y);
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
    static get health() { return 30; }
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

    onHit(projectile){
        const maxdist = controller.map.path.length - 1;
    	for (var i = -1; i < 2; i++) {
    		new Ninja(Math.max(0, Math.min(maxdist, this.distance+i)));
    	}
    	super.onHit(projectile);
    }

}

class SF_1 extends BaseFohs {
    static get speed() { return 0.65; }
    static get image() { return sfimg; }
    static get scale() { return 0.2; }
    static get health() { return 60; }
    static get drawHealthBar() { return true; }
    static get value() { return 50; }

    onHit(projectile) {
        if(projectile instanceof Hug){
            // SF kramas inte!
            this.health -= projectile.constructor.damage*2;
        }
        super.onHit(projectile);
    }
}

class OF_1 extends BaseFohs {
    static get speed() { return 0.5; }
    static get image() { return ofimg; }
    static get scale() { return 0.2; }
    static get health() { return 18; }
    static get drawHealthBar() { return true; }
    static get value() { return 75; }

    constructor(distance) {
    	super(distance);
    	this.cooldown = 2000 / controller.updateInterval;
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
