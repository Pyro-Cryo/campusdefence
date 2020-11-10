/* ---------- Creeps ---------- */

let fohsimg = new Image();
fohsimg.src = "img/fohs.png";

class Ninja extends BaseCreep {
	static get speed() { return 0.5; }
	static get image() { return fohsimg; }
	static get scale() { return 1; }
}


let colorimgs = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
colorimgs[0].src = "img/fohs_red.png";
colorimgs[1].src = "img/fohs_blue.png";
colorimgs[2].src = "img/fohs_pink.png";
colorimgs[3].src = "img/fohs_green.png";
colorimgs[4].src = "img/fohs_violet.png";
colorimgs[5].src = "img/fohs_orange.png";

// let overlays = [new Image(), new Image()];
// overlays[0].src = "img/ninja_overlay0.png";
// overlays[1].src = "img/ninja_overlay1.png";

let helmets = [new Image(), new Image()];
helmets[0].src = "img/helmet0.png";
helmets[1].src = "img/helmet1.png";

class ColorNinja extends MatryoshkaCreep {
	static get scale() { return 1; }
	static get innerCreepCount() { return 1; }

	constructor(distance){
		super(distance);
		if(this.health > 1)
		  this.overlay = helmets[0];
	}

	update(){
		super.update();

		if (this.overlay === null)
			return;

		if (this.health / this.initial_health < 0.3){
			if (this.overlay !== null){
				this.overlay = null;
				this.imageDirty = true;
			}
		}
		else if (this.health / this.initial_health < 0.7){
			if (this.overlay != helmets[1]){
				this.overlay = helmets[1];
				this.imageDirty = true;
			}
		}
	}

	prerender(){
		super.prerender();

		if (this.overlay == null)
			return;

		// Assume this.overlay has the same dimensions as this.image.
		this.imagecontext.drawImage(
			this.overlay, -this.overlay.width * this.scale/2, -this.overlay.height * this.scale/2,
			this.overlay.width * this.scale, this.overlay.height * this.scale
		);
	}
}

class Red extends ColorNinja {
	static get speed() { return 0.55; }
	static get image() { return colorimgs[0]; }
	static get innerCreep() { return Ninja; }
}
class Blue extends ColorNinja {
	static get speed() { return 0.6; }
	static get health() { return 4; }
	static get image() { return colorimgs[1]; }
	static get innerCreep() { return Red; }
}
class Pink extends ColorNinja {
	static get speed() { return 0.65; }
	static get health() { return 4; }
	static get image() { return colorimgs[2]; }
	static get innerCreep() { return Blue; }
}
// Jag tror på att göra motsvarande med grön eller violett som med blå, dvs ersätta flera innercreeps med mer HP //Helmer
class Green extends ColorNinja {
	static get speed() { return 0.75; }
	static get health() { return 6; }
	static get image() { return colorimgs[3]; }
	static get innerCreep() { return Pink; }
	static get innerCreepCount() { return 2; }
}
class Violet extends ColorNinja {
	static get speed() { return 0.85; }
	static get health() { return 8; }
	static get image() { return colorimgs[4]; }
	static get innerCreep() { return Green; }
	static get innerCreepCount() { return 2; }
	static get regenerative() { return true; }
}
class Orange extends ColorNinja {
	static get speed() { return 0.95; }
	static get health() { return 11; }
	static get image() { return colorimgs[5]; }
	static get innerCreep() { return Violet; }
	static get innerCreepCount() { return 3; }
	static get regenerative() { return true; }
	static get regenerationspeed() { return 750 / controller.updateInterval; }
}

class ShieldedGreen extends ShieldedCreep {
	static get shieldStrength() { return 16; }
	static get creepType() { return Green; }
}
class ShieldedViolet extends ShieldedCreep {
	static get shieldStrength() { return 20; }
	static get creepType() { return Violet; }
}
class ShieldedOrange extends ShieldedCreep {
	static get shieldStrength() { return 25; }
	static get creepType() { return Orange; }
}


let cryoimg = new Image();
cryoimg.src = "img/jonas.png";
class Cryo extends MatryoshkaCreep {
	static get speed() { return 0.2; }
	static get health() { return 1000; }
	static get image() { return cryoimg; }
	static get scale() { return 0.4; }
	static get innerCreep() { return Orange; }
	static get innerCreepCount() { return 50; }
	static get regenerative() { return true; }
	static get regenerationspeed() { return 750 / controller.updateInterval; }
	static get drawHealthBar() { return true; }

	constructor(distance){
		super(distance);
		this.angle2 = 0;
	}

	onHit(projectile){
		super.onHit(projectile);

		let N = 10;
		this.angle2 += Math.PI/20;
		if(this.angle2 > 2*Math.PI){
			this.angle2 -= 2*Math.PI;
		}
		for (var a = 0; a < N; a++) {
			let dx = 2 * Math.cos(a*2*Math.PI/N+this.angle2);
			let dy = 2 * Math.sin(a*2*Math.PI/N+this.angle2);

			let s = { x: this.x + dx/Math.sqrt(dx*dx+dy*dy)*2, y: this.y - 1 + dy/Math.sqrt(dx*dx+dy*dy)*2, hits: 0 };
			let t = { x: this.x + dx*10, y: this.y + dy*10 };
			let p = new Molotov(controller.map, s, t);
			// p.hitpoints = 1
			// p.damage = 0;
			// p.hitCreep = function(creep){};
			controller.registerObject(p);
		}
	}
}


let pyroimg = new Image();
pyroimg.src = "img/helmer3.png";
class Pyro extends MatryoshkaCreep {

	static get speed() { return 0.2; }
	static get health() { return 1000; }
	static get image() { return pyroimg; }
	static get scale() { return 0.4; }
	static get innerCreep() { return Burvagn; }
	static get innerCreepCount() { return 3; }
	static get regenerative() { return true; }
	static get regenerationspeed() { return 750 / controller.updateInterval; }
	static get drawHealthBar() { return true; }

	constructor(distance){
		super(distance);
		this.angle2 = 0;
	}

	onHit(projectile){
		super.onHit(projectile);

		let N = 5;
		this.angle2 += Math.PI/20;
		if(this.angle2 > 2*Math.PI){
			this.angle2 -= 2*Math.PI;
		}
		for (var a = 0; a < N; a++) {
			let dx = 2 * Math.cos(a*2*Math.PI/N+this.angle2);
			let dy = 2 * Math.sin(a*2*Math.PI/N+this.angle2);

			let s = { x: this.x + dx/Math.sqrt(dx*dx+dy*dy)*2, y: this.y - 1 + dy/Math.sqrt(dx*dx+dy*dy)*2, hits: 0 };
			let t = { x: this.x + dx*10, y: this.y + dy*10 };
			let p = new Fire(controller.map, s, t);
			// p.hitpoints = 1
			// p.damage = 0;
			// p.hitCreep = function(creep){};
			controller.registerObject(p);
		}
	}
}