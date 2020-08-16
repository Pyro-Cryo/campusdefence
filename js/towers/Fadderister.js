
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
