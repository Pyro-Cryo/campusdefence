class Map{

	constructor(canvas){
		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;

		this.grid = Array(this.width).fill(0).map(x => Array(this.height).fill(Array(1)));
		
		this.path = [];

	}

	/**
	 * Add the path to the map
	 */
	setPath(start){
	
		current = start;
		do {
			this.path.push(current);
			this.grid[current.x, current.y] = current;
			current = current.next;
		} while(current !== null);

	}

	/**
	 * Get object at position (x,y)
	 */
	getAt(x,y){
		return this.grid[x][y];
	}

}

class PathTile{

	constructor(x,y){
		this.x = x;
		this.y =y;
		this.prev = null;
		this.next = null;
	}


}
