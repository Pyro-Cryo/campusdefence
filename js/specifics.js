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

let ofimg = new Image();
ofimg.src = "img/transparent/of.png";

let sfimg = new Image();
sfimg.src = "img/transparent/sf.png";

let tfimg = new Image();
tfimg.src = "img/transparent/tf.png";

class TF_1 extends BaseCreep {
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

class SF_1 extends BaseCreep {
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

class OF_1 extends BaseCreep {
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

/* ---------- Towers and Projectiles ---------- */

class Converted extends BaseEffect {
    constructor() {
        super(5000 / controller.updateInterval);
    }
    init(object){
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
	static get damage() { return 0; }
    constructor(source, target){
        super(flowerimg, 0.12, source, target, 2 / controller.updateInterval);
    }
    hitCreep(creep) {
        let e = new Converted();
        creep.addEffect(e);
        super.hitCreep(creep);
    }
}

let nicoleimg = new Image();
nicoleimg.src = "img/transparent/nicole.png";

class Nicole extends TargetingTower {
    static get range() { return 3; }
    static get CDtime() { return 1000; }
    static get image() { return nicoleimg; }
    static get scale() { return 0.2; }
    static get cost() { return 500; }
    static get name() { return "Fjädrande Nicole"; }
    static get desc() { return "Fina Nicole älskar blommor. När en ninja blir träffad av en blomma inser den hur fel den haft, och ger sig av hemåt igen. Insikten varar tyvärr dock bara några sekunder varpå ninjan fortsätter framåt."; }

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
molotovimg.src = "img/cocktail.png";

class Molotov extends SplashProjectile {
    constructor(map, source, target) {
        super(map, molotovimg, explosionimg, source, target.x, target.y, 0.1, 1, 2 / controller.updateInterval, 0);
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
    static get cost() { return 600; }
    static get name() { return "Fjädrande Axel"; }
    static get desc() { return "Fackliga Axel älskar två saker: facklor och att festa. Han bjuder gärna alla omkring sig på Molotovcocktails, och när dessa exploderar träffar de alla ninjor inom ett visst område."; }

    projectile(target) {
        return new Molotov(this.map, this, target);
    }
}

class Distracted extends BaseEffect {
    constructor() {
        super(5000 / controller.updateInterval);
    }
    init(object){
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
	static get damage() { return 0; }
    constructor(source, target) {
        super(controller.map, wolframimg, splashimg, source, target.x, target.y, 0.1, 1, 1 / controller.updateInterval, 0);
        this.range = 4;
    }
    hitCreep(creep) {
        let e = new Distracted();
        creep.addEffect(e);
        super.hitCreep(creep);
    }
}

let fridaimg = new Image();
fridaimg.src = "img/transparent/frida.png";

class Frida extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 1500; }
    static get image() { return fridaimg; }
    static get scale() { return 0.2; }
    static get cost() { return 400; }
    static get name() { return "Fjädrande Frida"; }
    static get desc() { return "Fuskande Frida lägger inte ifrån sig sin avstängda mobil på anvisad plats. När hon skickar lösningarna till lämnisarna till en grupp ninjor försöker de läsa och gå samtidigt, men simultanförmåga är en bristvara hos ninjor."; }

    projectile(target) {
        return new Wolfram(this, target);
    }
}

let fireimg = new Image();
fireimg.src = "img/fire.png";

class Fire extends BasicProjectile {
    constructor(map, source, target) {
        super(map, fireimg, source, target.x + Math.random() - 0.5, target.y + Math.random() - 0.5, 1, 1 / controller.updateInterval);
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
    static get cost() { return 400; }
    static get name() { return "Fjädrande Becca"; }
    static get desc() { return "Flamberande Becca har en eldkastare."; }

    projectile(target) {
        return new Fire(this.map, this, target);
    }
}

let fnoellimg = new Image();
fnoellimg.src = "img/transparent/lillie.png";

class Fnoell extends BaseTower {
    static get range() { return 2; }
    static get CDtime() { return 1000; }
    static get image() { return fnoellimg; }
    static get scale() { return 0.17; }

    static get DPS() { return 8; }
    static get JumpCD() { return 2000; }
    static get TimeBetweenJumps() { return 1000; }

    static get cost() { return 700 }
    static get name() { return "Fjädrande Lillie-Fnöll"; }
    static get desc() { return "Lillie-Fnöll studsar runt över hela campus och kramar alla hon ser! Hon tycker särskilt mycket om att svänga förbi ensamma ninjor som de andra faddrarna glömt bort."; }

    constructor(x, y) {
        super(x, y);
        this.fireangle = 0;
        this.leftToFire = -1;
        this.DPS = this.constructor.DPS;
        this.spiralCD = this.constructor.CDtime / this.DPS;
        this.spiralTimer = 0;
        this.timeWithoutTarget = 0;
        this.currentTarget = null;
    }

    projectile(target) {
        return new Hug(this.map, this, target);
    }

    fire(target) {
        this.leftToFire = this.DPS;
        if (this.timeWithoutTarget > 100)
            this.fireangle = Math.atan2(target.y - this.y, target.x - this.x);
        this.CDtimer = this.CDtime;
    }

    update() {
        if (this.leftToFire > 0)
        {
            this.spiralTimer -= controller.updateInterval;
            if (this.spiralTimer <= 0)
            {
                this.spiralTimer += this.spiralCD;
                controller.registerObject(new Hug(this.map, this, {x: this.x + Math.cos(this.fireangle), y: this.y + Math.sin(this.fireangle)}));
                this.fireangle = (this.fireangle + 2 * Math.PI / this.DPS) % (2 * Math.PI);
                this.leftToFire--;
            }
            this.timeWithoutTarget = 0;
        } else
            this.timeWithoutTarget += controller.updateInterval;

        if (this.timeWithoutTarget >= this.constructor.JumpCD) {
            this.jump();
            this.timeWithoutTarget -= this.constructor.TimeBetweenJumps;
        }
        
        super.update();
    }

    jump() {
        let bestX = null;
        let bestY = null;
        let best = null;
        
        let target = null;
        for (let i = 0; i < this.map.path.length; i++)
            if (this.map.path[i].hasCreep())
                target = this.map.path[i];

        if (target !== null)
            for (let x = -2; x <= 2; x++)
                for (let y = -2; y <= 2; y++)
                    if (Math.abs(x) + Math.abs(y) === 3
                            && this.map.visiblePosition(this.x + x, this.y + y)
                            && this.map.getGridAt(this.x + x, this.y + y) === null)
                    {
                        let distsqr = Math.pow(this.x + x - target.x, 2) + Math.pow(this.y + y - target.y, 2);
                        if (!best || distsqr < best)
                        {
                            best = distsqr;
                            bestX = this.x + x;
                            bestY = this.y + y;
                        }
                    }
        
        if (bestX !== null && bestY !== null)
        {
            this.map.removeTower(this);
            this.x = bestX;
            this.y = bestY;
            this.map.addTower(this);
            this.inrange = this.pathInRange();
        }
        this.currentTarget = target;
    }
}

let hugimg = new Image();
hugimg.src = "img/kram.png";

class Hug extends BasicProjectile {
    constructor(map, source, target) {
        super(map, hugimg, source, target.x, target.y, 0.1, 2 / controller.updateInterval);
        this.angle = 0;
        this.range = source.range + 1;
    }
}

let fadderimg = new Image();
fadderimg.src = "img/gab.png";

class Fadder extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 800; }
    static get image() { return fadderimg; }
    static get scale() { return 0.18; }
    static get cost() { return 200; }
    static get name() { return "Fadder"; }
    static get desc() { return "En vanlig fadder som kramar ninjor den ser. Faddern åstadkommer kanske inte så mycket, men i slutändan måste man inte alltid göra det för att vara lycklig här i livet. Det är ändå vännerna man vinner på vägen som räknas."; }

    projectile(target) {
        return new Hug(this.map, this, target);
    }

    configUpgrades() {
		this.addUpgrade(
			TakeAwayCoffee, 
			"Take away kaffe", 
			"Ge faddern lite kaffe så jobbar den snabbare.", 
			150, 
			[], 
			[TakeAwayCoffee],
			20);
    }
}

let forfadder1img = new Image();
forfadder1img.src = "img/jonas3.png";

let forfadder2img = new Image();
forfadder2img.src = "img/helmer2.png";

class Forfadder1 extends TargetingTower {
    static get range() { return 4; }
    static get CDtime() { return 600; }
    static get image() { return forfadder2img; }
    static get scale() { return 0.2; }
    static get cost() { return 350; }
    static get name() { return "Förfadder"; }
    static get desc() { return "En förfadder är som en fadder, fast med extra mycket kärlek att ge. En förfadder både kramar snabbare och når längre med sina kramar än en vanlig fadder."; }

    projectile(target) {
        return new Hug(this.map, this, target);
    }
}

// class Forfadder2 extends TargetingTower {
//     static get range() { return 5; }
//     static get CDtime() { return 800; }
//     static get image() { return forfadder2img; }
//     static get scale() { return 0.18; }

//     projectile(target) {
//         let hug = new Hug(this.map, this, target);
//         hug.range = this.range;
//         return hug;
//     }
// }

let gameoverimg = new Image();
gameoverimg.src = "img/gameover.jpg";

class SplashScreen extends GameObject {
    constructor() {
        super(gameoverimg, (controller.map.gridInnerWidth - 1) / 2, (controller.map.gridInnerHeight - 1) / 2, 0, 0.35);
    }
}

class CaffeinKick extends BaseEffect {
    constructor() {
        super(5000 / controller.updateInterval);
    }
    init(object){
        object.CDtime /= 2;
    }
    apply(object){
    	this.remove(object);
    }
    remove(object) {
        object.CDtime *= 2;
        super.remove(object);
    }
}

let coffeempty = new Image();
let coffeefull = new Image();
coffeempty.src = "img/coffemaker-empty.png";
coffeefull.src = "img/coffemaker-full.png";

class CoffeMaker extends SupportTower {

	static get range() { return 4; }
	static get CDtime() {return  5000;}
	static get image() { return coffeempty; }
	static get scale() { return 0.18; }
    static get cost() { return 1200; }
    static get name() { return "Kaffekokare"; }
    static get desc() { return "Inget får fysiker att studsa upp så snabbt från sina stolar som Konsulatets kaffekokare. Kaffe gör att en student jobbar dubbelt så snabbt som vanligt, men tyvärr räcker inte kaffet så länge, och snart är det tomt i kannan igen."; }

    configUpgrades() {
    	this.addUpgrade(
    		MakeCoffe, 
    		"Sätt på kaffe", 
    		"Gör en kanna kaffe och ge dina torn en rejäl boost i fem sekunder.", 
    		10, 
    		[], 
    		[],
    		-1);
    }

	constructor(x,y) {
		super(x,y);
		this.CDtimer = this.constructor.CDtime;
		this.apply();
	}
	apply() {
		console.log("Putting coffee on!");
		this.image = coffeefull;
		this.effectCDtimer = this.effectCDtime;
		super.apply();
	}
	remove() {
		console.log("Out of coffee!");
		this.image = coffeempty;
		super.remove();
	}
	applyTo(tower) {
		let c = new CaffeinKick();
		tower.addEffect(c);
	}
}

class MakeCoffe extends Gadget {

    // The tower's sprite
    static get image() { return null; }
    // The tower's sprite's scale
    static get scale() { return 1; }

	addTo(tower){
		tower.apply();
	}

	draw(gameArea){
	}

}

let takeawaycup = new Image();
takeawaycup.src = "img/coffee-takeaway.png";

class TakeAwayCoffee extends Gadget {

	static get image() { return takeawaycup; }
	static get scale() { return 0.5; }

	addTo(tower) {
		tower.CDtime *= 0.75;
		tower.addGadget(this);
	}

}