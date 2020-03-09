class FlappyJonasController extends Controller {
    constructor() {
        super();
        mainController = this;
        this.scrollSpeed = 4;

        for (let i = 0; i < 4; i++) {
            this.registerObject(new Obstacle(this.gameArea.width * i / 4, Math.random() * this.gameArea.height * 0.3, true));
            this.registerObject(new Obstacle(this.gameArea.width * i / 4, Math.random() * this.gameArea.height * 0.3, false));
        }

        this.flappyJonas = new FlappyJonas(this.gameArea.width / 8, this.gameArea.height / 2);
        this.registerObject(this.flappyJonas);

        document.addEventListener('keydown', e => {
            if (e.code === "Space")
                this.flappyJonas.vertSpeed = -5;
        });
    }
}

let jonasimg = new Image();
jonasimg.src = "img/jonas.png";

class FlappyJonas extends GameObject {
    constructor(x, y) {
        super(jonasimg, x, y, 0, 0.1);
        this.acceleration = 0.2;
        this.vertSpeed = 0;
        this.maxSpeed = 20;
    }
    update(gameArea) {
        this.vertSpeed = Math.min(this.vertSpeed + this.acceleration, this.maxSpeed);
        this.y += this.vertSpeed;
        this.angle = Math.PI / 2 + Math.atan2(this.vertSpeed, mainController.scrollSpeed);

        if (this.y > gameArea.height)
            mainController.stop();

        super.update(gameArea);
    }
}

let jonasimg2 = new Image();
jonasimg2.src = "img/jonas2.png";

class Obstacle extends GameObject {
    constructor(x, height, isTop) {
        super(
            jonasimg2,
            x,
            isTop ? 0 + height : mainController.gameArea.height - height,
            isTop ? Math.PI : 0,
            0.05
        );
        this.isTop = isTop;
    }
    update(gameArea) {
        this.x -= mainController.scrollSpeed;
        if (this.x < 0) {
            this.x += gameArea.width;
            let height = Math.random() * gameArea.height * 0.3;
            this.y = this.isTop ? 0 + height : mainController.gameArea.height - height;
        }
        super.update(gameArea);
    }
}

let mainController;
setTimeout(() => {
    new FlappyJonasController();
}, 1);