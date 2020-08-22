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

    static randomPath(width, height, margin, minLength, maxLength, attempts) {
        margin = Number.isInteger(margin) ? margin : 1;
        minLength = Number.isInteger(minLength) ? minLength : (width + height) * 1.5;
        maxLength = Number.isInteger(maxLength) ? maxLength : width * height / 4;
        attempts = Number.isInteger(attempts) ? attempts : Number.POSITIVE_INFINITY;

        let xInit = Math.floor(Math.random() * width);
        let yInit = Math.floor(Math.random() * height);
        let path;
        if (Math.random() < 0.5) {
            xInit = Math.random() < 0.5 ? -margin : width - 1 + margin;
            path = [[xInit, yInit], [xInit - Math.sign(xInit), yInit]];
        }
        else {
            yInit = Math.random() < 0.5 ? -margin : height - 1 + margin;
            path = [[xInit, yInit], [xInit, yInit - Math.sign(yInit)]];
        }

        while (true) {
            const x = path[path.length - 1][0];
            const y = path[path.length - 1][1];

            if (x === -margin || x === width - 1 + margin
                || y === -margin || y === height - 1 + margin
                || path.length > maxLength) {
                if (path.length < minLength || path.length > maxLength)
                    return attempts > 1 ? this.randomPath(width, height, margin, minLength, maxLength, attempts - 1) : null;
                else
                    return path;
            }

            let candidates = [];
            let pos;
            for (let t = 0; t < 4; t++) {
                pos = [Math.round(x + Math.cos(Math.PI * t / 2)), Math.round(y + Math.sin(Math.PI * t / 2))];
                // Kräv lite space runt banan
                let freePos = [
                    [Math.round(pos[0] + Math.cos(Math.PI * (t + 1) / 2)), Math.round(pos[1] + Math.sin(Math.PI * (t + 1) / 2))],
                    [Math.round(pos[0] + Math.cos(Math.PI * (t - 1) / 2)), Math.round(pos[1] + Math.sin(Math.PI * (t - 1) / 2))]
                ];
                if (path.some(p => (p[0] === pos[0] && p[1] === pos[1])
                    || (p[0] === freePos[0][0] && p[1] === freePos[0][1]) || (p[0] === freePos[1][0] && p[1] === freePos[1][1])))
                    continue;
                candidates.push(pos);
            }

            if (candidates.length === 0)
                return attempts > 1 ? this.randomPath(width, height, margin, minLength, maxLength, attempts - 1) : null;
            pos = candidates[Math.floor(Math.random() * candidates.length)];
            path.push(pos);
        }
    }

    static fixPath(path) {
        let res = [];
        for (let i = 0; i < path.length - 1; i++) {
            let diff = Math.max(Math.abs(path[i + 1][0] - path[i][0]), Math.abs(path[i + 1][1] - path[i][1]));
            for (let j = 0; j < diff; j++) {
                res.push([
                    Math.round(path[i][0] + (path[i + 1][0] - path[i][0]) * j / diff),
                    Math.round(path[i][1] + (path[i + 1][1] - path[i][1]) * j / diff)
                ]);
            }
        }
        res.push(path[path.length - 1]);
        return res;
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
            gameArea.square(this.path[i].x, this.path[i].y, "rgba(" + i*2 + ", 30, 20, 0.6)");
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
