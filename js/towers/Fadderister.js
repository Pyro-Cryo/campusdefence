
class AntiImmunity extends BaseEffect {

	static get image() { return null; }
	static get scale() { return 1; }
	static get persistent() { return true; }

	constructor(time, immunities){
		super(time);

		this.antiImmunities = immunities;
		this.removedImmunities = [];
	}

	init(object){

		for (var it = object.effects.values(), effect=null; effect=it.next().value; ){
			if (!(effect instanceof Immunity))
				continue;

			let removed = [];
			for (var i = 0; i < effect.immunities.length; i++) 
				if (this.antiImmunities.includes(effect.immunities[i].constructor.name)){

					this.removedImmunities.push([effect, effect.immunities[i], effect.probabilities[i]])
					removed.push(i);
				}
			for (var i = removed.length - 1; i >= 0; i--) {
				effect.immunities.splice(removed[i], 1);
				effect.probabilities.splice(removed[i], 1);
			}
		}

		super.init(object);
	}

	apply(object){

		for (var i = 0; i < this.removedImmunities.length; i++) {
			this.removedImmunities[i][0].immunities.push(this.removedImmunities[i][1]);
			this.removedImmunities[i][0].probabilities.push(this.removedImmunities[i][2])
		}
		this.remove(object);
	}
}

class Converted extends BaseEffect {
    static get image() { return flowerimg; }
    static get scale() { return 0.35; }

    init(object){
        if (object.speed > 0)
            object.speed = -object.speed;
        object.timesConverted = (object.timesConverted || 0) + 1;
        if (object.timesConverted >= 10 && Math.random() < object.timesConverted / 5)
            object.onHit({ damage: 1 });
        super.init(object);
    }
    apply(object) {
        object.speed = Math.abs(object.speed);
        this.remove(object);
    }
}

class Tentacula extends BaseEffect {
	static get image() { return tentaculaimg; }
	static get scale() { return 0.35; }
	static get persistent() { return true; }

	apply(object){
		object.health -= 1;
		if(object.health <= 0){
			object.onDeath();
			return;
		}
	}
}

let zombieimg = new Image();
zombieimg.src = "img/flowers/gmo-tentacula.png";
class Zombie extends Tentacula {
	static get image() { return zombieimg; }
	static get scale() { return 0.35; }

	apply(object){
		// Sprider sig
		let pt = controller.map.getGridAt(Math.round(object.x), Math.round(object.y));
		let creep = pt.randomCreep();
		if(creep === null || creep.id === object.id)
			return;
		creep.addEffect(new this.constructor(this.cdtime));

		// Gör skada
		super.apply(object);
	}
}

let roseimg = new Image();
roseimg.src = "img/flowers/ros.png";
class Rose extends AntiImmunity {
	static get image() { return roseimg; }
	static get scale() { return 0.35; }
	constructor(time){
		super(time, [Hug, Distracted, PersistentDistracted]);
	}
}

let firespinnerimg = new Image();
firespinnerimg.src = "img/flowers/fire-spinner.png";
class FireSpinner extends AntiImmunity {
	static get image() { return firespinnerimg; }
	static get scale() { return 0.35; }

	constructor(time){
		super(time, [Fire, HotFire, FireBomb, FireRing, Burning]);
	}
}

let kransimg = new Image();
kransimg.src = "img/flowers/krans.png";
class MidsommarKrans extends AntiImmunity {
	static get image() { return kransimg; }
	static get scale() { return 0.1; }

	constructor(time){
		super(time, [Molotov, Drunk]);
	}
}

let nattblomimg = new Image();
nattblomimg.src = "img/flowers/nattblomma.png";
class Nattblomm extends AntiImmunity {
	static get image() { return nattblomimg; }
	static get scale() { return 0.35; }

	constructor(time){
		super(time, [Flash, ForceFlash, Stunned, Weak]);
	}
}

let qonimg = new Image();
qonimg.src = "img/flowers/queenofnight.png";
class QueenOfNight extends AntiImmunity {
	static get image() { return qonimg; }
	static get scale() { return 0.35; }

	constructor(time){
		// Vad ska föhseriet vara svaga mot?
		super(time, [Hug]);
	}

	init(object){
		// påverkar bara föhseriet, annars ger skada. Kanske är dåligt?
		if (object instanceof BaseFohs)
			super.init(object);
		else {
			object.health -= 1;
			if (object.health <= 0)
				object.onDeath();
		}

	}
}

let flowerimg = new Image();
flowerimg.src = "img/flowers/flower.png";
class Flower extends SeekingProjectile {
	static get damage() { return 0; }

	constructor(target, source, effect, damage, time, image, scale) {
		super(image, scale, source, target, 1.5 / controller.updateInterval);
		this.effect = effect;
		this.time = time;
	}

	hitCreep(creep){
		let e = new this.effect(this.time);
		creep.addEffect(e);
		super.hitCreep(creep);
	}
}

let bouquet = new Image();
bouquet.src = "img/flowers/bouquet.png";
class Bouquet extends SplashProjectile {
	static get damage() { return 0; }
	static get maxHits() { return 10; }

	constructor(target, source, effect, damage, time, image, scale) {
		super(controller.map, image, splashimg, source, target.x, target.y, scale, 1.5, 2 / controller.updateInterval, 1);
		this.effect = effect;
		this.time = time;	
	}	

	hitCreep(creep){
		let e = new this.effect(this.time);
		creep.addEffect(e);
		super.hitCreep(creep);
	}
}

let harvesterimg = new Image();
harvesterimg.src = "img/flowers/harvester.png";
class MonoCulture extends BasicProjectile {
	static get hitpoints() { return 200; }
	static get damage() { return 3; }

	constructor(target, source, effect, damage, time, image, scale){
		super(controller.map, harvesterimg, source, target.x, target.y, 0.4, 0.3 / controller.updateInterval);

		// super(source, image, scale, delay);
		this.range = source.range * 2;
		this.target = target;
		this.effect = effect;
		this.time = time;
	}

	// hitCreep(creep){
	// 	let e = new this.effect(this.time);
	// 	creep.addEffect(e);
	// 	super.hitCreep(creep);
	// }
}

let nutrient = new Image();
nutrient.src = "img/nutrients.png";
class Nutrient extends Gadget {

	static get image(){ return nutrient; }
	static get scale(){ return 0.2; }

	addTo(tower){
		tower.CDtime *= 0.7
		super.addTo(tower);
	}
}

class BouquetGadget extends Gadget {
	static get image() { return bouquet; }
	static get scale() { return 0.5; }

	addTo(tower){
		tower.projectiletype = Bouquet;
		super.addTo(tower);
	}
}

let vaseimg = new Image();
vaseimg.src = "img/flowers/vase.png";
class Vase extends Gadget {
	static get image() { return vaseimg; }
	static get scale() { return 0.2; }

	addTo(tower){
		tower.effect_time *= 2;
		super.addTo(tower);
	}
}

let rosesimg = new Image();
rosesimg.src = "img/flowers/rosor.png";
class Roses extends Gadget {
	static get image() { return rosesimg; }
	static get scale() { return 0.2; }

	addTo(tower){
		tower.effects_avail.push(Rose);
		super.addTo(tower);
	}
}

class Midsummers extends Gadget {
	static get image() { return kransimg; }
	static get scale() { return 0.2; }

	addTower(tower) {
		tower.effects_avail.push(MidsommarKrans);
		super.addTo(tower);
	}
}

let nattblomimg2 = new Image();
nattblomimg2.src = "img/flowers/nattblom.png";
class NightFlower extends Gadget {
	static get image() { return nattblomimg2; }
	static get scale() { return 0.2; }

	addTo(tower){
		tower.effects_avail.push(Nattblomm);
		super.addTo(tower);
	}
}

let firespinnersimg = new Image();
firespinnersimg.src = "img/flowers/fire-spinners.png";
class FireFlower extends Gadget {
	static get image() { return firespinnersimg; }
	static get scale() { return 0.2; }

	addTo(tower){
		tower.effects_avail.push(FireSpinner);
		super.addTo(tower);
	}
}

let quonsimg = new Image();
quonsimg.src = "img/flowers/queenofnights.png";
class QueenOfNightGadget extends Gadget {
	static get image() { return quonsimg; }
	static get scale() { return 0.2; }

	addTo(tower){
		tower.effects_avail.push(QueenOfNight);
		super.addTo(tower);
	}
}

let pollenimg = new Image();
pollenimg.src = "img/flowers/pollen.png";
class Pollen extends Gadget {
	static get image() { return pollenimg; }
	static get scale() { return 0.5; }

	addTo(tower){
		tower.damage += 1;
		tower.damageChance = 0.3;
		super.addTo(tower);
	}
}

let tentaculaimg = new Image();
tentaculaimg.src = "img/flowers/tentacula.png";
class TentaculaGadget extends Gadget {
	static get image() { return tentaculaimg; }
	static get scale() { return 0.5; }

	addTo(tower){
		tower.damageChance = 1;
		tower.effects_avail = [Tentacula];
		super.addTo(tower);
	}
}

let gmoimg = new Image();
gmoimg.src = "img/flowers/gmo-tentacula.png";
class ZombieGadget extends Gadget {
	static get image() { return gmoimg; }
	static get scale() { return 0.5; }

	addTo(tower){
		tower.effects_avail = [Zombie];
		super.addTo(tower);
	}
}

let cornfieldimg = new Image();
cornfieldimg.src = "img/flowers/cornfield.png";
class MonoCultureGadget extends Gadget {
	static get image() { return cornfieldimg; }
	static get scale() { return 0.5; }

	addTo(tower){
		tower.projectiletype = MonoCulture;
		tower.damage = MonoCulture.damage;
		tower.damageChance = 1;
		tower.CDtime *= 5;
		super.addTo(tower);
	} 
}

let nicoleimg = new Image();
nicoleimg.src = "img/transparent/nicole.png";
class Nicole extends TargetingTower {
	static get range() { return 3; }
	static get CDtime() { return 1000; }
	static get image() { return nicoleimg; }
	static get scale() { return 0.2; }
	static get cost() { return 300; }
	static get name() { return "Fjädrande Nicole"; }
	static get desc() { return "Fina Nicole älskar blommor. När en ninja blir träffad av en blomma inser den hur fel den haft, och ger sig av hemåt igen. Insikten varar tyvärr dock bara några sekunder varpå ninjan fortsätter framåt."; }

	constructor(x,y){
		super(x,y);
		this.effects_avail = [Converted];
		this.effect_time = 1000 / controller.updateInterval;
		this.damage = 0;
		this.damageChance = 0;
		this.projectiletype = Flower;
	}

	target() {
		let pt = super.target();
		if (pt && pt instanceof PathTile)
			return pt.arbitraryCreep();
		return pt;
    }

	projectile(target) {
		let i = parseInt(Math.random()*this.effects_avail.length);
		let e = this.effects_avail[i];
		let p = new this.projectiletype(target, this, e, this.damage, this.effect_time, e.image, e.scale*1.5);

		if (this.damageChance == 1 || Math.random() < this.damageChance)
			p.damage = this.damage;

		return p;
	}

	projectileInfo() {

	}

	configUpgrades() {
		this.addUpgrade(
			Nutrient,
			"Växtnäring",
			"Med lite näring får Nicole blommorna att växa snabbare.",
			100,
			[],
			[Nutrient],
			0);
		this.addUpgrade(
			Vase,
			"Vas",
			"Ställer en blommorna i en vas med vatten kommer de klara sig längre.",
			180,
			[],
			[Vase, TentaculaGadget, ZombieGadget],
			0);
		this.addUpgrade(
			BouquetGadget,
			"Bukett",
			"Genom avancerade matematiska resonemang har Nicole kommit fram till att genom att skjuta flera blommor samtidigt kan hon träffa fler Ninjor.",
			300,
			[Nutrient],
			[BouquetGadget],
			100
			)
		this.addUpgrade(
			Roses,
			"Rosor",
			"Inget säger 'jag älskar dig' som en ros, och när Nicole ger Ninjorna de röda blommorna kan inte ens de mest hårdnackade Ninjor säga nej till en kram.",
			400,
			[],
			[Pollen, TentaculaGadget, Roses, MonoCultureGadget],
			500
			);
		this.addUpgrade(
			Midsummers,
			"Midsommarkrans",
			"Nånting med midsommar och alkoholhets.",
			800,
			[],
			[Pollen, TentaculaGadget, Midsummers, MonoCultureGadget],
			500
			);
		this.addUpgrade(
			NightFlower,
			"Nattblomm",
			"Natten är rovdjurens och datalogernas tid, och med en nattblomma i håret blir vem som helst lite skygg för starkt ljus.",
			700,
			[],
			[Pollen, TentaculaGadget, NightFlower, MonoCultureGadget],
			500
			);
		this.addUpgrade(
			FireFlower,
			"Eldsblomma",
			"Flammande orange-röda blommor i eldens färger.",
			900,
			[],
			[Pollen, TentaculaGadget, FireFlower, MonoCultureGadget],
			500
			);
		this.addUpgrade(
			QueenOfNightGadget,
			"Nattens drottning",
			"'Queen of Night' är en av de mörkaste av alla tulpaner. Den har en sidenglänsande blomma i mörkt kastanjebrunt, nästan svart. Sorten är gammal, framtagen kring tidernas begynnelse 1938. Enligt legenden innehåller den en enorm, uråldrig kraft som enbart ett fåtal kan tämja...",
			1000,
			[Pollen, Roses, Midsummers, NightFlower, FireFlower],
			[TentaculaGadget, QueenOfNightGadget, MonoCultureGadget],
			1000
			);
		this.addUpgrade(
			Pollen,
			"Pollenallergi",
			"Genom att noggrant välja blommor kan Nicole utnyttja att vissa ninjor har pollenallergi och tar skada istället för att vända om.",
			100,
			[],
			[Pollen, Roses, Midsummers, NightFlower, FireFlower, QueenOfNightGadget],
			10
			);
		this.addUpgrade(
			TentaculaGadget,
			"Köttätande blommor",
			"Det finns fina blommor, fula blommor och så finns det köttätande blommor.",
			300,
			[Nutrient, Pollen],
			[TentaculaGadget, Vase, Roses, Midsummers, NightFlower, FireFlower, QueenOfNightGadget, MonoCultureGadget],
			50);
		this.addUpgrade(
			ZombieGadget,
			"Zombie-plantor",
			"Genom genmodifiering har Niclor skapat en kombination av Köttätande väster och parasiter. Dessa blommor skadar inte bara den ninja de klänger sig fast på, utan sprider sig också vidare till andra ninjor i närheten.",
			800,
			[Nutrient, Pollen, TentaculaGadget],
			[ZombieGadget, Vase, Roses, Midsummers, NightFlower, FireFlower, QueenOfNightGadget, MonoCultureGadget],
			150);
		this.addUpgrade(
			MonoCultureGadget,
			"Industriell odling",
			"Genom att använda moderna industriella redskap kan Nicole nå en aldrig tidigare skådad effektivitet och förse nästan hela campus med blommor.",
			2500,
			[Nutrient, Pollen, BouquetGadget],
			[MonoCultureGadget, Roses, Midsummers, NightFlower, FireFlower, QueenOfNightGadget, TentaculaGadget],
			500);
	}
}

let distractedimg = new Image();
distractedimg.src = "img/questionmark.png";

class Distracted extends BaseEffect {

    static get image() { return distractedimg; }
    static get scale() { return 0.5; }

    constructor(time) {
        super(time / controller.updateInterval);
        this.multiplier = 2;
    }
    init(object) {
        object.speed /= this.multiplier;
        object.cheater = true;
    }
    apply(object) {
        object.speed *= this.multiplier;
        this.remove(object);
    }
}

class PersistentDistracted extends Distracted {
    static get persistent() { return true; }
}

let wolframimg = new Image();
wolframimg.src = "img/paper.png";
let splashimg = new Image();
splashimg.src = "img/papersplash.png";

class Wolfram extends SplashProjectile {
    static get damage() { return 0; }
    static get maxHits() { return 3; }
    constructor(source, target, time, maxhits, persistent, damage) {
        super(controller.map, wolframimg, splashimg, source, target.x, target.y, 0.5, 1.5, 1 / controller.updateInterval, 0);
        this.range = 4;
        this.time = time;
        this.maxHits = maxhits;
        this.persistent = persistent;
        this.damage = damage;
    }
    hitCreep(creep) {
        let e;
        if (this.persistent)
            e = new PersistentDistracted(this.time);
        else
            e = new Distracted(this.time);
        creep.addEffect(e);
        // Förbered för diciplinnämnden
        creep.cheater = true;
        super.hitCreep(creep);
    }
}



let pb1 = new Image();
pb1.src = "img/pb1.png";
let pb2 = new Image();
pb2.src = "img/pb2.png";
let blackboard = new Image();
blackboard.src = "img/blackboard.png";
let fpaper = new Image();
fpaper.src = "img/fpaper.png";
let paperstack = new Image();
paperstack.src = "img/paperstack.png";


class Envarre extends Gadget {

    static get image() { return pb1; }
    static get scale() { return 0.45; }

    addTo(tower) {
        tower.time += 1500;
        tower.maxHits += 2;
        super.addTo(tower);
    }
}

class Flervarre extends Gadget {

    static get image() { return pb2; }
    static get scale() { return 0.45; }

    addTo(tower) {
        tower.time += 1500;
        tower.maxHits += 5;
        tower.persistent = true;
        super.addTo(tower);
    }
}

class Blackboard extends Gadget {

    static get image() { return blackboard; }
    static get scale() { return 0.45; }

    addTo(tower) {
        tower.maxHits += 12;
        // tower.splashrange = 1;
        super.addTo(tower);
    }
}

class Errors extends Gadget {

    static get image() { return fpaper; }
    static get scale() { return 0.5; }

    addTo(tower) {
        tower.projectiledamage += 1;
        tower.projectileimg = fpaper;
        super.addTo(tower);
    }

}

class FullSolution extends Gadget {

    static get image() { return paperstack; }
    static get scale() { return 0.5; }

    addTo(tower) {
        tower.projectiledamage += 1;
        tower.projectileimg = paperstack;
        super.addTo(tower);
    }
}

class Diciplinary extends Gadget {

    static get image() { return null; }
    static get scale() { return 1; }
    static get cheatingNinjasRatio() { return 1 / 3; }
    static get costPerCreep() { return 10; }

    addTo(tower) {
        // gothrough all creeps, and kill them
        const costPerCreep = Math.round(Diciplinary.costPerCreep * (tower.discount_multiplier || 1));
            
        controller.map.path.forEach(pathTile => pathTile.data.forEach(creep => {
            if (creep instanceof BaseFohs) // Föhseriet fuskar inte, de vinner på stilpoäng
                return;
            if (creep.cheater === undefined)
                creep.cheater = Math.random() < Diciplinary.cheatingNinjasRatio; // 2/3 ninjor fuskar inte, i alla fall inte innan de mött Frida
            if (!creep.cheater)
                return;

            if (controller.money >= costPerCreep)
                controller.money -= costPerCreep;
            else
                return;
            if (creep instanceof MatryoshkaCreep)
                creep.innerCreepCount = 0;
            creep.onDeath();
        }));
    }
}



let fridaimg = new Image();
fridaimg.src = "img/transparent/frida.png";

class Frida extends TargetingTower {
    static get range() { return 2.5; }
    static get CDtime() { return 1500; }
    static get image() { return fridaimg; }
    static get scale() { return 0.2; }
    static get cost() { return 370; }
    static get name() { return "Fjädrande Frida"; }
    static get desc() { return "Fuskande Frida lägger inte ifrån sig sin avstängda mobil på anvisad plats. När hon skickar lösningarna till lämnisarna till en grupp ninjor försöker de läsa och gå samtidigt, men simultanförmåga är en bristvara hos ninjor."; }

    constructor(x, y) {
        super(x, y);

        this.projectileimg = null;
        this.time = 4000;
        this.maxHits = 3;
        this.persistent = false;
        this.splashrange = 0;
        this.projectiledamage = 0;
    }

    projectile(target) {
        let proj = new Wolfram(this, target, this.time, this.maxHits, this.persistent, this.projectiledamage);

        proj.splash_range = this.splashrange;
        if (this.projectileimg)
            proj.image = this.projectileimg;

        return proj;
    }

    projectileInfo() {
        let info = {
            name: this.projectileimg === paperstack ? "Felaktigt Lösningshäfte" : this.projectileimg === fpaper ? "Felaktiga Lösningsförslag" : "Lösningsförslag",
            image: this.projectileimg || wolframimg,
            "Skada": this.projectiledamage,
            "Splashträffar": this.maxHits === Number.POSITIVE_INFINITY ? "∞" : this.maxHits,
            "Specialeffekt": (this.persistent ? "Ihållande distrahering" : "Distrahering") + " i " + (this.time / 1000) + " s",
            "Distrahering": "50% lägre hastighet på ninjor" + (this.persistent ? " (sitter kvar på inre ninjor)" : "")
        };

        return info;
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
        this.addUpgrade(
            Blackboard,
            "Svarta tavlan",
            "Genom att lämna lösningarna på svarta tavlan där alla kan se kan Frida nå nästan alla Ninjor inom synhåll.",
            150,
            [],
            [Blackboard],
            50);
        this.addUpgrade(
            Envarre,
            "SF1625 Envarre",
            "Med djupare förståelse kan Frida skriva komplexare integraler, utveckla fler av uttrycken och skriva 'inses lätt', vilket gör att Ninjorna tar ännu längre på sig att läsa lösningarna.",
            200,
            [],
            [Envarre, FullSolution],
            50);
        this.addUpgrade(
            Flervarre,
            "SF1626 Flervarre",
            "Genom att skriva lösningar i flera variabler blir lösningarna ännu komplexare, vilket ger Ninjorna huvudvärk. Genom att lämna delar av lösningarna 'som övning till läsaren' tar det Ninjorna ännu längre att dechiffrera Fridas lösningar.",
            400,
            [Envarre],
            [Flervarre, FullSolution],
            150);
        this.addUpgrade(
            Errors,
            "Felaktiga lösningar",
            "Genom att smyga in små fel i lösningarna kommer de ninjor som tar emot dem inte få några bonuspoäng till tentan. Vad kunde vara värre?",
            300,
            [],
            [Errors],
            50);
        this.addUpgrade(
            FullSolution,
            "Lösningshäfte",
            "Frida skriver ner hela lösningen till inte bara lämnisen, utan alla ex-tentor och ex-ks:ar också. Med så många lösningar tillgängliga lyckas ingen Ninja klara tentan på egen hand.",
            700,
            [Errors],
            [FullSolution, Envarre, Flervarre],
            250);
        this.addUpgrade(
            Diciplinary,
            "Disciplinnämnden",
            "Genom anonyma tips till Disciplinnämnden kan Frida få alla fuskande ninjor på campus avstängda från KTH! Tipsen ges från burner phones vilka såklart kostar en del. Mest värt det när du har starka ninjor som redan träffats av Frida.",
            2000,
            [FullSolution, Blackboard],
            [],
            250,
            (cost, discount) => `${cost} +${Math.round(Diciplinary.costPerCreep * discount)}/st`);
    }
}

let promilleimg = new Image();
promilleimg.src = "img/promille.png";

class Promille extends Gadget {
	static get image() { return promilleimg; }
	static get scale() { return 0.05; }

	addTo(tower) {
        tower.maxHitsOverride = Number.POSITIVE_INFINITY;
		super.addTo(tower);
	}
}

let schroedingerimg = new Image();
schroedingerimg.src = "img/schroedinger.png";

class Schroedinger extends Gadget {
	static get image() { return schroedingerimg; }
	static get scale() { return 0.05; }

	addTo(tower) {
        tower.schroedinger = true;
		super.addTo(tower);
	}
}

let vattenimg = new Image();
vattenimg.src = "img/vatten.png";

class Vatten extends Gadget {
	static get image() { return vattenimg; }
	static get scale() { return 0.1; }

	addTo(tower) {
		tower.CDtime *= 0.8;
		super.addTo(tower);
	}
}

let champagneimg = new Image();
champagneimg.src = "img/champagne.png";

class Champagne extends Gadget {
	static get image() { return champagneimg; }
	static get scale() { return 0.3; }

	addTo(tower) {
        tower.champagne = true;
        tower.preferredTargets = this.computePreferredTargets(tower, tower.inrange);
        super.addTo(tower);
    }

    computePreferredTargets(tower, inrange) {
        if (inrange.length === 0)
            return null;
        else {
            let directions = [];
            for (let x = -1; x <= 1; x++)
                for (let y = -1; y <= 1; y++)
                    if (x !== 0 || y !== 0)
                        directions.push([x, y]);

            let dircosts = inrange.map(pathTile =>
                directions.map(dir => {
                    const delta = Math.abs(Math.atan2(dir[1], dir[0]) - Math.atan2(pathTile.y - tower.y, pathTile.x - tower.x));
                    const angularDiff = Math.min(2 * Math.PI - delta, delta);
                    const radialDiff = Math.sqrt(Math.pow(pathTile.x - tower.x - dir[0], 2) + Math.pow(pathTile.y - tower.y - dir[1], 2));
                    const val = angularDiff + radialDiff;
                    return val;
                })
            );

            let preferredTarget = directions.map(_ => null);
            let takenPathtiles = [];
            while (preferredTarget.some(dir => dir === null)) {
                if (takenPathtiles.length === inrange.length)
                    takenPathtiles = [];
                let bestDirection = null;
                let bestPathtile = null;
                let bestVal = Number.POSITIVE_INFINITY;
                for (let i = 0; i < dircosts.length; i++) {
                    if (takenPathtiles.indexOf(i) !== -1)
                        continue;
                    for (let j = 0; j < dircosts[i].length; j++) {
                        if (preferredTarget[j] !== null)
                            continue;
                        if (dircosts[i][j] < bestVal) {
                            bestVal = dircosts[i][j];
                            bestPathtile = i;
                            bestDirection = j;
                        }
                    }
                }

                takenPathtiles.push(bestPathtile);
                preferredTarget[bestDirection] = [directions[bestDirection][0], directions[bestDirection][1], inrange[bestPathtile]];
            }
            return preferredTarget;
        }
    }
}

let dompaimg = new Image();
dompaimg.src = "img/dompa.png";

class Dompa extends Gadget {
	static get image() { return dompaimg; }
    static get scale() { return 0.5; }
    static get costPerCreep() { return 4; }

    addTo(tower) {
        const costPerCreep = Math.round(Dompa.costPerCreep * (tower.discount_multiplier || 1));
        controller.map.path.forEach(pathTile => pathTile.data.forEach(creep => {
            if (controller.money >= costPerCreep)
                controller.money -= costPerCreep;
            else
                return;

            let molotov = tower.projectile(creep);
            molotov.target = creep;
            molotov.range = Number.POSITIVE_INFINITY;
            let hit = molotov.hit.bind(molotov);
            // Träffa inga creeps på vägen till den vi siktar på
            molotov.hit = function (pathTile) {
                if (this.target && pathTile.data.has(this.target))
                    hit(pathTile);
            }.bind(molotov);

            molotov.source = {target: () => {
                molotov.hit = hit;
            }};

            controller.registerObject(molotov);
        }));
	}
}

let explosionimg = new Image();
explosionimg.src = "img/boom.png";
let molotovimg = new Image();
molotovimg.src = "img/cocktail.png";

class Molotov extends SplashProjectile {
    static get maxHits() { return 4; }
    constructor(map, source, target) {
        super(map, molotovimg, explosionimg, source, target.x, target.y, 0.5, 1, 2 / controller.updateInterval, 0);
        this.range = 3;
    }
}

class Drunk extends Distracted {
    init(object) {
        object.speed /= this.multiplier;
        //Sätt inte cheater på fyllon
    }
}

let axelimg = new Image();
axelimg.src = "img/transparent/axel.png";

class Axel extends OmniTower {
    static get range() { return 2.5; }
    static get CDtime() { return 3000; }
    static get image() { return axelimg; }
    static get scale() { return 0.17; }
    static get cost() { return 520; }
    static get name() { return "Fjädrande Axel"; }
    static get desc() { return "Fackliga Axel älskar två saker: facklor och att festa. Han bjuder gärna alla omkring sig på Molotovcocktails, och när dessa exploderar träffar de alla ninjor inom ett visst område."; }

    updateRange() {
        if (this.champagne)
            this.preferredTargets = Champagne.prototype.computePreferredTargets(this, inrange);
    }

    projectile(target) {
        let m = new Molotov(this.map, this, target);
        if (this.maxHitsOverride !== undefined)
            m.maxHits = this.maxHitsOverride;
        if (this.schroedinger) {
            if (Math.random() < 0.5)
                m.damage *= 3;
            else {
                m.damage = 0;
                m.time = 1000;
                m.raw_hitCreep = m.hitCreep;
                m.hitCreep = function(creep){
                    creep.addEffect(new Drunk(this.time));
                    this.raw_hitCreep(creep);
                }.bind(m);
            }
        }
        if (this.champagne) {
            // Håhå det här är en klar contender för det fulaste jag nånsin skrivit
            // Vi basically snor funktionaliteten från en SeekingProjectile
            m.source = {target: Nicole.prototype.target.bind(this)};
            if (this.preferredTargets)
            {
                let preferredTarget = this.preferredTargets.find(arr => Math.abs((target.x - this.x)/this.range - arr[0]) < 0.1 && Math.abs((target.y - this.y)/this.range - arr[1]) < 0.1);
                if (preferredTarget)
                    m.target = preferredTarget[2].arbitraryCreep();
            }
            if (!m.target)
                m.target = m.source.target;
            m.range *= 1.5;
            m.radius = 1/10;
            m.update = SeekingProjectile.prototype.update.bind(m);
        }
        return m;
    }

    projectileInfo() {
        let info = {
            name: "Cocktail",
            image: molotovimg,
            "Skada": this.schroedinger ? (Molotov.damage * 3) + " (50%) eller 0 (50%)" : "1",
            "Skott per salva": 8,
            "Splashträffar": this.maxHitsOverride === Number.POSITIVE_INFINITY ? "∞" : this.maxHitsOverride || Molotov.maxHits,
            "Målsökande skott": this.champagne ? "Ja" : "Nej",
            "Specialeffekt": this.schroedinger ? "Ingen (50%) eller Distrahering (50%)" : "Ingen"
        };

        return info;
    }

    configUpgrades() {
		this.addUpgrade(
			TakeAwayCoffee, 
			"Hets på I", 
			"Ge faddern lite koffein så jobbar den snabbare.", 
			250, 
			[], 
			[TakeAwayCoffee],
            20);
        this.addUpgrade(
            Vatten, 
            "Varannan Vatten", 
            "Axel håller sig hydrerad och orkar festa ännu intensivare!", 
            250, 
            [TakeAwayCoffee], 
            [Vatten],
            50);
        this.addUpgrade(
            Promille, 
            "Promilleacceleratorn", 
            "Det ökade alkoholinnehållet gör att cocktailarna kan träffa hur många tätt packade ninjor som helst, istället för bara " + Molotov.maxHits + ".", 
            760, 
            [], 
            [Promille, Champagne],
            100);
        this.addUpgrade(
            Schroedinger, 
            "Schrödingers", 
            "Man vet aldrig vad man får när man beställer Schrödingers. Det är 50 % chans att ninjorna tar 3x så mycket skada, och 50 % chans att deras hastighet istället tillfälligt halveras.",
            1000, 
            [Promille], 
            [Schroedinger],
            100);
        this.addUpgrade(
            Champagne, 
            "Champagne", 
            "Bjuder man på champagne gäller det att inte spilla! Axel missar knappt längre, utan drinkarna söker nu automatiskt upp ninjor.",
            1200, 
            [], 
            [Promille, Champagne],
            100);
        this.addUpgrade(
            Dompa, 
            "Dompa", 
            "Axel bjuder varenda ninja på en drink. Dompa åt alla! Mest värt det när du har en överväldigande mängd svaga ninjor att fort hantera.",
            1699,
            [Champagne],
            [],
            300,
            (cost, discount) => `${cost} +${Math.round(Dompa.costPerCreep * discount)}/st`
        );
    }
}

let fireimg = new Image();
fireimg.src = "img/fire.png";
let gasoline = new Image();
gasoline.src = "img/gasoline.png";
let propane = new Image();
propane.src = "img/propane.png";
let firebomb = new Image();
firebomb.src = "img/firebomb.png";
let ringofire = new Image();
ringofire.src = "img/ringofire.png";
let johnnycashimg = new Image();
johnnycashimg.src = "img/johnnycash.png";


class Burning extends BaseEffect {

    static get image() { return fireimg; }
    static get scale() { return 0.5; }
    static get persistent() { return true; }

    constructor(){
        super(2000/controller.updateInterval);
        this.iterations = 3;
    }

    apply(creep){
        creep.health--;
        if(creep.health <= 0){
            this.remove(creep);
            creep.onDeath();
            return;
        }
        if(--this.iterations <= 0){
            this.remove(creep);
        }
    }
}

class Fire extends BasicProjectile {

    static get damage() {
        return 2;
    }
    static get missChance() {
        return 0.4;
    }

    constructor(map, source, target) {
        let a = Math.atan2(source.x-target.x, source.y-target.y) + Math.PI/2;
        let da = (0.5 - Math.random()) * Math.PI / 4;
        super(map, fireimg, source, source.x + Math.cos(a+da), source.y - Math.sin(a+da), 1, 1 / controller.updateInterval);
        this.ignoreTile = null;
        this.lastTile = null;
        this.range = 2;
    }

    hit(pathTile) {
        if (pathTile !== this.lastTile)
            this.ignoreTile = Math.random() < this.constructor.missChance;
        this.lastTile = pathTile;
        if (!this.ignoreTile)
            super.hit(pathTile);
    }

    // hitCreep(creep) {
    //     if(this.type > 1){
    //         let e = new Burning();
    //         creep.addEffect(e);
    //     }
    //     super.hitCreep(creep);
    // }
}

class HotFire extends Fire {
    static get damage() { return Fire.damage+1; }
}

class FireBomb extends SplashProjectile {

    static get damage() {
        return 4;
    }
    static get maxHits() { return 10; }

    constructor(map, source, target){
        super(map, gasoline, firebomb, source, target.x + Math.random() - 0.5, target.y + Math.random() - 0.5, 0.5, 2, 1 / controller.updateInterval, 1);
        this.ignoreTile = null;
        this.lastTile = null;
        this.range = 2;
        source.CDtimer *= 2;
    }

    hitCreep(creep) {
        let b = new Burning();
        creep.addEffect(b);

        super.hitCreep(creep);
        this.damage = 1;
    }
}

class FireRing extends OmniProjectile {

    static get hitpoints() { return 50; }

    constructor(map, source) {
        super(source, ringofire, 0.2, 800);
        source.CDtimer += parseInt(this.runticks*1.5);
    }

    update() {
        this.angle += Math.PI * 2 / this.runticks;
        this.scale = 0.95*this.scale + 0.05;
        super.update();
    }

    hitCreep(creep){
        let b = new Burning();
        creep.addEffect(b);

        super.hitCreep(creep);
    }

}


class Gasoline extends Gadget {

    static get image() { return gasoline; }
    static get scale() { return 0.5; }

    addTo(tower){
        tower.upgradeLevel = 2;
        super.addTo(tower);
    }
}

class Propane extends Gadget {

    static get image() { return propane; }
    static get scale() { return 0.5; }

    addTo(tower){
        tower.projectiletype = 2;
        super.addTo(tower);
    }
}

class DoubleBarell extends Gadget {

    static get image() { return beccaimg; }
    static get scale() { return 0.08; }

    addTo(tower){
        tower.double = true;
        super.addTo(tower);
    }
}

class RingOfFire extends Gadget {

    static get image() { return johnnycashimg; }
    static get scale() { return 0.05; }

    addTo(tower){
        tower.upgradeLevel = 3;
        super.addTo(tower);
    }
}

let beccaimg = new Image();
beccaimg.src = "img/transparent/becca.png";

class Becca extends TargetingTower {
    static get range() { return 2; }
    static get CDtime() { return 250; }
    static get image() { return beccaimg; }
    static get scale() { return 0.2; }
    static get cost() { return 610; }
    static get name() { return "Fjädrande Becca"; }
    static get desc() { return "Flamberande Becca har en eldkastare."; }

    constructor(x,y){
        super(x,y);
        this.upgradeLevel = 1;
        this.projectiletype = 1;
        this.firebombChance = 0.1;
        this.fireringChance = 0.1;
        this.double = false;
    }

    projectile(target) {

        if (this.upgradeLevel === 2 && Math.random() < this.firebombChance) {
            return new FireBomb(this.map, this, target);
        }
        if (this.upgradeLevel === 3 && Math.random() < this.fireringChance) {
            this.angle = 0;
            return new FireRing(this.map, this);
        }
        let t = this.projectiletype === 1 ? Fire : HotFire;

        if (this.double) {
            return [
                new t(this.map, this, target, this.projectiletype), 
                new t(this.map, this, target, this.projectiletype)
            ];

        }
        return new t(this.map, this, target, this.projectiletype);
    }

    projectileInfo() {
        let info = {
            name: this.projectiletype === 1 ? "Eld" : "Varm Eld",
            image: fireimg,
            "Träffsäkerhet": (1 - (this.projectiletype === 1 ? Fire : HotFire).missChance) * 100 + "%",
            "Skada": (this.projectiletype === 1 ? Fire : HotFire).damage,
            "Extra eldsflammor": this.double ? 1 : 0
        };
        if (this.upgradeLevel >= 2) {
            info.name = info.name + " / Bensinbomb (" + (this.firebombChance * 100) + "%)";
            info.image = gasoline;
            info["Skada (eld)"] = info["Skada"];
            delete info["Skada"];
            info["Skada (bensinbomb)"] = FireBomb.damage;
            info["Splashskada (bensinbomb)"] = 1;
            info["Splashträffar (bensinbomb)"] = FireBomb.maxHits;
            info["Specialeffekt (bensinbomb)"] = "Ninjorna brinner och tar 3 skada över 6 s (sitter kvar på inre ninjor)";
        }
        if (this.upgradeLevel >= 3) {
            info.name = info.name + " / Eldring (" + Math.round((1 - this.firebombChance) * this.fireringChance * 100) + "%)";
            info.image = ringofire;
            info["Skada (eldring)"] = 0;
            info["Träffar (eldring)"] = "Alla inom tornets räckvidd";
            info["Specialeffekt (bensinbomb/eldring)"] = info["Specialeffekt (bensinbomb)"];
            delete info["Specialeffekt (bensinbomb)"];
        }

        return info;
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
        this.addUpgrade(
            Propane,
            "Propangas",
            "Ren propangas brinner varmare än hårspray, och gör 50\% extra skada.",
            550,
            [],
            [Propane],
            150
            );
        this.addUpgrade(
            Gasoline,
            "Bensinbomb",
            "Bensin brinner också bra, och när ninjorna träffas av den brinnande strålen tar de inte bara skada, utan de börjar också brinna själva. Detta fortsätter att skada dem även efter att de undkommit Becca.",
            800,
            [Propane],
            [Gasoline],
            250
            );
        this.addUpgrade(
            RingOfFire,
            "Ring of Fire",
            "Det är kul att leka med elden, och när Becca extatiskt svingar eldkastaren över huvudet sätter hon eld på alla ninjor i närheten.",
            4500,
            [Propane, Gasoline],
            [RingOfFire, DoubleBarell],
            1000
            );
        this.addUpgrade(
            DoubleBarell,
            "Dubbelpipa",
            "Vad kan vara bättre än en eldkastare? Två eldkastare såklart.",
            1400,
            [Propane],
            [DoubleBarell, RingOfFire],
            400
            );
    }
}

let springimg = new Image();
springimg.src = "img/spring.png";
let bushenimg = new Image();
bushenimg.src = "img/fnoell.png";
let virusimg = new Image();
virusimg.src = "img/virus.png";
let stuffaimg = new Image();
stuffaimg.src = "img/stuffa.png";
let kaerlekenimg = new Image();
kaerlekenimg.src = "img/kaerleken.png";
let tamigtillbakaimg = new Image();
tamigtillbakaimg.src = "img/tamigtillbaka.png";

class Spring extends Gadget {

    static get image() { return springimg; }
    static get scale() { return 0.25; }

    addTo(tower) {
        tower.JumpCD *= 0.8;
        tower.TimeBetweenJumps *= 0.5;
        super.addTo(tower);
    }
}

class Pungdjur extends Gadget {

    static get image() { return bushenimg; }
    static get scale() { return 0.2; }

    addTo(tower) {
        tower.pungdjurRefreshTime = 500;
        tower.pungdjurTimer = 0;
        tower.pungdjurDistance = 7;
        super.addTo(tower);
    }
}

class Kaerleken extends Gadget {

    static get image() { return kaerlekenimg; }
    static get scale() { return 0.2; }

    addTo(tower) {
        tower.DPS *= 2;
        tower.spiralCD /= 2;
        super.addTo(tower);
    }
}

class Stuffa extends Gadget {

    static get image() { return stuffaimg; }
    static get scale() { return 0.2; }

    addTo(tower) {
        tower.symmetry = true;
        super.addTo(tower);
    }
}

class Virus extends Gadget {

    static get image() { return virusimg; }
    static get scale() { return 0.2; }

    addTo(tower) {
        tower.copy = true;
        tower.currentProjectile = Hug;
        tower.currentProjectilePostprocess = null;
        tower.performCopy();
        super.addTo(tower);
    }
}
class Tillbaka extends Gadget {

    static get image() { return tamigtillbakaimg; }
    static get scale() { return 0.2; }

    addTo(tower) {
        for (let dist = 0; dist < Math.max(tower.map.gridInnerWidth, tower.map.gridInnerHeight); dist++) {
            for (let x = -dist; x <= dist; x++) {
                for (let y = -dist; y <= dist; y++) {
                    if ((Math.abs(x) === dist || Math.abs(y) === dist)
                            && tower.map.visiblePosition(tower.originalX + x, tower.originalY + y)
                            && tower.map.getGridAt(tower.originalX + x, tower.originalY + y) === null) {
                        tower.performJump(tower.originalX + x, tower.originalY + y);
                        return;
                    }
                }
            }
        }
    }
}

class WolframWrapper extends Wolfram {
    constructor(_, source, target) {
        super(source, target, null, null, null, null);
    }
}
class FlowerWrapper extends Flower {
    constructor(_, source, target) {
		super(target, source, effect, damage, time, image, scale);
    }
}
class BouquetWrapper extends Bouquet {
    constructor(_, source, target) {
		super(target, source, effect, damage, time, image, scale);
    }
}
class MonoCultureWrapper extends MonoCulture {
	constructor(_, source, target) {
		super(target, source, null, null, null, null, null);
	}
}

// Flash-motsvarighet
class BallOfLight extends BasicProjectile {

    static get damage() { return 0; }

    constructor(_, source, target) {
        super(controller.map, flashimg, source, target.x, target.y, 0.05, 1 / controller.updateInterval);
        this.angle = 0;
        this.range = source.range + 1;
        this.stun = 0;
        this.weak = 0;
    }
    hitCreep(creep) {
        if (this.stun > 0) {
            let s = new Stunned(this.stun);
            creep.addEffect(s);
        }
        if (this.weak > 0) {
            let w = new Weak(this.weak);
            creep.addEffect(w);
        }

        super.hitCreep(creep);
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

    static get cost() { return 700; }
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
        this.JumpCD = this.constructor.JumpCD;
        this.TimeBetweenJumps = this.constructor.TimeBetweenJumps;
        this.originalX = x;
        this.originalY = y;
        this.currentProjectileInfo = null;
        this.lastHits = this.hits;
    }

    projectile(target) {
        if (this.copy)
            return new this.currentProjectile(this.map, this, target);
        else
            return new Hug(this.map, this, target);
    }

    projectileInfo() {
        if (this.currentProjectileInfo !== null)
            return this.currentProjectileInfo;
        else {
             let info = {
                "Tid till 1:a hopp": (this.JumpCD / 1000) + " s",
                "Hoppfrekvens": (this.TimeBetweenJumps / 1000) + " s",
                "Skott per spiral": this.DPS,
                name: "Kram",
                image: hugimg,
                "Skada": 1,
                "Specialeffekt": "Ingen"
            };
            if (this.symmetry)
                info["Kramriktningar"] = 2;
        }
    }

    static copyProjectileInfo(source, dest, fields) {
        for (let i = 0; i < fields.length; i++)
            if (source[fields[i]] !== null && source[fields[i]] !== undefined)
                dest[fields[i]] = source[fields[i]];
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
                let p = this.projectile({x: this.x + Math.cos(this.fireangle), y: this.y + Math.sin(this.fireangle)});
                controller.registerObject(p);
                if (this.currentProjectilePostprocess)
                    this.currentProjectilePostprocess(p);
                if (this.symmetry) {
                    p = this.projectile({x: this.x + Math.cos(this.fireangle + Math.PI), y: this.y + Math.sin(this.fireangle + Math.PI)});
                    controller.registerObject(p);
                    if (this.currentProjectilePostprocess)
                        this.currentProjectilePostprocess(p);
                }
                    
                this.fireangle = (this.fireangle + 2 * Math.PI / this.DPS) % (2 * Math.PI);
                this.leftToFire--;
            }
            this.timeWithoutTarget = 0;
        } else if (this.CDtimer <= 0)
            this.timeWithoutTarget += controller.updateInterval;
        
        let pungdjurJump = false;
        if (this.pungdjurRefreshTime) {
            this.pungdjurTimer -= controller.updateInterval;
            if (this.pungdjurTimer <= 0) {
                this.pungdjurTimer += this.pungdjurRefreshTime;
                for (let i = 0; i < this.pungdjurDistance && i < this.map.path.length; i++) {
                    if (this.map.path[this.map.path.length - i - 1].hasCreep()) {
                        pungdjurJump = true;
                        break;
                    }
                }
            }
        }

        if (pungdjurJump)
            this.jump(true);
        else if (this.timeWithoutTarget >= this.JumpCD) {
            this.jump();
            this.timeWithoutTarget -= this.TimeBetweenJumps;
        }

        let newHits = this.hits - this.lastHits;
        this.lastHits = this.hits;
        if (newHits > 0) {
            if (!this.copy)
                controller.hitsFromSoldTowers["Fadder"] += newHits;
            else
                controller.hitsFromSoldTowers[
                    {
                        "Hug": Forfadder1.name,
                        "Patch": Forfadder1.name,
                        "WolframWrapper": Frida.name,
                        "FleshEatingWrapper": Nicole.name,
                        "GMOWrapper": Nicole.name,
                        "CornWrapper": Nicole.name,
                        "BoquetWrapper": Nicole.name,
                        "FlowerWrapper": Nicole.name,
                        "Fire": Becca.name,
                        "HotFire": Becca.name,
                        "Molotov": Axel.name
                    }[this.currentProjectile.name]
                ] += newHits;
        }
        
        super.update();
    }

    jump(allTheWay) {
        let bestX = null;
        let bestY = null;
        let best = null;
        
        let target = null;
        for (let i = 0; i < this.map.path.length; i++)
            if (this.map.path[i].hasCreep())
                target = this.map.path[i];

        if (target !== null) {
            if (allTheWay) {
                for (let dist = 1; !best && dist < Math.max(this.map.gridInnerWidth, this.map.gridInnerHeight); dist++) {
                    for (let x = -dist; !best && x <= dist; x++) {
                        for (let y = -dist; !best && y <= dist; y++) {
                            if ((Math.abs(x) === dist || Math.abs(y) === dist)
                                    && this.map.visiblePosition(target.x + x, target.y + y)) {
                                let at = this.map.getGridAt(target.x + x, target.y + y);
                                if (at === this)
                                    return;
                                if (at !== null)
                                    continue;
                                bestX = target.x + x;
                                bestY = target.y + y;
                                best = true;
                            }
                        }
                    }
                }
            }
            else {
                for (let x = -2; x <= 2; x++) {
                    for (let y = -2; y <= 2; y++) {
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
                    }
                }
            }
        }
        
        if (bestX !== null && bestY !== null)
            this.performJump(bestX, bestY);
        this.currentTarget = target;
    }

    performJump(x, y) {
        this.map.removeTower(this);
        this.x = x;
        this.y = y;
        this.map.addTower(this);
        this.inrange = this.pathInRange();
        this.gadgets.forEach((g, i) => {
            g.x = this.x + 0.5 - i * 0.25;
            g.y = this.y + 0.5;
        });
        if (this.copy)
            this.performCopy();
    }

    performCopy() {
        let closestTower = this;
        let minDist = Number.POSITIVE_INFINITY;
        this.map.towers.forEach(t => {
            if (t !== this && !(t instanceof SupportTower)) {
                let dist = Math.pow(this.x - t.x, 2) + Math.pow(this.y - t.y, 2);
                if (dist < minDist) {
                    minDist = dist;
                    closestTower = t;
                }
            }
        });
        this.currentProjectile = Hug;
        this.currentProjectilePostprocess = null;

        this.currentProjectileInfo = {
            "Tid till 1:a hopp": (this.JumpCD / 1000) + " s",
            "Hoppfrekvens": (this.TimeBetweenJumps / 1000) + " s",
            "Skott per spiral": this.DPS,
            "Kopierar": closestTower ? closestTower.constructor.name : "Ingen"
        };

        if (closestTower instanceof Fadder || closestTower instanceof Forfadder1 || closestTower instanceof SupportTower) {
            this.currentProjectile = closestTower.makemoney ? Patch : Hug;
            if (closestTower.maxhits !== null && closestTower.maxhits !== undefined)
                this.currentProjectilePostprocess = h => {
                    h.hitpoints = closestTower.maxhits;
                };
            Fnoell.copyProjectileInfo(closestTower.projectileInfo(), this.currentProjectileInfo, [
                "name", "image", "Skada", "Specialeffekt", "Träffar per skott"
            ]);
        }

        else if (closestTower instanceof Frida) {
            this.currentProjectile = WolframWrapper;
            this.currentProjectilePostprocess = w => {
                w.time = closestTower.time;
                w.maxHits = closestTower.maxHits;
                w.persistent = closestTower.persistent;
                w.damage = closestTower.projectiledamage;
                if (closestTower.projectileimg)
                    w.image = closestTower.projectileimg;
            };
            Fnoell.copyProjectileInfo(closestTower.projectileInfo(), this.currentProjectileInfo, [
                "name", "image", "Skada", "Splashträffar", "Specialeffekt", "Distrahering"
            ]);
        }

        else if (closestTower instanceof Nicole) {
            if (closestTower.flesheating) {
                if (closestTower.upgradeLevel === 2) {
                    this.currentProjectile = FleshEatingWrapper;
                    this.currentProjectilePostprocess = f => {
                        f.time = closestTower.convertedtime;
                        f.range = this.range;
                    };
                }
                if (closestTower.upgradeLevel === 3) {
                    this.currentProjectile = GMOWrapper;
                    this.currentProjectilePostprocess = f => {
                        f.time = closestTower.convertedtime;
                        f.range = this.range;
                    };
                }
            }

            if (closestTower.bouquet) {
                if (closestTower.upgradeLevel === 2) {
                    this.currentProjectile = CornWrapper;
                    this.currentProjectilePostprocess = f => {
                        f.time = closestTower.convertedtime;
                        f.range = this.range;
                        if (closestTower.flowerdamage > 0 && Math.random() < closestTower.damageChance)
                            f.damage += closestTower.flowerdamage;
                    };
                }
                else {
                    this.currentProjectile = BoquetWrapper;
                    this.currentProjectilePostprocess = f => {
                        f.time = closestTower.convertedtime;
                        f.range = this.range;
                        f.image = bouquet;
                        f.damage = 0;
                        if (closestTower.flowerdamage > 0 && Math.random() < closestTower.damageChance)
                            f.damage = closestTower.flowerdamage;
                    };
                }
            }
            else {
                this.currentProjectile = FlowerWrapper;
                this.currentProjectilePostprocess = f => {
                    f.time = closestTower.convertedtime;
                    f.range = this.range;
                    f.damage = 0;
                    if (closestTower.flowerdamage > 0 && Math.random() < closestTower.damageChance)
                        f.damage = closestTower.flowerdamage;
                };
            }
            Fnoell.copyProjectileInfo(closestTower.projectileInfo(), this.currentProjectileInfo, [
                "name", "image", "Skada", "Splashträffar", "Träffar per skott", "Målsökande skott", "Specialeffekt"
            ]);
            this.currentProjectileInfo["Målsökande skott"] = "Nej"; //Står ändå med i listan ovanför för att hamna innan specialeffekt när infon enumereras
        }

        else if (closestTower instanceof Becca) {
            this.currentProjectile = closestTower.projectiletype === 1 ? Fire : HotFire;
            let info = closestTower.projectileInfo();
            this.currentProjectileInfo.name = this.currentProjectile === Fire ? "Eld" : "Varm Eld";
            Fnoell.copyProjectileInfo(info, this.currentProjectileInfo, [
                "image", "Träffsäkerhet"
            ]);
            this.currentProjectileInfo["Skada"] = info["Skada"] || info["Skada (eld)"];
        }

        else if (closestTower instanceof Axel) {
            this.currentProjectile = Molotov;
            if (closestTower.maxHitsOverride !== undefined)
                this.currentProjectilePostprocess = m => { m.maxHits = closestTower.maxHitsOverride; };
            if (closestTower.schroedinger) {
                this.currentProjectilePostprocess = m => {
                    if (Math.random() < 0.5)
                        m.damage *= 3;
                    else {
                        m.damage = 0;
                        m.hitCreep = Wolfram.prototype.hitCreep.bind(m);
                    }
                };
            }
            Fnoell.copyProjectileInfo(closestTower.projectileInfo(), this.currentProjectileInfo, [
                "name", "image", "Skada", "Splashträffar", "Målsökande skott", "Specialeffekt"
            ]);
            this.currentProjectileInfo["Målsökande skott"] = "Nej"; //Står ändå med i listan ovanför för att hamna innan specialeffekt när infon enumereras
        }

        else if (closestTower instanceof Fnoell) {
            this.currentProjectile = closestTower.copy ? closestTower.currentProjectile : Hug;
            this.currentProjectilePostprocess = closestTower.currentProjectilePostprocess || null;
            if (this.currentProjectilePostprocess)
                this.currentProjectilePostprocess = this.currentProjectilePostprocess.bind(this);
            if (closestTower.copy)
                Fnoell.copyProjectileInfo(
                    closestTower.projectileInfo(),
                    this.currentProjectileInfo,
                    Object.keys(closestTower.projectileInfo()).filter(v => !this.currentProjectileInfo[v])
                );
            else
                Fnoell.copyProjectileInfo(closestTower.projectileInfo(), this.currentProjectileInfo, [
                    "name", "image", "Skada", "Specialeffekt"
                ]);

            if (closestTower === this) {
                let info = {
                    name: "Kram",
                    image: hugimg,
                    "Skada": 1,
                    "Specialeffekt": "Ingen",
                    "Kopierar": "Ingen"
                };
                Fnoell.copyProjectileInfo(info, this.currentProjectileInfo, Object.keys(info));
            }
        }

        else if (closestTower instanceof MediaFadder) {
            this.currentProjectile = BallOfLight;
            this.currentProjectilePostprocess = b => {
                b.stun = Flash.stunDuration;
                if (closestTower.force)
                    b.weak = ForceFlash.weaknessDuration;
                if (closestTower.skvallerpress)
                    b.damage = 1;
                if (closestTower.flash_power > 1)
                    b.hitpoints = 2;
            };

            let sourceinf = closestTower.projectileInfo();
            this.currentProjectileInfo["name"] = "Blixtboll";
            Fnoell.copyProjectileInfo(sourceinf, this.currentProjectileInfo, ["image", "Skada"]);
            this.currentProjectileInfo["Träffar per skott"] = closestTower.flash_power > 1 ? 2 : 1;
            this.currentProjectileInfo["Specialeffekt"] = sourceinf["Specialeffekt"];
        }

        else
            console.log("Oväntat närmaste torn:", closestTower);

        if (controller.selectedTower === this) {
            controller.destroyProjectileInfo();
            controller.setupProjectileInfo(this.projectileInfo());
        }
    }
    
    configUpgrades() {
		this.addUpgrade(
			Spring, 
			"Spring i Benen", 
			"Lillie-Fnöll får skor med extra fjädrar vilket gör att hon hoppar mycket snabbare.", 
			350, 
			[], 
			[Spring],
            0);
        this.addUpgrade(
            Pungdjur, 
            "Pungdjur i Bushen", 
            "I krig och kärlek är allting tillåtet. Lillie-Fnöll tränas i avancerad gerillakramföring och hoppar direkt till ninjorna längst fram om de börjar närma sig mål.", 
            700, 
            [Spring], 
            [Pungdjur],
            100);
        this.addUpgrade(
            Kaerleken, 
            "Kärlekens Hus", 
            "Lillie-Fnöll blir ännu mer fylld av kärlek och kramar dubbelt så mycket!", 
            700, 
            [], 
            [Kaerleken, Virus, Tillbaka],
            50);
        this.addUpgrade(
            Stuffa, 
            "Våga Stuffa", 
            "Vem behöver alkohol när man blir hög av rock-n'-roll? Lillie-Fnöll kramar nu åt två håll samtidigt.", 
            1450, 
            [Kaerleken], 
            [Stuffa, Virus, Tillbaka],
            250);
        this.addUpgrade(
            Virus, 
            "Virus och Bakterier", 
            "Lillie-Fnöll har så lätt för att smittas av förskylningar och annat som faddrar i närheten har. En konstigt symtom hon får är att hennes projektiler blir av samma typ som faddern hon är närmast.", 
            2700, 
            [], 
            [Kaerleken, Stuffa, Virus],
            250);
        this.addUpgrade(
            Tillbaka, 
            "Ta Mig Tillbaka Nu", 
            "Lillie-Fnöll fylls av nostalgi och hoppar direkt tillbaka till sin originalposition. Denna förmåga kan användas flera gånger.", 
            50, 
            [Virus], 
            [Kaerleken, Stuffa],
            250);
    }
}
