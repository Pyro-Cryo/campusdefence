class BaseTower extends GameObject {

    // CoolDowntime is measured in update ticks
    constructor(controller, image, x, y, scale, range, CDtime) {
        super(image, x, y, 0, scale);
        this.controller = controller;
        this.map = controller.map;
        this.range = range;
        this.CDtime = CDtime;
        this.CDtimer = 0;

        this.inrange = this.pathInRange();
        this.map.addTower(this);
        this.controller.registerObject(this);
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
    	this.controller.registerObject(this.projectile(target));
    	this.CDtimer = this.CDtime;

    }

    projectile(target){
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
		for(var dx=-1; dx<2; dx++){
            for(var dy=-1; dy<2; dy++){
                if(dx == 0 && dy == 0)
                    continue;
                let t = {x:this.x+dx*this.range, y:this.y+dy*this.range};
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

        this.flying = true;
    }

    hit(pathTile) {
        this.id = null;
    }

    update(gameArea) {
    	if(this.flying){
	        let pt;
	        try {
	            pt = this.map.getGridAt(Math.round(this.x), Math.round(this.y));
	        } catch (e) {
	            //Utanf?r grid
	            this.id = null;
	            return;
	        }
	        if (pt instanceof PathTile && pt.hasCreep())
	            this.hit(pt);

	        this.x += this.dx;
	        this.y += this.dy;
	    }

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


class SplashProjectile extends BasicProjectile{

	constructor(map, image, splash, x, y, target_x, target_y, scale, splash_scale, speed, splash_range){
		super(map, image, x, y, target_x, target_y, scale, speed);
		this.splash_img = splash;
		this.splash_scale = splash_scale;
		this.splash_range = splash_range;
	}

	update(gameArea){
		if(!this.flying){
			this.angle = 2*Math.PI*Math.random();
		}
		super.update(gameArea);
	}

	hit(pathTile) {
		// Är det OP att splash träffar alla creeps inom en radie? 
		// Ska det bara vara ett visst antal inom en radie?
		let x = Math.round(this.x);
		let y = Math.round(this.y);
		for (var dx=-this.splash_range; dx<=this.splash_range; dx++){
			if(x+dx < 0 || this.map.gridWidth < x+dx)
				continue;
			for (var dy=-this.splash_range; dy<=this.splash_range; dy++){
				if(y+dy < 0 || this.map.gridHeight < y+dy)
					continue;
				
				let pt = this.map.getGridAt(x+dx, y+dy);
				if (pt instanceof PathTile && pt.hasCreep()){
					pt.data.forEach(function(creep){
						creep.onDeath();
					});
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
		},100);

	}

}