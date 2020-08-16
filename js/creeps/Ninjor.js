/* ---------- Creeps ---------- */

let fohsimg = new Image();
fohsimg.src = "img/fohs.png";

class Ninja extends BaseCreep {
    static get speed() { return 0.5; }
    static get image() { return fohsimg; }
    static get scale() { return 1; }
}

let colorimgs = [new Image(), new Image(), new Image(), new Image(), new Image()];
colorimgs[0].src = "img/fohs_red.png";
colorimgs[1].src = "img/fohs_blue.png";
colorimgs[2].src = "img/fohs_pink.png";
colorimgs[3].src = "img/fohs_green.png";
colorimgs[4].src = "img/fohs_orange.png";

class ColorNinja extends MatryoshkaCreep {
    static get scale() { return 1; }
    static get innerCreepCount() { return 2; }
}

class Red extends ColorNinja {
    static get speed() { return 0.55; }
    static get image() { return colorimgs[0]; }
    static get innerCreep() { return Ninja; }
}
class Blue extends ColorNinja {
    static get speed() { return 0.6; }
    static get image() { return colorimgs[1]; }
    static get innerCreep() { return Red; }
}
class Pink extends ColorNinja {
    static get speed() { return 0.65; }
    static get image() { return colorimgs[2]; }
    static get innerCreep() { return Blue; }
}
class Green extends ColorNinja {
    static get speed() { return 0.7; }
    static get image() { return colorimgs[3]; }
    static get innerCreep() { return Pink; }
}
class Orange extends ColorNinja {
    static get speed() { return 0.75; }
    static get image() { return colorimgs[4]; }
    static get innerCreep() { return Green; }
}
