
let hugimg = new Image();
hugimg.src = "img/kram.png";
let patchimg = new Image();
patchimg.src = "img/patch.png";

class Hug extends BasicProjectile {
    constructor(map, source, target) {
        super(map, hugimg, source, target.x, target.y, 0.1, 2 / controller.updateInterval);
        this.angle = 0;
        this.range = source.range + 1;
    }
}

class Patch extends Hug {

    constructor(map, source, target) {
        super(map, source, target);
        this.image = patchimg;
        this.scale = 0.5;
    }

    hitCreep(creep){
        controller.money++;
        super.hitCreep(creep);
    }
}



let fadderimg = new Image();
fadderimg.src = "img/gab.png";

class Fadder extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 800; }
    static get image() { return fadderimg; }
    static get scale() { return 0.17; }
    static get cost() { return 180; }
    static get name() { return "Fadder"; }
    static get desc() { return "En vanlig fadder som kramar ninjor den ser. Faddern åstadkommer kanske inte så mycket, men i slutändan måste man inte alltid göra det för att vara lycklig här i livet. Det är ändå vännerna man vinner på vägen som räknas."; }

    constructor(x,y){
        super(x,y);
        this.projectiletype = 1;
        this.activetargeting = false;
        this.maxhits = 1;
    }

    target(){
        let creep = super.target();
        if(creep === null)
            return null;

        if(!this.activetargeting)
            return creep;

        let dist = Math.sqrt(Math.pow(this.x - creep.x, 2) + Math.pow(this.y - creep.y, 2));
        let ticks = dist / 2;

        let distance = creep.distance + creep.speed*ticks;
        if(distance >= controller.map.path.length - 1){
            distance = controller.map.path.length -1;
        }

        let pos = controller.map.getPosition(distance);
        return {x:pos[0], y:pos[1]};
    }

    projectileType(){
        return Hug;
    }

    projectileInfo() {
        let info = {
            name: "Kram",
            image: hugimg,
            "Skada": 1,
            "Specialeffekt": "Ingen"
        };
        if (this.projectiletype === 2)
            info["Extra kramar"] = 2;
        if (this.maxhits !== 1)
            info["Träffar per skott"] = this.maxhits;

        return info;
    }

    projectile(target) {

        let type = this.projectileType();

        if(this.projectiletype == 1){
            let proj = new type(this.map, this, target);
            proj.hitpoints = this.maxhits;
            return proj;
        }

        else if(this.projectiletype == 2){
            let a = Math.atan2(this.x-target.x, this.y-target.y) + Math.PI/2;
            let da = Math.PI/8;
            let arr = [
                new type(this.map, this, target),
                new Hug(this.map, this, {x: this.x + Math.cos(a+da), y: this.y - Math.sin(a+da)}),
                new Hug(this.map, this, {x: this.x + Math.cos(a-da), y: this.y - Math.sin(a-da)})
                ];
            arr[0].hitpoints = this.maxhits;
            arr[1].hitpoints = this.maxhits;
            arr[2].hitpoints = this.maxhits;
            return arr;
        }
        return null;
    }

    configUpgrades() {
		this.addUpgrade(
			TakeAwayCoffee, 
			"Take away kaffe", 
			"Ge faddern lite kaffe så jobbar den snabbare.", 
			100, 
			[], 
			[TakeAwayCoffee],
			0);
        this.addUpgrade(
            Mek1, 
            "SG1130 Mekanik I", 
            "I grundkursen i Mekanik får en lära sig om statik och partikeldynamik, vilket ger bättre förståelse för de banrörelser som faddern behöver ta för att nå fram med sina kramar. Efter avslutad kurs har faddern lite längre räckvidd.", 
            80, 
            [], 
            [Mek1],
            30);
        this.addUpgrade(
            Mek2, 
            "SG1140 Mekanik II", 
            "I fortsättningskursen i Mekanik får en lära sig om dynamik och rörelse i roterande koordinatsystem. Efter avklarad kurs har faddern väldigt mycket bättre förståelse för rörelser och därför ännu längre räckvidd.",
            120, 
            [Mek1],
            [Mek2], 
            50);
        this.addUpgrade(
            Regler,
            "EL1000 Regler",
            "Genom att noga justera attackvinkeln utifrån ninjornas position och hastighet blir det ännu svårare för ninjorna att undvika faddrarnas kramar.",
            250,
            [Mek1, Mek2],
            [Regler],
            250
            );
        this.addUpgrade(
            Hallf,
            "SE1050 Hållf",
            "Genom att öka den strukturella integriteten kan varje kram nu omfamna flera ninjor innan den är förbrukad.",
            250,
            [Mek1, Mek2],
            [Hallf, Kvant],
            150);
        this.addUpgrade(
            Kvant,
            "SI1151 Kvant",
            "Genom att försätta sig i en superposition kan faddern krama flera ninjor samtidigt.",
            350,
            [Mek1, Mek2],
            [Kvant, Hallf],
            150
            );
    }
}

let forfadder2img = new Image();
forfadder2img.src = "img/helmer2.png";

class Forfadder1 extends Fadder {
    static get range() { return 4; }
    static get CDtime() { return 600; }
    static get image() { return forfadder2img; }
    static get scale() { return 0.2; }
    static get cost() { return 320; }
    static get name() { return "Förfadder"; }
    static get desc() { return "En förfadder är som en fadder, fast med extra mycket kärlek att ge. En förfadder både kramar snabbare och når längre med sina kramar än en vanlig fadder."; }

    constructor(x,y){
        super(x,y);
        this.makemoney = false;
    }

    projectileType(){
        if(this.makemoney)
            return Patch;
        return Hug;
    }

    projectileInfo() {
        let info = super.projectileInfo();
        if (this.makemoney) {
            info.name = "Märke";
            info.image = patchimg;
            info["Specialeffekt"] = "Få 💰1 per träff";
        }
        return info;
    }

    configUpgrades() {
        super.configUpgrades();

        this.addUpgrade(
            Markeshets,
            "nØllegruppsmärken",
            "Alla gillar märken, speciellt ninjor! För varje märke förfaddern säljer tjänar Mottagningen lite pengar.",
            750,
            [],
            [Markeshets],
            250
            );
    }
}

class CaffeinKick extends BaseEffect {
    constructor() {
        super(5000 / controller.updateInterval);
        this.multiplier = 1.41;
    }
    init(object){
        object.CDtime /= this.multiplier;
    }
    apply(object){
        this.remove(object);
    }
    remove(object) {
        object.CDtime *= this.multiplier;
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
        this.applied = false;
    }
    apply() {
        if(this.applied)
            return;
        this.image = coffeefull;
        this.effectCDtimer = this.effectCDtime;
        this.applied = true;
        super.apply();
    }
    remove() {
        this.applied = false;
        this.image = coffeempty;
        this.gadgets = this.gadgets.filter(function(obj){
            return obj instanceof CaffeinKick;
        }.bind(this));
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
