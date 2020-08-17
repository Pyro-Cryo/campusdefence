class Controller {
    constructor(gridWidth, gridHeight) {
        // Store the game area, which can be drawn to
        this.gameArea = new GameArea(document.getElementsByTagName("canvas")[0], gridWidth, gridHeight);
        this.isPaused = true;
        this.isFF = false;
        // Essentially the frame rate inverse
        this.updateInterval = 20; //milliseconds
        // Framerate for real
        this.drawInterval = 25;
        // Store the inteval object so that we can abort the main loop
        this.mainInterval = null;

        this.drawInterval = setInterval(() => this.draw(), this.drawInterval);
        // All objects which receive update calls
        this.objects = new LinkedList();
        // The id of the next registered object
        this.idCounter = 0;

        // Buttons
        this.playbutton = document.querySelector("button.controllerButton#playButton");
        this.ffbutton = document.querySelector("button.controllerButton#fastForwardButton");
        this.resetbutton = document.querySelector("button.controllerButton#resetButton");

        this.playbutton.onclick = this.playpause.bind(this);
        this.ffbutton.onclick = this.fastforward.bind(this);
        this.ffbutton.disabled = true;

        // Info field
        this.messagebox = document.getElementById("messagebox");
    }

    fixPath(path) {
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

    playpause(){
        if(this.isPaused)
            this.onPlay();
        else
            this.onPause();
    }

    fastforward(){
        if(this.isFF){
            clearInterval(this.mainInterval);
            this.mainInterval = setInterval(() => this.update(), this.updateInterval);
            this.onFF();
            this.isFF = false;
        }
        else{
            clearInterval(this.mainInterval);
            this.mainInterval = setInterval(() => this.update(), this.updateInterval/3);
            this.isFF = true;
        }
    }


    onPlay(){

        this.isPaused = false;
        this.mainInterval = setInterval(() => this.update(), this.updateInterval);

        this.playbutton.innerHTML = "⏸";
        this.ffbutton.disabled = false;

    }

    onPause(){

        this.isPaused = true;
        clearInterval(this.mainInterval);
        this.playbutton.innerHTML = "▶";
        this.ffbutton.disabled = true;
        this.isFF = false;

    }

    onFF(){
        
    }

    setMessage(message, pureText) {
        if (pureText)
            this.messagebox.innerText = message;
        else
            this.messagebox.innerHTML = message;
    }

    clearMessage() {
        this.messagebox.innerText = "\xa0";
    }

    // Clear the canvas and let all objects redraw themselves
    update() {
        
        for (let current = this.objects.first; current !== null; current = current.next) {
            if (current.obj.id === null) {
                let c = current.prev;
                this.objects.remove(current);
                current = c || this.objects.first;
                if (current === null)
                    break;
                else
                    continue;
            }
            if (current.obj.update !== undefined)
                current.obj.update();
        }
    }
    draw() {

        this.gameArea.clear();
        for (let current = this.objects.first; current !== null; current = current.next) {
            if (current.obj.id === null){
                continue
            }
            current.obj.draw(this.gameArea);
        }
    }
    // Register an object to receive update calls.
    // It should have an update method accepting a GameArea and allow for setting an id
    registerObject(object, prepend) {
        if (prepend)
            this.objects.prepend(object);
        else
            this.objects.push(object);
        object.id = this.idCounter++;
    }
    // Make the object stop receiving update calls.
    unregisterObject(object) {
        object.id = null;
    }
    stop() {
        if (this.mainInterval !== null) {
            clearInterval(this.mainInterval);
            this.mainInterval = null;
        }
    }
    resume() {
        if (this.mainInterval === null)
            this.mainInterval = setInterval(() => this.update(), this.updateInterval);
    }
}

// A doubly linked list used to store objects
class LinkedList {
    constructor() {
        this.first = null;
        this.last = null;
    }
    // Add an object at the end of the list
    push(obj) {
        if (this.first === null) {
            this.first = { obj: obj, next: null, prev: null };
            this.last = this.first;
        }
        else {
            let node = { obj: obj, next: null, prev: this.last };
            this.last.next = node;
            this.last = node;
        }
    }
    // Add an object at the beginning of the list
    prepend(obj) {
        if (this.first === null) {
            this.first = { obj: obj, next: null, prev: null };
            this.last = this.first;
        }
        else {
            let node = { obj: obj, next: this.first, prev: null };
            this.first.prev = node;
            this.first = node;
        }
    }
    // Remove a node from the list
    // Note that this accept a linked list node, not the data itself,
    // which you persumably get by iterating through the list using .next
    remove(node) {
        if (node === this.first) {
            this.first = node.next;
            if (this.first === null)
                this.last = null;
            else
                this.first.prev = null;
        }
        if (node === this.last) {
            this.last = node.prev;
            if (this.last === null)
                this.first = null;
            else
                this.last.next = null;
        }

        if(node.prev !== null)
            node.prev.next = node.next;
        
        if(node.next !== null)
            node.next.prev = node.prev;

        node.next = undefined;
        node.prev = undefined;
    }
}