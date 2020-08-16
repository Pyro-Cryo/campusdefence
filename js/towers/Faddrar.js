
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
			[TakeAwayCoffee, Mek2],
			20);
		this.addUpgrade(
			Mek1, 
			"Mekanik grundkurs", 
			"I mek I kursen får en lära sig om statik och partikeldynamik, vilket ger bättre förståelse för de banrörelser som faddern behöver ta för att nå fram med sina kramar. Efter avslutad kurs har faddern lite längre räckvidd.", 
			150, 
			[], 
			[Mek1],
			20);
		this.addUpgrade(
			Mek2, 
			"Mekanik fortsättningskurs", 
			"I mek II kursen får en lära sig om dynamik och rörelse i roterande koordinatsystem. Efter avklarad kurs har faddern väldigt mycket bättre förståelse för rörelser och därför ännu längre räckvidd.",
			300, 
			[Mek1],
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

    constructor(x,y){
    	super(x,y);

    	this.projectiletype = 1;
    }

    projectile(target) {
    	if(this.projectiletype == 1)
        	return new Hug(this.map, this, target);
        else if(this.projectiletype == 2){
        	let a = Math.atan2(this.x-target.x, this.y-target.y) + Math.PI/2;
        	let da = Math.PI/8;
        	return [
        		new Hug(this.map, this, target),
        		new Hug(this.map, this, {x: this.x + Math.cos(a+da), y: this.y - Math.sin(a+da)}),
        		new Hug(this.map, this, {x: this.x + Math.cos(a-da), y: this.y - Math.sin(a-da)})
        		];
        }
    }

    configUpgrades() {
		this.addUpgrade(
			TakeAwayCoffee, 
			"Take away kaffe", 
			"Ge faddern lite kaffe så jobbar den snabbare.", 
			200, 
			[], 
			[TakeAwayCoffee],
			30);
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
