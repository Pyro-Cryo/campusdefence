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
	static get innerCreepCount() { return 2; }

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
    static get innerCreepCount() { return 1; }
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
}
class Violet extends ColorNinja {
    static get speed() { return 0.85; }
    static get health() { return 6; }
    static get image() { return colorimgs[4]; }
    static get innerCreep() { return Green; }
}
class Orange extends ColorNinja {
    static get speed() { return 0.95; }
    static get health() { return 8; }
    static get image() { return colorimgs[5]; }
    static get innerCreep() { return Violet; }
}

class ShieldedRed extends ShieldedCreep {
    static get shieldStrength() { return 10; }
    static get creepType() { return Red; }
}
class ShieldedBlue extends ShieldedCreep {
    static get shieldStrength() { return 12; }
    static get creepType() { return Blue; }
}
class ShieldedPink extends ShieldedCreep {
    static get shieldStrength() { return 14; }
    static get creepType() { return Pink; }
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