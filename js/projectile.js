class Projectile extends GameObject {

	static get damage() { return 1; }
	static get hitpoints() { return 1; }


	// Speed in grid units per tick
	constructor(map, image, source, target_x, target_y, scale, speed, onHitCreep) {
		super(image, source.x, source.y, Math.atan2(target_y - source.y, target_x - source.x), scale);
		this.map = map;
		let xdist = target_x - source.x;
		let ydist = target_y - source.y;
		let dist = Math.sqrt(xdist * xdist + ydist * ydist);

		this.speed = speed;
		this.dx = speed * xdist / dist;
		this.dy = speed * ydist / dist;
		this.range = 3;
		this.sourceTower = source;

		this.flying = true;
		this.onHitCreep = onHitCreep || null;

		this.hitpoints = this.constructor.hitpoints;
		this.damage = this.constructor.damage;
	}

	hit(pathTile) {
		if(--this.hitpoints <= 0)
			this.despawn();
	}

	hitCreep(creep) {
		creep.onHit(this);
		this.sourceTower.hits++;
		if (this.onHitCreep !== null)
			this.onHitCreep();
	}

	update() {
		if (this.flying) {
			this.x += this.dx;
			this.y += this.dy;
			this.range -= this.speed;

			let pt;
			try {
				pt = this.map.getGridAt(Math.round(this.x), Math.round(this.y));
			} catch (e) {
				//Utanf�r grid
				this.despawn();
				return;
			}
			if (pt instanceof PathTile && pt.hasCreep())
				this.hit(pt);

		}
		if(this.range < 0)
			this.despawn()



		super.update();
	}
}

class BasicProjectile extends Projectile {
	hit(pathTile) {
		let creep = pathTile.arbitraryCreep();
		if (creep !== null)
			this.hitCreep(creep);

		super.hit(pathTile);
	}
}


class SplashProjectile extends Projectile {

	static get maxHits() { return Number.POSITIVE_INFINITY; }

	constructor(map, image, splash, source, target_x, target_y, scale, splash_scale, speed, splash_range) {
		super(map, image, source, target_x, target_y, scale, speed);
		this.splash_img = splash;
		this.splash_scale = splash_scale;
		this.splash_range = splash_range;
		this.maxHits = this.constructor.maxHits;
	}

	draw(gameArea) {
		if (this.despawnTimer >= 0) {
			this.angle = 2 * Math.PI * Math.random();
		}
		super.draw(gameArea);
	}

	hit(pathTile) {
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
					let i = 0;
					pt.data.forEach(function (creep) {
						if (i++ < this.maxHits)
							this.hitCreep(creep);
					}.bind(this));
				}
			}
		}

		// Change animation to splash image and don't target anything or move.
		this.image = this.splash_img;
		this.scale = this.splash_scale;
		this.speed = 0;
		this.dx = 0;
		this.dy = 0;
		// Set timeout do die properly
		this.despawnTimer = 7;
		this.flying = false;
	}
}

class SeekingProjectile extends Projectile{

	constructor(image, scale, source, target, speed){
		super(controller.map, image, source, target.x, target.y, scale, speed);
		this.target = target;
		this.source = source;
		this.range = 10;

		// Hur skarpt vi kan sv�nga som mest, andel per tick
		this.radius = 1/10;
	}

	update(){
		if(this.target == null || this.target.id == null){
			// M�let har despawnat, be om ett nytt
			this.target = this.source.target();
		}
		else{
			// R�kna ut ny riktning mot m�let
			let xdist = this.target.x - this.x;
			let ydist = this.target.y - this.y;
			let dist = Math.sqrt(xdist * xdist + ydist * ydist);
			this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

			this.dx = (this.speed * xdist / dist)*this.radius + (1-this.radius)*this.dx;
			this.dy = (this.speed * ydist / dist)*this.radius + (1-this.radius)*this.dy;
		}
		super.update();
	}

	hit(pathTile){
		// 
		if(pathTile.data.has(this.target)){
			this.hitCreep(this.target);
		} else {
			let creep = pathTile.arbitraryCreep();
			if (creep !== null)
				this.hitCreep(creep);
		}
		super.hit(pathTile);
	}



} 


class InverseProjectile extends GameObject {
	// Speed in grid units per tick
	constructor(image, source, target, scale, speed) {
		super(image, source.x, source.y, Math.atan2(target.y - source.y, target.x - source.x), scale);
		let xdist = target.x - source.x;
		let ydist = target.y - source.y;
		let dist = Math.sqrt(xdist * xdist + ydist * ydist);

		this.speed = speed;
		this.dx = speed * xdist / dist;
		this.dy = speed * ydist / dist;
		this.range = 3;
		this.source = source;
		this.target = target;

		this.radius = 1/20;

		this.flying = true;
	}

	hit(tower) {
		this.hitTower(tower);
		this.id = null;
	}

	hitTower(tower) {
		
	}

	update() {
		if (this.flying) {
			if(this.target != null && this.target.id != null){
				// Räkna ut ny riktning mot målet
				let xdist = this.target.x - this.x;
				let ydist = this.target.y - this.y;
				let dist = Math.sqrt(xdist * xdist + ydist * ydist);
				this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

				this.dx = (this.speed * xdist / dist)*this.radius + (1-this.radius)*this.dx;
				this.dy = (this.speed * ydist / dist)*this.radius + (1-this.radius)*this.dy;
			}
			this.x += this.dx;
			this.y += this.dy;
			this.range -= this.speed;

			let pt;
			try {
				pt = controller.map.getGridAt(Math.round(this.x), Math.round(this.y));
			} catch (e) {
				//Utanför grid
				this.id = null;
				return;
			}
			if (pt === this.target){
				this.hit(pt);
				this.flying = false;
			}

		}
		if(this.range < 0)
			this.id = null;

		super.update();
	}
}