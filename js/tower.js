class BaseTower extends GameObject {

    // CoolDowntime is measured in update ticks
    constructor(image, x, y, scale, range, CDtime) {
        super(image, x, y, 0, scale);
        this.map = controller.map;
        this.range = range;
        this.CDtime = CDtime;
        this.CDtimer = 0;

        this.inrange = this.pathInRange();
        this.map.addTower(this);
        controller.registerObject(this);
    }

    target() {
        return this.inrange.find(pt => pt.hasCreep()) || null;
    }

    pathInRange() {
        return this.map.path.filter(pt =>
            Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.range
        ).reverse();
    }

    // Vet inte om man borde decoupla det här lite mer så att de skjuter mot godtyckligt (x, y) snarare än en pathtile
    fire(target) {
        controller.registerObject(this.projectile(target));
        this.CDtimer = this.CDtime;
    }

    projectile(target) {
        // Create and return a new projectile object, that is targeted at target
        throw new Error("Abstract method projectile must be overridden by superclass");
    }

    update(gameArea) {
        if (this.CDtimer > 0)
            this.CDtimer -= 1;
        else if (this.CDtimer === 0) {
            let target = this.target();
            if (target)
                this.fire(target);
        }

        super.update(gameArea);
    }
}


class OmniTower extends BaseTower {
    fire(target) {
        for (var dx = -1; dx < 2; dx++) {
            for (var dy = -1; dy < 2; dy++) {
                if (dx === 0 && dy === 0)
                    continue;
                let t = { x: this.x + dx * this.range, y: this.y + dy * this.range };
                super.fire(t);
            }
        }
    }
}


class TargetingTower extends BaseTower {
    fire(target) {
        this.angle = Math.atan2(this.y - target.y, this.x - target.x);
        super.fire(target);
    }
}