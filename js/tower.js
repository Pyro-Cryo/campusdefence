// TODO: Vill man ha att tornen håller koll på hur många kills de fått? Ha det som ett krav för att uppgradera??
class BaseTower extends GameObject {
    // Range in grid units
    static get range() {
        throw new Error("Abstract property range must be overridden by subclass");
    }
    // Cooldown time for projectiles, in ms
    static get CDtime() {
        throw new Error("Abstract property CDtime must be overridden by subclass");
    }
    // The tower's sprite
    static get image() {
        throw new Error("Abstract property image must be overridden by subclass");
    }
    // The tower's sprite's scale
    static get scale() {
        throw new Error("Abstract property scale must be overridden by subclass");
    }

    // CoolDowntime is measured in update ticks internally
    constructor(x, y) {
        super(undefined, x, y, 0, undefined);
        this.image = this.constructor.image;
        this.scale = this.constructor.scale;
        this.map = controller.map;
        this.range = this.constructor.range;
        this.CDtime = this.constructor.CDtime / controller.updateInterval;
        this.CDtimer = 0;
        this.hits = 0;

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
        let proj = this.projectile(target);
        controller.registerObject(proj);
        proj.onHitCreep = () => this.hits++;
        this.CDtimer = this.CDtime;
    }

    projectile(target) {
        // Create and return a new projectile object, that is targeted at target
        throw new Error("Abstract method projectile must be overridden by subclass");
    }

    update(gameArea) {
        if (this.CDtimer <= 0) {
            let target = this.target();
            if (target)
                this.fire(target);
        } else
            this.CDtimer--;

        super.update(gameArea);
    }

    destroy() {
        this.map.removeTower(this);
        controller.unregisterObject(this);
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