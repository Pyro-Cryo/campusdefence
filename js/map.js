let DIAGONAL_INCOMING = 1;
let DIAGONAL_OUTGOING = 2;

class TDMap {
    static get mapName() {
        return "Generisk Karta";
    }

    constructor(img, path, gameArea, margin) {
    	this.img = img;
        this.canvasWidth = gameArea.width;
        this.canvasHeight = gameArea.height;
        this.name = this.constructor.mapName;

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

        //Tror det är bättre att lagra y i första indexet och x i andra,
        //så blir det naturligare om man ex. printar till konsolen
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
            if (i < path.length - 1) {
                let dist = Math.abs(x - path[i + 1][0]) + Math.abs(y - path[i + 1][1]);
                if (dist > 2)
                    throw new Error("Path is not connected!");
                if (dist > 1)
                    p.diagonality |= DIAGONAL_OUTGOING;
            }
            if (i > 0 && (this.path[this.path.length - 1].diagonality & DIAGONAL_OUTGOING))
                p.diagonality |= DIAGONAL_INCOMING;

            this.path.push(p);
            this.setGridAt(Math.floor(x), Math.floor(y), p);

            if (i !== 0) {
                this.path[i - 1].next = this.path[i];
                this.path[i].prev = this.path[i - 1];
            }
        }

        let interpolationFunction = t => Splines.interpolateLocalBezier((this.path.length - 1) * t, this.path, 4, true);
        this.linearizedPath = Splines.piecewise(4 * this.path.length, interpolationFunction);
        
        let borderCol = [0, 0, 0];
        let pathCol = [255, 255, 255];
        this.pathimg = this.createPathImg(gameArea, 2000, interpolationFunction, [
                [
                    [...borderCol, 0.1]
                ], [
                    borderCol
                ], [
                    [...pathCol, 0.1],
                    [...pathCol, 0.1],
                    [...pathCol, 0.1],
                    [...pathCol, 0.1],
                    [255, 127, 127, 0.1]
                ],[
                    pathCol,
                    pathCol,
                    pathCol,
                    pathCol,
                    [255, 127, 127]
                ]
            ], [
                0.48,
                0.43,
                0.38,
                0.33
            ]);
        this.pathAlpha = 0.9;
    }

    static randomPath(width, height, margin, minLength, maxLength, attempts) {
        if (!width || !height)
            throw new Error("Give me something to work with here. A " + width + "x" + height + " map? Please.");
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

    block(tiles) {
        if(typeof(tiles) == Array && typeof(tiles[0]) == Number)
            this.setGridAt(tiles[0], tiles[1], -1);
        if(typeof(tiles) == Array && typeof(tiles[0]) == Array)
            for (var i = 0; i < tiles.length; i++) 
                this.setGridAt(tiles[i][0], tiles[i][1], -1);
            
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
        return Splines.interpolateLinear(t, this.linearizedPath, this.path.length);
    }

    clear() {
        for (var i = 0; i < this.path.length; i++) {
            this.path[i].clear();
        }
    }

    update() {
    }

    draw(gameArea){
        gameArea.draw(this.img, this.gridInnerWidth/2-1/2, this.gridInnerHeight/2-1/2, 0, this.scale);
        gameArea.context.globalAlpha = this.pathAlpha;
        gameArea.context.drawImage(this.pathimg, 0, 0);
        gameArea.context.globalAlpha = 1;
    }

    createPathImg(gameArea, n_points, interpolationFunction, gradients, sizes) {
        if (gradients.length !== sizes.length)
            throw new Error("Please match the arrays' lengths.");

        function interpolateGradient(t, grad) {
            t = t * (grad.length - 1);
            let col;
            if (Math.floor(t) === t)
                col = grad[Math.floor(t)];
            else {
                let prev = grad[Math.floor(t)];
                let next = grad[Math.ceil(t)];
                let interpol = t - Math.floor(t);

                col = prev.map((v, i) => v * (1 - interpol) + next[i] * interpol);
            }
            if (col.length === 4)
                return "rgba(" + col.join(",") +  ")";
            else
                return "rgb(" + col.join(",") +  ")";
        }

        gameArea.clear();
        let pos;
        const ctx = gameArea.context;
        let fillStyle = ctx.fillStyle;
        for (let spec_ind = 0; spec_ind < sizes.length; spec_ind++) {
            for (let i = 0; i < n_points; i++) {
                pos = interpolationFunction(i / (n_points - 1));
                pos[0] = gameArea.gridToCanvasX(pos[0]);
                pos[1] = gameArea.gridToCanvasY(pos[1]);
                ctx.beginPath();
                ctx.arc(pos[0], pos[1], sizes[spec_ind] * gameArea._scaleFactor, 0, 2 * Math.PI);
                ctx.fillStyle = interpolateGradient(i / (n_points - 1), gradients[spec_ind]);
                ctx.fill();
            }
        }
        ctx.fillStyle = fillStyle;
        let pathimg = new Image();
        pathimg.src = gameArea.canvas.toDataURL("image/png");
        gameArea.clear();
        return pathimg;
    }
}

class PathTile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.prev = null;
        this.next = null;
        this.data = new Set();
        this.diagonality = 0;

        this._first = null;
        this._last = null;
        this._strong = null;
        this._weak = null;
    }

    add(obj) {
        this.data.add(obj);

        if(this._first === null || obj.distance > this._first.distance)
            this._first = obj;
        if(this._last === null || obj.distance < this._last.distance)
            this._last = obj;
        if(this._strong === null || obj.strength > this._strong.strength)
            this._strong = obj;
        if(this._weak == null || obj.strength < this._weak.strength)
            this._weak = obj;
    }

    remove(obj) {
        this.data.delete(obj);

        if(obj === this._first)
            this._first = null;
        if(obj === this._last)
            this._last = null;
        if(obj === this._strong)
            this._strong = null;
        if(obj === this._weak)
            this._weak = null;

    }

    clear() {
        this.data.clear();
        
        this._first = null;
        this._last = null;
        this._strong = null;
        this._weak = null;
    }

    hasCreep() {
        return !!this.data.size;
    }

    arbitraryCreep() {
        return this.hasCreep() ? this.data.values().next().value : null;
    }

    get first() {
        if(this._first === null)
            for (let it = this.data.values(), creep=null; creep=it.next().value; )
                if(this._first === null || creep.distance > this._first.distance)
                    this._first = creep;
        return this._first;
    }
    get last() {
        if(this._last === null)
            for(let it = this.data.values(), creep=null; creep=it.next().value; )
                if(this._last === null || creep.distance < this._last.distance)
                    this._last = creep;
        return this._last;
    }
    get strong() {
        if(this._strong === null)
            for(let it = this.data.values(), creep=null; creep=it.next().value; )
                if(this._strong === null || this._strong.constructor.strength < creep.constructor.strength)
                    this._strong = creep;
        return this._strong;
    }
    get weak() {
        if(this._weak === null)
            for(let it = this.data.values(), creep=null; creep=it.next().value; )
                if(this._weak === null || this._weak.constructor.strength > creep.constructor.strength)
                    this._weak = creep;
        return this._weak;
    }
    get any() {
        return this.arbitraryCreep();
    }
    
}
