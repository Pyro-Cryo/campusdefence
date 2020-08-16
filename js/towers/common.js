
let gameoverimg = new Image();
gameoverimg.src = "img/gameover.jpg";

class SplashScreen extends GameObject {
    constructor() {
        super(gameoverimg, (controller.map.gridInnerWidth - 1) / 2, (controller.map.gridInnerHeight - 1) / 2, 0, 0.35);
    }
}


let takeawaycup = new Image();
takeawaycup.src = "img/coffee-takeaway.png";

class TakeAwayCoffee extends Gadget {

	static get image() { return takeawaycup; }
	static get scale() { return 0.5; }

	addTo(tower) {
		tower.CDtime *= 0.75;
		super.addTo(tower);
	}

}

let mek1 = new Image();
let mek2 = new Image();
mek1.src = "img/mek1.png";
mek2.src = "img/mek2.png";

class Mek1 extends Gadget {

	static get image() { return mek1; }
	static get scale() { return 0.5; }

	addTo(tower) {
		tower.range += 0.5;
		tower.inrange = tower.pathInRange();
		super.addTo(tower);
	}

}

class Mek2 extends Gadget {

	static get image() { return mek2; }
	static get scale() { return 0.5; }

	addTo(tower) {
		tower.range += 1;
		tower.inrange = tower.pathInRange();
		super.addTo(tower);
	}

}