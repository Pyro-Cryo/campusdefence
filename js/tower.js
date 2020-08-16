class BaseTower extends GameObject {
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
        throw new Error("Abstract property cost must be overridden by subclass");
    }
    static get desc() {
        throw new Error("Abstract property cost must be overridden by subclass");
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

    target() {
        return this.inrange.find(pt => pt.hasCreep()) || null;
    }

    pathInRange() {
        return this.map.path.filter(pt =>
            Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.range + 0.1
        ).reverse();
    }

    // Vet inte om man borde decoupla det här lite mer så att de skjuter mot godtyckligt (x, y) snarare än en pathtile
    fire(target) {
        let proj = this.projectile(target);
        if(proj === null) {
            return;
        }
        controller.registerObject(proj);
        this.CDtimer = this.CDtime;
    }

    projectile(target) {
        // Create and return a new projectile object, that is targeted at target
        return null;
    }

    addGadget(gadget){
        this.gadgets.push(gadget);
        this.upgrades = this.upgrades.filter(up => gadget.constructor.name !== up.type.name);
    }

    update() {
        if (this.CDtimer <= 0) {
            let target = this.target();
            if (target)
                this.fire(target);
        } else
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
}


class OmniTower extends BaseTower {
    fire(target) {
        for (var dx = -1; dx < 2; dx++) {
            for (var dy = -1; dy < 2; dy++) {
                if (dx === 0 && dy === 0)
                    continue;
                let t = { x: this.x + dx * this.range, y: this.y + dy * this.range };
                super.fire(t);
            }
        }
    }
}


class TargetingTower extends BaseTower {
    fire(target) {
        this.angle = Math.atan2(target.y - this.y, target.x - this.x);
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