class TDMap {

    constructor(path, gameArea) {
        this.canvasWidth = gameArea.width;
        this.canvasHeight = gameArea.height;

        this.gridWidth = gameArea.gridWidth;
        this.gridHeight = gameArea.gridHeight;

        
        this.grid = Array(gameArea.gridWidth+2).fill(0).map(
            x => Array(gameArea.gridWidth+2).fill(0).map(
                y => []
            )
        );
        
        this.towers = [];

        this.path = [];
        if (path.length < 2)
            throw new Error("Invalid path with length " + path.length);

        for (let i = 0; i < path.length; i++) {
            let x = path[i][0];
            let y = path[i][1];

            let p = new PathTile(x, y);

            this.path.push(p);
            this.setGridAt(parseInt(x),parseInt(y),p);

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

    setGridAt(x,y,obj){
        this.grid[x+1][y+1] = obj;
    }

    getGridAt(x,y){
        if(x+1 < 0 || this.grid.length <= x+1){
            console.log("x", x);
            return;
        }
        if(y+1 < 0 || this.grid[x+1].length <= y+1){
            console.log("y", y);
            return;
        }
        return this.grid[x+1][y+1];
    }


    // Get the canvas (x, y) from a progress value 0 <= t <= this.path.length - 1.
    getPosition(t) {
        if (t < 0 || t > this.path.length - 1)
            throw new Error("t out of bounds [0, " + (this.path.length - 1) + "] with value " + t);

        if (Math.floor(t) === t)
            return [
                this.path[Math.floor(t)].x,
                this.path[Math.floor(t)].y
            ];
        else {
            let prev = this.path[Math.floor(t)];
            let next = this.path[Math.ceil(t)];
            let interpol = t - Math.floor(t);

            return [
                prev.x * (1 - interpol) + next.x * interpol,
                prev.y * (1 - interpol) + next.y * interpol
            ];
        }
    }

    clear(){
        for (var i = 0; i < this.path.length; i++) {
            this.path[i].clear();
        }
    }

}

class PathTile {
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.prev = null;
        this.next = null;
        this.data = new LinkedList();
	}

    add(obj){
        this.data.push(obj);
    }

    remove(obj){
        let node = this.data.first;
        while (node !== null && node !== undefined){
            if (node.obj == obj){
                this.data.remove(node);
                return;
            }
            node = node.next;
        }
    }

    hasCreep(){
        return (this.data.first !== null);
    }

}
