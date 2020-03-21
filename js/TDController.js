class TDController extends Controller {
    constructor() {
        super(9,9);
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

        this.jonasInterval = 30;
        this.jonasTimer = 0;

        //this.stop();
        //this.updateInterval = 500;
        //this.resume();
    }
    update(gameArea) {
        super.update(gameArea);
        if (this.jonasTimer-- === 0) {
            this.jonasTimer += this.jonasInterval;
            this.registerObject(new Jonas(this.map));
        }
    }
}

let jonasimg = new Image();
jonasimg.src = "img/jonas.png";
let helmerimg = new Image();
helmerimg.src = "img/helmer1.png";


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


class Helmer extends TargetableTower {
    constructor(map, x, y){
        super(map, helmerimg, x, y, 0.03, 2.5);
    }


}

let controller;
setTimeout(() => {
    tdc = new TDController();
    h1 = new Helmer(tdc.map, 6,4);
    tdc.registerObject(h1);
    h2 = new Helmer(tdc.map, 3,7);
    tdc.registerObject(h2);

}, 1);