class BaseTower extends GameObject {

    static TARGET_FIRST = 1;
    static TARGET_LAST = 2;
    static TARGET_STRONG = 3;
    static TARGET_WEAK = 4;
    static TARGET_NONE = -1;

    static targetingValue(value){
        if(value == this.TARGET_FIRST)
            return "first";
        if(value == this.TARGET_LAST)
            return "last";
        if(value == this.TARGET_STRONG)
            return "strong";
        if(value == this.TARGET_WEAK)
            return weak;
        return null;
    }

    // Range in grid units
    static get range() {
        throw new Error("Abstract property range must be overridden by subclass");
    }
    // Cooldown time for projectiles, in ms
    static get CDtime() {
        throw new Error("Abstract property CDtime must be overridden by subclass");
    }
    // The tower's sprite
    static get image() {
        throw new Error("Abstract property image must be overridden by subclass");
    }
    // The tower's sprite's scale
    static get scale() {
        throw new Error("Abstract property scale must be overridden by subclass");
    }
    static get cost() {
        throw new Error("Abstract property cost must be overridden by subclass");
    }
    static get name() {
        throw new Error("Abstract property name must be overridden by subclass");
    }
    static get desc() {
        throw new Error("Abstract property desc must be overridden by subclass");
    }


    // CoolDowntime is measured in update ticks internally
    constructor(x, y) {
        super(undefined, x, y, 0, undefined);
        this.image = this.constructor.image;
        this.scale = this.constructor.scale;
        this.map = controller.map;
        this.range = this.constructor.range;
        this.CDtime = this.constructor.CDtime / controller.updateInterval;
        this.CDtimer = 0;
        this.hits = 0;

        this.gadgets = [];
        this.upgrades = [];

        this.inrange = this.pathInRange();

        controller.registerObject(this);
        this.map.addTower(this);

        this.configUpgrades();

        this._targeting = BaseTower.TARGET_NONE;
    }

    configUpgrades(){

    }

    addUpgrade(gadget, name, desc, cost, requires, blocked, minhits){

        this.upgrades.push({
            type: gadget,
            name: name,
            desc: desc,
            cost: cost,
            requires: requires,
            blocked: blocked,
            hits: minhits
        });

    }

    set targeting(t){
        if(this._targeting == BaseTower.TARGET_LAST)
            this.inrange.reverse();

        if(t == BaseTower.TARGET_FIRST || t == "first")
            this._targeting = BaseTower.TARGET_FIRST;
        else if(t == BaseTower.TARGET_LAST || t == "last")
            this._targeting = BaseTower.TARGET_LAST;
        else if(t == BaseTower.TARGET_STRONG || t == "strong")
            this._targeting = BaseTower.TARGET_STRONG;
        else if(t == BaseTower.TARGET_WEAK || t == "weak")
            this._targeting = BaseTower.TARGET_WEAK;
        else
            this._targeting = BaseTower.TARGET_NONE;

        if(this._targeting == BaseTower.TARGET_LAST)
            this.inrange.reverse();
    }

    get targeting() { return this._targeting; }



    target() {

        if(this._targeting == BaseTower.TARGET_FIRST){
            let tile = this.inrange.find(pt => pt.hasCreep());
            if(tile === undefined)
                return null;

            return tile.first;
        }

        if(this._targeting == BaseTower.TARGET_LAST){
            let tile = this.inrange.find(pt => pt.hasCreep());
            if(tile === undefined)
                return null;

            return tile.last;
        }

        if(this._targeting == BaseTower.TARGET_STRONG){
            let creep = null;
            let c = null;
            for (var i = 0; i < this.inrange.length; i++) {
                c = this.inrange[i].strong;
                if(c === null)
                    continue;
                if(creep === null || c.constructor.strength > creep.constructor.strength){
                    creep = c;
                }
            }
            return creep;
        }

        if(this._targeting == BaseTower.TARGET_WEAK){
            let creep = null;
            let c = null;
            for (var i = 0; i < this.inrange.length; i++) {
                c = this.inrange[i].weak;
                if(c === null)
                    continue;
                if(creep === null || c.constructor.strength < creep.constructor.strength){
                    creep = c;
                }
            }
            return creep;
        }

        return this.inrange.find(pt => pt.hasCreep());
    }

    pathInRange() {
        let path = this.map.path.filter(pt =>
            Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.range + 0.1
        ).reverse();

        if(this._targeting == BaseTower.TARGET_LAST)
            path.reverse();
        return path;
    }

    // Vet inte om man borde decoupla det här lite mer så att de skjuter mot godtyckligt (x, y) snarare än en pathtile
    fire(target) {
        let proj = this.projectile(target);
        if(proj === null) {
            return;
        }
        if(proj instanceof Array){
            for (var i = 0; i < proj.length; i++) {
                controller.registerObject(proj[i]);
            }
        }
        else{
            controller.registerObject(proj);
        }
        this.CDtimer += this.CDtime;
    }

    projectile(target) {
        // Create and return a new projectile object, that is targeted at target
        return null;
    }

    addGadget(gadget){
        this.gadgets.push(gadget);
        //this.upgrades = this.upgrades.filter(up => gadget.constructor.name !== up.type.name);
    }

    update() {
        if (this.CDtimer <= 0) {
            let target = this.target();
            if (target)
                this.fire(target);
        }
        else
            this.CDtimer--;


        super.update();

        for (var i = 0; i < this.gadgets.length; i++) {
            this.gadgets[i].update();
        }
    }

    draw(gameArea) {
        super.draw(gameArea);
        for (var i = 0; i < this.gadgets.length; i++) {
            this.gadgets[i].draw(gameArea);
        }
    }

    destroy() {
        controller.unregisterObject(this);
        this.map.removeTower(this);
    }

    get value() {
        return this.constructor.cost + this.gadgets.reduce((sum, g) => sum + this.upgrades.find(u => u.type.name === g.constructor.name).cost, 0);
    }
}


class OmniTower extends BaseTower {
    fire(target) {
        let cdtimer = this.CDtimer;
        for (var dx = -1; dx < 2; dx++) {
            for (var dy = -1; dy < 2; dy++) {
                if (dx === 0 && dy === 0)
                    continue;
                let t = { x: this.x + dx * this.range, y: this.y + dy * this.range };
                super.fire(t);
            }
        }
        this.CDtimer = cdtimer + this.CDtime;
    }
}


class TargetingTower extends BaseTower {

    constructor(x,y){
        super(x,y);
        this._targeting = BaseTower.TARGET_FIRST;
    }

    fire(target) {
        this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        // if (Math.abs(this.angle) > Math.PI / 2)
        //     this.angle -= Math.sign(this.angle) * Math.PI;
        super.fire(target);
    }
}

class SupportTower extends BaseTower {

    constructor(x,y){
        super(x,y);
        controller.map.addEventListener(this.onMapUpdate.bind(this));

        this.effectCDtime = this.constructor.CDtime / controller.updateInterval;
        this.effectCDtimer = -1;
        this.towersinrange = this.towersInRange();

    }

    update() {
        if(this.effectCDtimer >= 0){
            if(--this.effectCDtimer <= 0){
                this.remove();
            }
        }
        super.update();
    }

    towersInRange() {
        return controller.map.towers.filter(function(tower){
            if(tower === this){
                return false;
            }
            return Math.sqrt(Math.pow(this.x - tower.x, 2) + Math.pow(this.y - tower.y, 2)) < this.range + 0.1;
        }.bind(this));
    }
    apply() {
        for (var i = 0; i < this.towersinrange.length; i++) {
            this.applyTo(this.towersinrange[i]);
        }
    }
    remove() {
        this.effectCDtimer = -1;
        for (var i = 0; i < this.towersinrange.length; i++) {
            this.removeFrom(this.towersinrange[i]);
        }
    }
    applyTo(tower) {

    }
    removeFrom(tower) {

    }
    onMapUpdate(tower) {
        if(tower === this){
            return;
        }
        if(tower.id !== null){
            if(Math.sqrt(Math.pow(this.x - tower.x, 2) + Math.pow(this.y - tower.y, 2)) < this.range + 0.1){
                this.towersinrange.push(tower);
                this.applyTo(tower);
            }
        }
        else{
            this.towersinrange = this.towersinrange.filter(t =>
                t.id !== null 
                );
        }
    }
    destroy(){
        this.remove();
        super.destroy();
    }
}

class Gadget extends GameObject {

    // The tower's sprite
    static get image() {
        throw new Error("Abstract property image must be overridden by subclass");
    }
    // The tower's sprite's scale
    static get scale() {
        throw new Error("Abstract property scale must be overridden by subclass");
    }

    constructor(parent){
        let x = parent.x + 0.5 - parent.gadgets.length * 0.25;
        let y = parent.y + 0.5;
        super(undefined, x, y, 0, undefined);
        this.image = this.constructor.image;
        this.scale = this.constructor.scale;
        this.addTo(parent);
    }

    addTo(tower){
        tower.addGadget(this);
    }

}