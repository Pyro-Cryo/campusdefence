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
		console.log(creep, this);
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

class SeekingProjectile extends Projectile{

	constructor(image, scale, source, target, speed){
		super(controller.map, image, source.x, source.y, target.x, target.y, scale, speed);
		this.target = target;
		this.source = source;
		this.range = 10;

		// Hur skarpt vi kan svänga som mest, andel per tick
		this.radius = 1/10;
	}

	update(gameArea){
		if(this.target == null || this.target.id == null){
			// Målet har despawnat, be om ett nytt
			this.target = this.source.target();
		}
		else{
			// Räkna ut ny riktning mot målet
			let xdist = this.target.x - this.x;
			let ydist = this.target.y - this.y;
			let dist = Math.sqrt(xdist * xdist + ydist * ydist);
			this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

			this.dx = (this.speed * xdist / dist)*this.radius + (1-this.radius)*this.dx;
			this.dy = (this.speed * ydist / dist)*this.radius + (1-this.radius)*this.dy;
		}
		super.update(gameArea);
	}

	hit(pathTile){
		// 
		if(pathTile.data.has(this.target)){
			this.hitCreep(this.target);
		}
		super.hit(pathTile);
	}



} 