class BaseTower extends GameObject {

    constructor(map, image, x, y, scale, range) {
        super(image, x, y, 0, scale);
        this.map = map;
        this.range = range;

        this.inrange = this.pathInRange();
        this.map.addTower(this);
    }

    target() {
        return this.inrange.find(p => p.hasCreep()) || null;
    }

    pathInRange() {
        return this.map.path.filter(pt =>
            Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.range
        ).reverse();
    }

}


class TargetingTower extends BaseTower {
    update(gameArea) {
        let t = this.target();
        if (t) {
            this.angle = Math.atan2(this.y - t.y, this.x - t.x);
        }
        super.update(gameArea);
    }

}
