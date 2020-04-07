let jonasimg = new Image();
jonasimg.src = "img/jonas.png";


// Sorry f�r formuleringen men "creep" �r tydligen termen som anv�nds
class Jonas extends BaseCreep {
    constructor() {
        super(jonasimg, 0.05, controller.map, 0.03);
    }
    onGoal() {
        console.log("Jonas got you!");
        super.onGoal();

    }
    update(gameArea) {
        if (!(this.x === this.lastx && this.y === this.lasty))
            this.angle = Math.PI / 2 + Math.atan2(this.y - this.lasty, this.x - this.lastx);
        super.update(gameArea);
    }
}

let jonasimg2 = new Image();
jonasimg2.src = "img/jonas3.png";

class SuperSonicJonas extends BasicProjectile {
    constructor(map, source, target) {
        super(map, jonasimg2, source.x, source.y, target.x, target.y, 0.03, 1 / controller.updateInterval);
    }
}


let helmerimg = new Image();
helmerimg.src = "img/helmer1.png";

class Helmer extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 800; }
    static get image() { return helmerimg; }
    static get scale() { return 0.03; }

    projectile(target) {
        return new SuperSonicJonas(this.map, this, target);
    }
}

let omnihelmer = new Image();
omnihelmer.src = "img/helmer2.png";

let oneliner = new Image();
oneliner.src = "img/oneliner.png";
let splash = new Image();
splash.src = "img/boom.png";

class OneLiner extends SplashProjectile {
    constructor(map, source, target) {
        super(map, oneliner, splash, source.x, source.y, target.x, target.y, 0.1, 1, 2 / controller.updateInterval, 0);
        this.range = 2.5;
    }
}

class OmniHelmer extends OmniTower {
    static get range() { return 2.5; }
    static get CDtime() { return 2500; }
    static get image() { return omnihelmer; }
    static get scale() { return 0.04; }

    projectile(target) {
        return new OneLiner(this.map, this, target);
    }
}

let helmer3 = new Image();
helmer3.src = "img/helmer3.png";
let keytar = new Image();
keytar.src = "img/keytar.png";


class Shoreline extends BaseEffect {
    constructor(object) {
        super(5000 / controller.updateInterval);
        object.speed /= 2;
    }
    apply(object) {
        object.speed *= 2;
        this.remove(object);
    }
}

class Keytar extends SplashProjectile {
    constructor(source, target) {
        super(controller.map, keytar, splash, source.x, source.y, target.x, target.y, 0.1, 1, 1 / controller.updateInterval, 0);
        this.range = 4;
    }
    hitCreep(creep) {
        let e = new Shoreline(creep);
        creep.addEffect(e);
    }
}

class KeytarHelmer extends TargetingTower {
    static get range() { return 2; }
    static get CDtime() { return 1500; }
    static get image() { return helmer3; }
    static get scale() { return 0.04; }

    projectile(target) {
        return new Keytar(this, target);
    }
}

let jonasimg3 = new Image();
jonasimg3.src = "img/gk.png";
let tb = new Image();
tb.src = "img/tb.png";


class Runaway extends BaseEffect {
    constructor(object) {
        super(5000 / controller.updateInterval);
        if(object.speed > 0)
            object.speed = -object.speed;
    }
    apply(object) {
        object.speed = Math.abs(object.speed);
        this.remove(object);
    }
}

class ToiletBrush extends SeekingProjectile {
    constructor(source, target){
        super(tb, 0.05, source, target, 3 / controller.updateInterval);
        console.log(target);
    }
    hitCreep(creep) {
        let e = new Runaway(creep);
        creep.addEffect(e);
    }
}

class GKJonas extends TargetingTower {
    static get range() { return 5; }
    static get CDtime() { return 500; }
    static get image() { return jonasimg3; }
    static get scale() { return 0.08; }

    // update(gameArea){
    //     super.update(gameArea);
    // }

    target(){
        let pt = super.target();
        if(pt)
            return pt.arbitraryCreep();
        return null;
    }

    projectile(target){
        return new ToiletBrush(this, target);
    }

}