class Map{

    constructor(width, height, path, canvasWidth, canvasHeight) {
        this.width = width;
        this.height = height;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        /*this.grid = Array(this.height).fill(0).map(
            x => Array(this.width).fill(0).map(
                y => []
            )
        );*/
        this.towers = [];

        this.path = [];
        if (path.length < 2)
            throw new Error("Invalid path with length " + path.length);

        for (let i = 0; i < path.length; i++) {
            let x = path[i][0];
            let y = path[i][1];
            this.path.push(new PathTile(x, y, []));
            if (i !== 0) {
                this.path[i - 1].next = this.path[i];
                this.path[i].prev = this.path[i - 1];
            }
        }
    }

    addTower(tower) {
        if (this.towers.findIndex(t => t.id === tower.id) !== -1)
            this.towers.push(tower);
    }
    removeTower(tower) {
        if (typeof tower === "number")
            this.towers = this.towers.filter(t => t.id !== tower);
        else
            this.towers = this.towers.filter(t => t.id !== tower.id);
    }
    // Get the canvas (x, y) from a progress value 0 <= t <= this.path.length - 1.
    getPosition(t) {
        if (t < 0 || t > this.path.length - 1)
            throw new Error("t out of bounds [0, " + (this.path.length - 1) + "] with value " + t);
        let prev = this.path[t === this.path.length - 1 ? t - 1 : Math.floor(t)];
        let next = this.path[Math.floor(t) === t ? t + 1 : Math.ceil(t)];
        let interpol = t - Math.floor(t);

        // Add 0.5 to get center points of grid rectangles as path vertices
        return [
            (prev.x * interpol + next.x * (1 - interpol) + 0.5) * this.canvasWidth,
            (prev.y * interpol + next.y * (1 - interpol) + 0.5) * this.canvasHeight
        ];
    }

	/**
	 * Add the path to the map
	 */
	/*setPath(start) {
	
		current = start;
		do {
			this.path.push(current);
			this.grid[current.x, current.y] = current;
			current = current.next;
		} while(current !== null);
	}*/

	/**
	 * Get object at position (x, y)
	 */
	/*getAt(x, y){
		return this.grid[y][x];
	}*/

}

class PathTile{
	constructor(x, y, data){
		this.x = x;
		this.y = y;
		this.prev = null;
        this.next = null;
        this.data = data;
	}
}
