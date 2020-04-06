class Projectile extends GameObject {
    // Speed in grid units per tick
    constructor(map, image, x, y, target_x, target_y, scale, speed) {
        super(image, x, y, Math.atan2(target_y - y, target_x - x), scale);
        this.map = map;
        let xdist = target_x - x;
        let ydist = target_y - y;
        let dist = Math.sqrt(xdist * xdist + ydist * ydist);

        this.speed = speed;
        this.dx = speed * xdist / dist;
        this.dy = speed * ydist / dist;
        this.range = 3;

        this.flying = true;
    }

    hit(pathTile) {
        this.id = null;
    }

    hitCreep(creep) {
        creep.onHit(this);
    }

    update(gameArea) {
        if (this.flying) {
        	this.x += this.dx;
            this.y += this.dy;
            this.range -= this.speed;

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

        }
        if(this.range < 0)
        	this.id = null;

        super.update(gameArea);
    }
}

class BasicProjectile extends Projectile {
    hit(pathTile) {
        let creep = pathTile.arbitraryCreep();
        this.hitCreep(creep);

        super.hit(pathTile);
    }
}


class SplashProjectile extends Projectile {

    constructor(map, image, splash, x, y, target_x, target_y, scale, splash_scale, speed, splash_range) {
        super(map, image, x, y, target_x, target_y, scale, speed);
        this.splash_img = splash;
        this.splash_scale = splash_scale;
        this.splash_range = splash_range;
    }

    update(gameArea) {
        if (!this.flying) {
            this.angle = 2 * Math.PI * Math.random();
        }
        super.update(gameArea);
    }

    hit(pathTile) {
        // Är det OP att splash träffar alla creeps inom en radie? 
        // Ska det bara vara ett visst antal inom en radie?
        // Jag tycker det är fine, creeps kan ju ha flera hp eller nåt också /Helmer
        let x = Math.round(this.x);
        let y = Math.round(this.y);
        for (var dx = -this.splash_range; dx <= this.splash_range; dx++) {
            if (x + dx < 0 || this.map.gridWidth < x + dx)
                continue;
            for (var dy = -this.splash_range; dy <= this.splash_range; dy++) {
                if (y + dy < 0 || this.map.gridHeight < y + dy)
                    continue;

                let pt = this.map.getGridAt(x + dx, y + dy);
                if (pt instanceof PathTile && pt.hasCreep()) {
                    pt.data.forEach(function (creep) {
                        this.hitCreep(creep);
                    }.bind(this));
                }
            }
        }

        // Change animation to splash image and don't target anything or move.
        this.flying = false;
        this.image = this.splash_img;
        this.scale = this.splash_scale;

        // Set timeout do die properly
        setTimeout(() => {
            this.id = null;
        }, 100);

    }
}