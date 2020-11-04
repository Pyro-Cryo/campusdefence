
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
    static get range() { return Fadder.range+1; }
    static get CDtime() { return Fadder.CDtime-200; }
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

let geleimg = new Image();
geleimg.src = "img/gele.png";

class JellyHeart extends BasicProjectile {

    static get damage() { return 1; }
    static get hitpoints() { return 20; }
    static get persistent() { return true; }
    static get drawHealthBar() { return true; }

    constructor(pathtile){
        super(controller.map, geleimg, {x:pathtile.x, y:pathtile.y, range:1, hits:0}, 0, 0, PseudoJellyHeartTower.scale, 0);
        this.x = pathtile.x + (Math.random()-0.5)*0.5;
        this.y = pathtile.y + (Math.random()-0.5)*0.5;
        this.angle = (Math.random()-0.5)*Math.PI;
    }

    hitCreep(creep) {
        super.hitCreep(creep);
        controller.hitsFromSoldTowers[PseudoJellyHeartTower.name]++;
    }
}

class PseudoJellyHeartTower extends BaseTower {
        // Range in grid units
    static get range() { return 0.9; }
    // The tower's sprite
    static get image() { return geleimg; }
    // The tower's sprite's scale
    static get scale() { return 0.7; }
    static get cost() { return Math.round(JellyHeart.hitpoints*2); }
    static get name() { return "Gelehjärtan"; }
    static get desc() { return "Att få ett gelehjärta är nästan som att få en kram. Men se upp, ninjornas kärlek är dyrköpt. Kommer med 20 gelehallon per ask. Kan innehålla spår av nötter."; }

    constructor(x,y) {
        // super() ska inte köras här. Vi använder bara torn-klassen för att kunna köpa våra geleprojektiler

        // När vi "köper tornet" spawnar vi en projektil på pathen och sedan despawnar vi oss själva, dvs lägger inte till oss nånstans.
        let p = new JellyHeart(controller.map.getGridAt(x,y));
        controller.registerObject(p);

        // constructors måste returnera nånting om de inte kallar på super()
        return p;
    }
}

let delicatoimg = new Image();
delicatoimg.src = "img/delicato.png";

class DelicatoBoll extends JellyHeart {

    static get damage() { return JellyHeart.damage+1; }

    constructor(pathtile){
        super(pathtile);
        this.image = delicatoimg;
        this.scale = 0.2;
    }
}

let teleobjektivimg = new Image();
teleobjektivimg.src = "img/teleobjektiv.png";

class Teleobjektiv extends Gadget {

    static get image() { return teleobjektivimg; }
    static get scale() { return 0.25; }

    addTo(tower) {
        tower.range += 1.5;
        super.addTo(tower);
    }
}

let autofocusimg = new Image();
autofocusimg.src = "img/autofocus.png";

class Autofocus extends Gadget {

    static get image() { return autofocusimg; }
    static get scale() { return 0.25; }

    addTo(tower) {
        tower.CDtime *= 0.8;
        super.addTo(tower);
    }
}

let bigflashimg = new Image();
bigflashimg.src = "img/extern_flash.png";

class ExternFlash extends Gadget {

    static get image() { return bigflashimg; }
    static get scale() { return 0.3; }

    addTo(tower) {
        tower.flash_power = 1.5;
        super.addTo(tower);
    }
}


let aftonbladetimg = new Image();
aftonbladetimg.src = "img/aftonbladet.png";

class Aftonbladet extends Gadget {

    static get image() { return aftonbladetimg; }
    static get scale() { return 0.25; }

    addTo(tower) {
        tower.aftonbladet = true;
        super.addTo(tower);
    }
}

let skvallerpressimg = new Image();
skvallerpressimg.src = "img/skvallerpress.png";
class Skvallerpress extends Gadget {

    static get image() { return skvallerpressimg; }
    static get scale() { return 0.25; }

    addTo(tower) {
        tower.skvallerpress = true;
        super.addTo(tower);
    }
}

let forceimg = new Image();
forceimg.src = "img/force.png";
class Force extends Gadget {

    static get image() { return forceimg; }
    static get scale() { return 0.25; }

    addTo(tower) {
        tower.force = true;
        super.addTo(tower);
    }
}

let flashimg = new Image();
flashimg.src = "img/flash.png";
class Stunned extends BaseEffect {

    static get image() { return flashimg; }
    static get scale() { return 0.05; }

    constructor(time) {
        super(time / controller.updateInterval);
    }
    init(object){
        this.speed = object.speed;
        object.speed = 0;
        super.init(object);
    }
    apply(object) {
        object.speed = this.speed;
        this.remove(object);
    }
}

class Flash extends OmniProjectile {

    static get hitpoints() { return 10; }
    static get damage() { return 0; }
    static get stunDuration() { return 1000; }

    constructor(source, damage) {
        super(source, flashimg, 0.75, 50);
        this.stunDuration = Flash.stunDuration;
        if (damage)
            this.damage = damage;
    }
    hitCreep(creep) {
        let b = new Stunned(this.stunDuration);
        creep.addEffect(b);

        super.hitCreep(creep);
    }
}


let feliximg = new Image();
feliximg.src = "img/felix.png";
class MediaFadder extends TargetingTower {

    static get range() { return 2.5; }
    // Cooldown time for projectiles, in ms
    static get CDtime() { return 2500; }
    // The tower's sprite
    static get image() { return feliximg; }
    // The tower's sprite's scale
    static get scale() { return 0.2; }
    static get cost() { return 500; }
    static get name() { return "Mediafadder"; }
    static get desc() { return "Omelett! Mediafaddrarna dokumenterar mottagningen och ninjorna vill såklart vara med på bild. Så fort kameran åker fram stannar de och poserar, oftast med tillhörande fula grimaser."; }

    constructor(x, y) {
        super(x, y);
        this.aftonbladet = false;
        this.skvallerpress = false;
        this.force = false;
        this.flash_power = 1;
    }

    projectileInfo() {
        let info = {
            name: "Blixt",
            image: flashimg,
            "Skada": this.force ? 1 : 0,
            "Får plats i bild": Flash.hitpoints * this.flash_power,
            "Specialeffekt": `Stannar ninjorna i ${Flash.stunDuration / 1000} s`
        };
        if (this.skvallerpress)
            ; // Lägg till i Specialeffekt

        return info;
    }

    projectile(target) {
        // Create and return a new projectile object, that is targeted at target
        let p = new Flash(this, this.force ? 1 : 0);
        p.hitpoints *= this.flash_power;
        return p;
    }

    configUpgrades() {
        this.addUpgrade(
            Autofocus,
            "Autofokus",
            "När kameran själv hittar rätt inställningar kan mediafaddern fokusera på att fota snabbare.",
            100,
            [],
            [Autofocus],
            0);
        this.addUpgrade(
            Teleobjektiv,
            "Teleobjektiv",
            "Med teleobjektiv kan man ta bilder på folk jättelångt bort!",
            150,
            [Autofocus],
            [Teleobjektiv],
            50);
        this.addUpgrade(
            ExternFlash,
            "Kraftigare blixt",
            "Mer energi innebär större räckvidd och fler ninjor som träffas. Med den här jätteblixten kan 50% fler ninjor bländas samtidigt.",
            300,
            [Autofocus],
            [ExternFlash],
            150);
        this.addUpgrade(
            Force,
            "The Force",
            "Mediafaddern publicerar bilderna i sektionstidningen. Ninjornas vänner skrattar gott åt de roliga bilderna, och för ett tag är ninjorna känsliga för andra attacker, men snart kommer ett nytt nummer och effekten går över.",
            300,
            [],
            [Force, Skvallerpress, Aftonbladet],
            100);
        this.addUpgrade(
            Skvallerpress,
            "Hänt! Extra",
            "Mediafaddern hänger ut ninjornas fyllebilder i skvallerpressen. Pinsamheten av att ha betett sig som en f.d. finansminister gör att ninjorna tar psykisk skada.",
            100,
            [],
            [Force, Skvallerpress],
            50);
        this.addUpgrade(
            Aftonbladet,
            "Aftonbladet",
            "Mediafaddern tipsar kvällstidningarna som publicerar artiklar om hur ninjorna inte respekterar Coronarestriktionerna. Ögontjänare som de är ser ninjorna till att hålla social distansering inom kamerornas räckvidd.",
            1000,
            [Skvallerpress, Teleobjektiv],
            [Force, Aftonbladet],
            150);
    }
}


let foodmakerimg = new Image();
foodmakerimg.src = "img/jonas.png";

class MatBeredare extends SupportTower {

	static get range() { return 2.5; }
	static get CDtime() {return  7500;}
	static get image() { return foodmakerimg; }
	static get scale() { return 0.15; }
	static get cost() { return 750; }
	static get name() { return "Matberedare"; }
	static get desc() { return "Inte ens Fadderiet orkar kramas på fastande mage. Tack och lov för matberedarna, som lyckas försörja hela mottagningen med energi."; }


	configUpgrades() {
		super.configUpgrades();

		this.addUpgrade(
			Snackbar,
			"Godisskåpet",
			"I konsulatets godisskåp finns alltid nånting sött att finna. Matberedaren köper gelehjärtan för Mottagningens interrep-pengar och bjuder alla ninjor hen ser.",
			750,
			[],
			[Snackbar, CoffeMaker],
			0
			);
        this.addUpgrade(
            Delicato,
            "Delicatobollar",
            "Delicatobollarna är tveklöst det mest åtråvärda i godisskåpet. De går åt dubbelt så fort som vanliga gelehjärtan.",
            800,
            [Snackbar],
            [Delicato],
            250
            );
        this.addUpgrade(
            ExpressDelivery,
            "Express-leverans",
            "Istället för att åka och handla själv beställer CdA godis med express-leverans, så att godisskåpet kan sälja mångdubbelt mer godis.",
            1000,
            [Snackbar],
            [ExpressDelivery],
            250
            );
		this.addUpgrade(
			CoffeMaker,
			"Kaffekokare",
			"Inget får fysiker att studsa upp så snabbt från sina stolar som Konsulatets kaffekokare, och när matberedaren kommer med kaffe jobbar alla faddrar i närheten mycket snabbare.",
			750,
			[],
			[Snackbar, CoffeMaker],
			0
			);
		this.addUpgrade(
			Pasta,
			"Pastasallad",
			"Det är svårt att slå en bra pastasallad, och när faddrarna har fått lite mat orkar de springa längre och kan nå ännu fler ninjor.",
			400,
			[],
			[Snackbar, Pasta],
			0
			);
		this.addUpgrade(
			Chili,
			"Chilistyrka",
			"Matberedarna har i några chilifrukter i maten för att få till lite hetta. Hur många chilifrukter blir det nu igen om vi ska skala upp receptet från 4 personer till 200? Äsch ta allihopa bara.",
			750,
			[],
			[Snackbar, CoffeMaker],
			0
			);
	}

	constructor(x,y){
		super(x,y);
		this.chili = false;
		this.snackbar = false;
		this.coffee = false;
		this.pasta = false;

		this.multiplier = 0.9;

		this.apply();
	}

	applyTo(tower){

		if(this.chili){

			// Injicera vår Buring-effect på alla projektiler. Bäst att inte läsa
			// för noga hur det faktiskt går till...
			if(tower.raw_projectile == undefined)
				tower.raw_projectile = tower.projectile;

			tower.projectile = function(target){
				let p = tower.raw_projectile(target);
				p.raw_hitCreep = p.hitCreep;
				p.hitCreep = function(creep){
					let e = new Burning();
					creep.addEffect(e);
					p.raw_hitCreep(creep);
				}.bind(p);
				return p;
			}.bind(tower);
		}

		if(this.coffee)
			tower.CDtime *= this.multiplier;

		if(this.pasta)
			tower.range += 0.6;

	}

	removeFrom(tower){
		if(tower.raw_projectile != undefined){
			tower.projectile = tower.raw_projectile;
			tower.raw_projectile = undefined;
		}

		if(this.coffee)
			tower.CDtime /= this.multiplier;

		if(this.pasta)
			tower.range -= 0.6;
	}

	target(){
		return this.inrange[parseInt(Math.random()*this.inrange.length)];
	}

	projectile(target) {
		if(this.snackbar){
            if (this.projectiletype == 1)
                var p = new JellyHeart(target);
            else if (this.projectiletype == 2)
                var p = new DelicatoBoll(target);

			p.onHitCreep = function(){
				this.hits++;
			}.bind(this);
			return p;
		}
		return null;
	}
}


let coffeempty = new Image();
let coffeefull = new Image();
coffeempty.src = "img/coffemaker-empty.png";
coffeefull.src = "img/coffemaker-full.png";

class CoffeMaker extends Gadget {

	static get image(){ return coffeefull; }
	static get scale(){ return 0.09; }


	addTo(tower){
		tower.remove();
		tower.coffee = true;
		super.addTo(tower);
		tower.apply();
	}
}

let snackimg = new Image();
snackimg.src = "img/soda.png";
class Snackbar extends Gadget {

	static get image() { return snackimg; }
	static get scale() { return 0.25; }

	addTo(tower){
		tower.snackbar = true;
        tower.projectiletype = 1;
		super.addTo(tower);
	}
}

class Delicato extends Gadget {

    static get image() { return delicatoimg; }
    static get scale() { return 0.18; }

    addTo(tower){
        tower.projectiletype = 2;
        super.addTo(tower);
    }
}

let expressimg = new Image();
expressimg.src = "img/delivery.png";
class ExpressDelivery extends Gadget {

    static get image() { return expressimg; }
    static get scale() { return 0.15; }

    addTo(tower){
        tower.CDtime *= 0.6;
        super.addTo(tower);
    }

}

let chiliimg = new Image();
chiliimg.src = "img/chili.png";
class Chili extends Gadget {

    static get image() { return chiliimg; }
    static get scale() { return 0.25; }

    addTo(tower){
        tower.remove();
        tower.chili = true;
        super.addTo(tower);
        tower.apply();
    }
}

let pastaimg = new Image();
pastaimg.src = "img/pasta.png";
class Pasta extends Gadget {

    static get image() { return pastaimg; }
    static get scale() { return 0.3; }

    addTo(tower){
        tower.remove();
        tower.pasta = true;
        super.addTo(tower);
        tower.apply();
    }
}
