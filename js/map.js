class TDMap {

    constructor(path, gameArea, margin) {
        this.canvasWidth = gameArea.width;
        this.canvasHeight = gameArea.height;

        this.gridInnerWidth = gameArea.gridWidth;
        this.gridInnerHeight = gameArea.gridHeight;
        this.margin = Number.isInteger(margin) ? margin : 1;
        this.gridWidth = this.gridInnerWidth + 2 * this.margin;
        this.gridHeight = this.gridInnerHeight + 2 * this.margin;

        //Tror det är bättre att lagra y i första indexet och x i andra,
        //så blir det naturligare om man ex. printar till konsolen
        this.grid = Array(this.gridHeight).fill(0).map(
            y => Array(this.gridWidth).fill(0).map(
                x => []
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
            this.setGridAt(parseInt(x), parseInt(y), p);

            if (i !== 0) {
                this.path[i - 1].next = this.path[i];
                this.path[i].prev = this.path[i - 1];
            }
        }
    }

    addTower(tower) {
        if (this.towers.findIndex(t => t.id === tower.id) === -1)
            this.towers.push(tower);
    }
    removeTower(tower) {
        if (typeof tower === "number")
            this.towers = this.towers.filter(t => t.id !== tower);
        else
            this.towers = this.towers.filter(t => t.id !== tower.id);
    }

    setGridAt(x, y, obj) {
        this.grid[y + this.margin][x + this.margin] = obj;
    }

    getGridAt(x, y) {
        if (x + this.margin < 0 || this.gridWidth - 1 < x + this.margin)
            throw new Error("x = " + x + " out of range [-" + this.margin + ", " + (this.gridInnerWidth + this.margin) + "]");
        if (y + this.margin < 0 || this.gridHeight - 1 < y + this.margin)
            throw new Error("y = " + y + " out of range [-" + this.margin + ", " + (this.gridInnerHeight + this.margin) + "]");
        return this.grid[y + this.margin][x + this.margin];
    }

    validPosition(x, y) {
        return (x + this.margin >= 0
            && this.gridWidth - 1 >= x + this.margin
            && y + this.margin >= 0
            && this.gridHeight - 1 >= y + this.margin);
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

    clear() {
        for (var i = 0; i < this.path.length; i++) {
            this.path[i].clear();
        }
    }

}

class PathTile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.prev = null;
        this.next = null;
        this.data = new Set();
    }

    add(obj) {
        this.data.add(obj);
    }

    remove(obj) {
        this.data.delete(obj);
    }

    clear() {
        this.data.clear();
    }

    hasCreep() {
        return !!this.data.size;
    }

}
