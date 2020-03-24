class TDController extends Controller {
    constructor() {
        super(9, 9);
        controller = this;
        let path = [
            [-1, 0],
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [4, 1],
            [4, 2],
            [4, 3],
            [5, 3],
            [6, 3],
            [7, 3],
            [7, 4],
            [7, 5],
            [6, 5],
            [5, 5],
            [4, 5],
            [4, 6],
            [4, 7],
            [4, 8],
            [3, 8],
            [2, 8],
            [2, 7],
            [2, 6],
            [1, 6],
            [1, 7],
            [1, 8],
            [0, 8],
            [-1, 8]
        ];
        this.map = new TDMap(path, this.gameArea);

        this.jonasInterval = 50;
        this.jonasTimer = 0;
    }
    update(gameArea) {
        super.update(gameArea);
        if (this.jonasTimer-- === 0) {
            this.jonasTimer += this.jonasInterval;
            this.registerObject(new Jonas(this.map));
            this.jonasInterval = Math.max(1, this.jonasInterval - 1);
        }
    }
}

let jonasimg = new Image();
jonasimg.src = "img/jonas.png";


// Sorry för formuleringen men "creep" är tydligen termen som används
class Jonas extends BaseCreep {
    constructor(map) {
        super(jonasimg, 0.05, map, 0.03);
    }
    onGoal() {
        console.log("Jonas got you!");
        super.onGoal();

    }
    update(gameArea) {
        if (!(this.x === this.lastx && this.y === this.lasty))
            this.angle = Math.PI / 2 + Math.atan2(this.y - this.lasty, this.x - this.lastx);
        super.update(gameArea);
    }
}

let jonasimg2 = new Image();
jonasimg2.src = "img/jonas3.png";

class SuperSonicJonas extends BasicProjectile {
    constructor(map, source, target) {
        super(map, jonasimg2, source.x, source.y, target.x, target.y, 0.03, 1 / controller.updateInterval);
    }
}


let helmerimg = new Image();
helmerimg.src = "img/helmer1.png";

class Helmer extends TargetingTower {
    constructor(map, x, y) {
        super(map, helmerimg, x, y, 0.03, 2.5, 1000 / controller.updateInterval);
    }

    fire(target) {
        controller.registerObject(new SuperSonicJonas(this.map, this, target));

        super.fire(target);
    }
}

let controller;
setTimeout(() => {
    controller = new TDController();
    h1 = new Helmer(controller.map, 6, 4);
    controller.registerObject(h1);
    h2 = new Helmer(controller.map, 3, 7);
    controller.registerObject(h2);

}, 1);