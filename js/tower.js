class BaseTower extends GameObject {

    // CoolDowntime is measured in update ticks
    constructor(map, image, x, y, scale, range, CDtime) {
        super(image, x, y, 0, scale);
        this.map = map;
        this.range = range;
        this.CDtime = CDtime;
        this.CDtimer = 0;

        this.inrange = this.pathInRange();
        this.map.addTower(this);
    }

    target() {
        return this.inrange.find(pt => pt.hasCreep()) || null;
    }

    pathInRange() {
        return this.map.path.filter(pt =>
            Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.range
        ).reverse();
    }

    fire(target) {
        this.CDtimer = this.CDtime;
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


class TargetingTower extends BaseTower {
    fire(target) {
        this.angle = Math.atan2(this.y - target.y, this.x - target.x);
        console.log("pew");
        super.fire(target);
    }
}


class Projectile extends GameObject {
    // Speed in grid units per tick
    constructor(map, image, x, y, target_x, target_y, scale, speed) {
        super(image, x, y, Math.atan2(target_y - y, target_x - x), scale);
        this.map = map;
        let xdist = target_x - x;
        let ydist = target_y - y;
        let dist = Math.sqrt(xdist * xdist + ydist * ydist);
        this.dx = speed * xdist / dist;
        this.dy = speed * ydist / dist;
    }

    hit(pathTile) {
        this.id = null;
    }

    update(gameArea) {
        let pt;
        try {
            pt = this.map.getGridAt(Math.round(this.x), Math.round(this.y));
        } catch (e) {
            //Utanför grid
            this.id = null;
            return;
        }
        if (pt instanceof PathTile && pt.hasCreep())
            this.hit(pt);

        this.x += this.dx;
        this.y += this.dy;

        super.update(gameArea);
    }
}

class BasicProjectile extends Projectile {
    hit(pathTile) {
        let creep = pathTile.arbitraryCreep();
        creep.onDeath();

        super.hit(pathTile);
    }
}