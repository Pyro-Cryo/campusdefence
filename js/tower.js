class BaseTower extends GameObject {

	constructor(map, image, x, y, scale, range) {
		super(image, x, y, 0, scale);
		this.map = map;
		this.range = range;

		this.inrange = this.pathInRange();
		this.map.addTower(this);
	}

	target(){

		let node = this.inrange.last;
		while (node !== null) {
			if(node.obj.hasCreep()){
				return node.obj;
			}
			node = node.prev;
		}

		return null;
	}

	pathInRange(){

		let targetable = new LinkedList();
		let node = this.map.path[0];

		while (node !== null) {
			if(Math.sqrt(Math.pow(this.x-node.x, 2) + Math.pow(this.y-node.y,2)) < this.range)
				targetable.push(node);
			node = node.next;
		}
		return targetable;
	}

}


class TargetableTower extends BaseTower {

	constructor(map, image, x, y, scale, range) {
		super(map, image, x, y, scale, range);
		this.range = range;

	}

	update(gameArea){
		let t = this.target();
		if(t){
			this.angle = Math.atan2(this.y-t.y, this.x-t.x);
		}
		super.update(gameArea);
	}

}
