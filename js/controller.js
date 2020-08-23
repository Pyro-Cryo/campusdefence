class Controller {
    constructor(gridWidth, gridHeight) {
        // Store the game area, which can be drawn to
        this.gameArea = new GameArea(document.getElementsByTagName("canvas")[0], gridWidth, gridHeight);
        this.isPaused = true;
        this.isFF = false;
        // Essentially the frame rate inverse
        this.updateInterval = 20; //milliseconds
        // Framerate for real
        this.drawInterval = 30;
        // Store the inteval object so that we can abort the main loop
        this.mainInterval = null;

        this.drawLoop = null;
        // All objects which receive update calls
        this.objects = new LinkedList();
        // The id of the next registered object
        this.idCounter = 0;
        // Objects which are drawn over all others
        this.delayedRenderObjects = [];
        // The type of objects which are inserted into delayedRenderObjects
        this.delayedRenderType = null;

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

    begin() {
        this.drawLoop = setInterval(() => this.draw(), this.drawInterval);
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
            this.offFF();
            this.isFF = false;
        }
        else{
            clearInterval(this.mainInterval);
            this.mainInterval = setInterval(() => this.update(), this.updateInterval/3);
            this.onFF();
            this.isFF = true;
        }
    }


    onPlay(){

        this.isPaused = false;
        this.mainInterval = setInterval(() => this.update(), this.updateInterval);

        this.playbutton.children[0].classList.add("hideme");
        this.playbutton.children[1].classList.remove("hideme");
        this.ffbutton.disabled = false;

    }

    onPause(){

        this.isPaused = true;
        clearInterval(this.mainInterval);
        this.playbutton.children[0].classList.remove("hideme");
        this.playbutton.children[1].classList.add("hideme");
        this.ffbutton.classList.remove("keptPressed");
        this.ffbutton.disabled = true;
        this.isFF = false;

    }

    onFF() {
        this.ffbutton.classList.add("keptPressed");
    }

    offFF() {
        this.ffbutton.classList.remove("keptPressed");
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
        for (let i = 0; i < this.delayedRenderObjects.length; i++)
            if (this.delayedRenderObjects[i].id === null) {
                this.delayedRenderObjects = this.delayedRenderObjects.filter(o => o.id !== null);
                break;
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

        for (let i = 0; i < this.delayedRenderObjects.length; i++)
            if (this.delayedRenderObjects[i].id !== null) {
                this.delayedRenderObjects[i].draw(this.gameArea);
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
        if (this.delayedRenderType && object instanceof this.delayedRenderType)
            this.delayedRenderObjects.push(object);
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