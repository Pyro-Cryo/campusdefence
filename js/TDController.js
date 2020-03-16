class TDController extends Controller {
    constructor() {
        super();
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
        path = TDMap.gridToCanvas(9, 9, path, this.gameArea.canvas.width, this.gameArea.canvas.height);
        this.map = new TDMap(path, this.gameArea.canvas.width, this.gameArea.canvas.height);

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
// Sorry för formuleringen men "creep" är tydligen termen som används
class Jonas extends BaseCreep {
    constructor(map) {
        super(jonasimg, 0.05, map, 0.03);
    }
    onGoal() {
        super.onGoal();
        console.log("Jonas got you!");
    }
    update(gameArea) {
        if (!(this.x === this.lastx && this.y === this.lasty))
            this.angle = Math.PI / 2 + Math.atan2(this.y - this.lasty, this.x - this.lastx);
        super.update(gameArea);
    }
}

let controller;
setTimeout(() => {
    new TDController();
}, 1);