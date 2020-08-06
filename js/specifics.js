/* ---------- Creeps ---------- */

let fohsimg = new Image();
fohsimg.src = "img/fohs.png";

class Ninja extends BaseCreep {
    static get speed() { return 0.5; }
    static get image() { return fohsimg; }
    static get scale() { return 1; }
}

let colorimgs = [new Image(), new Image(), new Image(), new Image(), new Image()];
colorimgs[0].src = "img/fohs_red.png";
colorimgs[1].src = "img/fohs_blue.png";
colorimgs[2].src = "img/fohs_pink.png";
colorimgs[3].src = "img/fohs_green.png";
colorimgs[4].src = "img/fohs_orange.png";

class ColorNinja extends MatryoshkaCreep {
    static get scale() { return 1; }
    static get innerCreepCount() { return 2; }
}

class Red extends ColorNinja {
    static get speed() { return 0.55; }
    static get image() { return colorimgs[0]; }
    static get innerCreep() { return Ninja; }
}
class Blue extends ColorNinja {
    static get speed() { return 0.6; }
    static get image() { return colorimgs[1]; }
    static get innerCreep() { return Red; }
}
class Pink extends ColorNinja {
    static get speed() { return 0.65; }
    static get image() { return colorimgs[2]; }
    static get innerCreep() { return Blue; }
}
class Green extends ColorNinja {
    static get speed() { return 0.7; }
    static get image() { return colorimgs[3]; }
    static get innerCreep() { return Pink; }
}
class Orange extends ColorNinja {
    static get speed() { return 0.75; }
    static get image() { return colorimgs[4]; }
    static get innerCreep() { return Green; }
}

/*let gabbeimg = new Image();
gabbeimg.src = "img/gab.png";

class Gabbe extends MatryoshkaCreep {
    static get speed() { return 0.2; }
    static get image() { return gabbeimg; }
    static get scale() { return 0.1; }
    static get innerCreep() { return Ninja; }
    static get innerCreepCount() { return 2; }
    static get health() { return 20; }
    static get drawHealthBar() { return true; }
    static get value() { return 50; }
}*/

/*let fohsimg2 = new Image();
fohsimg2.src = "img/bluefohs.png";

class FastNinja extends MatryoshkaCreep {
    static get speed() { return 1; }
    static get image() { return fohsimg2; }
    static get scale() { return 1; }
    static get innerCreep() { return Gabbe; }
}*/

/* ---------- Towers and Projectiles ---------- */
//TODO: Många bilder behöver bytas och/eller fixas

class Converted extends BaseEffect {
    constructor(object) {
        super(5000 / controller.updateInterval);
        if (object.speed > 0)
            object.speed = -object.speed;
    }
    apply(object) {
        object.speed = Math.abs(object.speed);
        this.remove(object);
    }
}

let flowerimg = new Image();
flowerimg.src = "img/flower.png";

class Flower extends SeekingProjectile {
    constructor(source, target){
        super(flowerimg, 0.05, source, target, 3 / controller.updateInterval);
    }
    hitCreep(creep) {
        let e = new Converted(creep);
        creep.addEffect(e);
    }
}

let nicoleimg = new Image();
nicoleimg.src = "img/transparent/nicole.png";

class Nicole extends TargetingTower {
    static get range() { return 3; }
    static get CDtime() { return 1000; }
    static get image() { return nicoleimg; }
    static get scale() { return 0.03; }

    target() {
        let pt = super.target();
        if (pt)
            return pt.arbitraryCreep();
        return null;
    }

    projectile(target) {
        return new Flower(this, target);
    }
}

let explosionimg = new Image();
explosionimg.src = "img/boom.png";
let molotovimg = new Image();
molotovimg.src = "img/tb.png"; //TODO: hitta en bild

class Molotov extends SplashProjectile {
    constructor(map, source, target) {
        super(map, molotovimg, explosionimg, source.x, source.y, target.x, target.y, 0.1, 1, 2 / controller.updateInterval, 0);
        this.range = 2.5;
    }
}

let axelimg = new Image();
axelimg.src = "img/transparent/axel.png";

class Axel extends OmniTower {
    static get range() { return 2.5; }
    static get CDtime() { return 2500; }
    static get image() { return axelimg; }
    static get scale() { return 0.2; }

    projectile(target) {
        return new Molotov(this.map, this, target);
    }
}

class Distracted extends BaseEffect {
    constructor(object) {
        super(5000 / controller.updateInterval);
        object.speed /= 2;
    }
    apply(object) {
        object.speed *= 2;
        this.remove(object);
    }
}

let wolframimg = new Image();
wolframimg.src = "img/integral.png";
let splashimg = new Image();
splashimg.src = "img/boom.png";

class Wolfram extends SplashProjectile {
    constructor(source, target) {
        super(controller.map, wolframimg, splashimg, source.x, source.y, target.x, target.y, 0.1, 1, 1 / controller.updateInterval, 0);
        this.range = 4;
    }
    hitCreep(creep) {
        let e = new Distracted(creep);
        creep.addEffect(e);
    }
}

let fridaimg = new Image();
fridaimg.src = "img/transparent/frida.png";

class Frida extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 1500; }
    static get image() { return fridaimg; }
    static get scale() { return 0.2; }

    projectile(target) {
        return new Wolfram(this, target);
    }
}

let fireimg = new Image();
fireimg.src = "img/fire.png";

class Fire extends BasicProjectile {
    constructor(map, source, target) {
        super(map, fireimg, source.x, source.y, target.x + Math.random() - 0.5, target.y + Math.random() - 0.5, 1, 1 / controller.updateInterval);
        this.ignoreTile = null;
        this.lastTile = null;
        this.range = 2;
    }

    hit(pathTile) {
        if (pathTile !== this.lastTile)
            this.ignoreTile = Math.random() < 0.3;
        this.lastTile = pathTile;
        if (!this.ignoreTile)
            super.hit(pathTile);
    }
}

let beccaimg = new Image();
beccaimg.src = "img/transparent/becca.png";

class Becca extends TargetingTower {
    static get range() { return 2; }
    static get CDtime() { return 250; }
    static get image() { return beccaimg; }
    static get scale() { return 0.2; }

    projectile(target) {
        return new Fire(this.map, this, target);
    }
}

let hugimg = new Image();
hugimg.src = "img/kram.png";

class Hug extends BasicProjectile {
    constructor(map, source, target) {
        super(map, hugimg, source.x, source.y, target.x, target.y, 0.1, 1 / controller.updateInterval);
        this.angle = 0;
    }
}

let fadderimg = new Image();
fadderimg.src = "img/gab.png";

class Fadder extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 800; }
    static get image() { return fadderimg; }
    static get scale() { return 0.03; }

    projectile(target) {
        return new Hug(this.map, this, target);
    }
}

let forfadder1img = new Image();
forfadder1img.src = "img/jonas3.png";

let forfadder2img = new Image();
forfadder2img.src = "img/helmer3.png";

class Forfadder1 extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 400; }
    static get image() { return forfadder1img; }
    static get scale() { return 0.04; }

    projectile(target) {
        return new Hug(this.map, this, target);
    }
}

class Forfadder2 extends TargetingTower {
    static get range() { return 4; }
    static get CDtime() { return 800; }
    static get image() { return forfadder2img; }
    static get scale() { return 0.03; }

    projectile(target) {
        let hug = new Hug(this.map, this, target);
        hug.range = this.range;
        return hug;
    }
}

let gameoverimg = new Image();
gameoverimg.src = "img/gameover.jpg";

class SplashScreen extends GameObject {
    constructor() {
        super(gameoverimg, (controller.map.gridInnerWidth - 1) / 2, (controller.map.gridInnerHeight - 1) / 2, 0, 0.35);
    }
}