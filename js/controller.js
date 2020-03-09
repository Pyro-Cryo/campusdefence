class Controller {
    constructor() {
        // Store the game area, which can be drawn to
        this.gameArea = new GameArea(document.getElementsByTagName("canvas")[0]);

        // Essentially the frame rate inverse
        this.updateInterval = 20; //milliseconds
        // Store the inteval object so that we can abort the main loop
        this.mainInterval = setInterval(() => this.update(), this.updateInterval);
        // All objects which receive update calls
        this.objects = new LinkedList();
        // The id of the next registered object
        this.idCounter = 0;
    }
    // Clear the canvas and let all objects redraw themselves
    update() {
        this.gameArea.clear();
        for (let current = this.objects.first; current !== null; current = current.next) {
            if (current.obj.id === null) {
                let c = current.prev;
                this.objects.remove(current);
                current = c || this.objects.first;
                continue;
            }
            if (current.obj.update !== undefined)
                current.obj.update(this.gameArea);
        }
    }
    // Register an object to receive update calls.
    // It should have an update method accepting a GameArea and allow for setting an id
    registerObject(object) {
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
        node.next = undefined;
        node.prev = undefined;
    }
}