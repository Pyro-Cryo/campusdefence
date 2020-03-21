class BaseCreep extends GameObject {
    constructor(image, scale, map, speed) {
        let pos = map.getPosition(0);
        super(image, pos[0], pos[1], 0, scale);
        this.speed = speed;
        this.pathlength = map.path.length - 1;
        this.distance = 0;
        this.map = map;
        this.lastx = this.x;
        this.lasty = this.y;

        this.pathtile = map.path[0];
        this.pathtile.add(this);
    }
    onDeath() {
        this.id = null;
    }
    onGoal() {
        this.id = null;
    }
    update(gameArea) {
        if (this.id === null)
            return;
        
        this.lastx = this.x;
        this.lasty = this.y;

        this.distance = Math.max(0, Math.min(this.pathlength, this.distance + this.speed));
        let pos = this.map.getPosition(this.distance);
        this.x = pos[0];
        this.y = pos[1];

        if (this.distance >= this.pathlength){
            this.onGoal();
        }
        else{
            
            if(parseInt(this.x) > -2){ // This is a temporary hack. TODO sometimes later
                let pt = this.map.getGridAt(parseInt(this.x), parseInt(this.y));

                if(pt !== this.pathtile){
                    this.pathtile.remove(this);
                    this.pathtile = pt;
                    this.pathtile.add(this);
                }
            }
        }

        super.update(gameArea);
    }
}