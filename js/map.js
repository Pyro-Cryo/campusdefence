class TDMap {

    constructor(img, path, gameArea, margin) {
    	this.img = img;
        this.canvasWidth = gameArea.width;
        this.canvasHeight = gameArea.height;

        let setScale = (() => {
            this.scale = 1 / Math.min(img.width / gameArea.width, img.height / gameArea.height);
        }).bind(this);
        if (img.complete)
            setScale();
        else {
            this.scale = 1;
            img.addEventListener('load', setScale);
        }

        this.gridInnerWidth = gameArea.gridWidth;
        this.gridInnerHeight = gameArea.gridHeight;
        this.margin = Number.isInteger(margin) ? margin : 1;
        this.gridWidth = this.gridInnerWidth + 2 * this.margin;
        this.gridHeight = this.gridInnerHeight + 2 * this.margin;

        //Tror det �r b�ttre att lagra y i f�rsta indexet och x i andra,
        //s� blir det naturligare om man ex. printar till konsolen
        this.grid = Array(this.gridHeight).fill(0).map(
            y => Array(this.gridWidth).fill(0).map(
                x => null
            )
        );

        this.towers = [];
        this.eventListeners = [];

        this.path = [];
        if (path.length < 2)
            throw new Error("Invalid path with length " + path.length);

        for (let i = 0; i < path.length; i++) {
            let x = path[i][0];
            let y = path[i][1];

            let p = new PathTile(x, y);

            this.path.push(p);
            this.setGridAt(Math.floor(x), Math.floor(y), p);

            if (i !== 0) {
                this.path[i - 1].next = this.path[i];
                this.path[i].prev = this.path[i - 1];
            }
        }
    }

    addEventListener(callback){
        this.eventListeners.push(callback);
    }

    removeEventListener(callback) {
        this.eventListeners = this.eventListeners.filter(function(el){
            return el != callback;
        });
    }

    addTower(tower) {
        if (this.towers.findIndex(t => t.id === tower.id) === -1) {
            this.towers.push(tower);
            this.setGridAt(tower.x, tower.y, tower);

            for (var i = 0; i < this.eventListeners.length; i++) {
                this.eventListeners[i](tower);
            }
        }
    }
    removeTower(tower) {
        this.towers = this.towers.filter(t => t !== tower);
        this.setGridAt(tower.x, tower.y, null);

        for (var i = 0; i < this.eventListeners.length; i++) {
            this.eventListeners[i](tower);
        }
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

    visiblePosition(x, y) {
        return (x >= 0
            && this.gridInnerWidth - 1 >= x
            && y >= 0
            && this.gridInnerHeight - 1 >= y);
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

    update(gameArea) {
    }

    draw(gameArea){
        gameArea.draw(this.img, this.gridInnerWidth/2-1/2, this.gridInnerHeight/2-1/2, 0, this.scale);
        this.drawPath(gameArea);
    }

    drawPath(gameArea) {
        for (let i = 0; i < this.path.length; i++)
            gameArea.square(this.path[i].x, this.path[i].y, "rgba(40, 30, 20, 0.6)");
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

    arbitraryCreep() {
        return this.hasCreep() ? this.data.values().next().value : null;
    }
    
}
