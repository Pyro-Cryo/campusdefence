
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

courseimg = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];

courseimg[0].src = "img/mek1.png";
courseimg[1].src = "img/mek2.png";
courseimg[2].src = "img/regler.png";
courseimg[3].src = "img/kvant.png";
courseimg[4].src = "img/hallf.png";
courseimg[5].src = "img/patch.png";

class Mek1 extends Gadget {

	static get image() { return courseimg[0]; }
	static get scale() { return 0.5; }

	addTo(tower) {
		tower.range += 0.5;
		tower.inrange = tower.pathInRange();
		super.addTo(tower);
	}
}

class Mek2 extends Gadget {

	static get image() { return courseimg[1]; }
	static get scale() { return 0.5; }

	addTo(tower) {
		tower.range += 1;
		tower.inrange = tower.pathInRange();
		super.addTo(tower);
	}
}

class Regler extends Gadget {

	static get image() { return courseimg[2]; }
	static get scale() { return 0.35; }

	addTo(tower){
		tower.CDtime = Math.floor(tower.CDtime*0.7);
		tower.activetargeting = true;
		super.addTo(tower);
	}
}

class Kvant extends Gadget {

	static get image() { return courseimg[3]; }
	static get scale() { return 0.4; }

	addTo(tower) {
		tower.projectiletype = 2;
		super.addTo(tower);
	}
}

class Hallf extends Gadget {

	static get image() { return courseimg[4]; }
	static get scale() { return 0.35; }

	addTo(tower) {
		tower.maxhits += 1;
		super.addTo(tower);
	}
}

class Markeshets extends Gadget {

	static get image() { return courseimg[5]; }
	static get scale() { return 0.4; }

	addTo(tower){
		tower.makemoney = true;
		super.addTo(tower);
	}
}