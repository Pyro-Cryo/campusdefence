class TDController extends Controller {
    constructor() {
        super(9, 9);
        controller = this;
        let path = [
            [-1, 0],
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [4, 1],
            [4, 2],
            [4, 3],
            [5, 3],
            [6, 3],
            [7, 3],
            [7, 4],
            [7, 5],
            [6, 5],
            [5, 5],
            [4, 5],
            [4, 6],
            [4, 7],
            [4, 8],
            [3, 8],
            [2, 8],
            [2, 7],
            [2, 6],
            [1, 6],
            [1, 7],
            [1, 8],
            [0, 8],
            [-1, 8]
        ];
        this.map = new TDMap(path, this.gameArea);
        this.isPaused = true;
        this.levelNumber = 0;
        this.levelIterator = null;
        this.levelCleared = false;

        //console.log("https://statistik.uhr.se/rest/stats/tableData?request=%7B%22tillfalle%22%3A%22Urval2%22%2C%22vy%22%3A%22Total%22%2C%22antagningsomgang%22%3A%22HT2019%22%2C%22larosateId%22%3A%22KTH%22%2C%22utbildningstyp%22%3A%22p%22%2C%22fritextFilter%22%3A%22Teknisk%22%2C%22urvalsGrupp%22%3A%22%22%2C%22firstResult%22%3A0%2C%22maxResults%22%3A25%2C%22sorteringsKolumn%22%3A1%2C%22sorteringsOrdningDesc%22%3Afalse%2C%22requestNumber%22%3A1%2C%22paginate%22%3Atrue%7D");
        //TODO: gör nåt av detta
        this.hp = 139;
        this.money = 500;
    }
    update(gameArea) {
        super.update(gameArea);

        if (!this.isPaused) {
            if (this.levelIterator) {
                let done = this.levelIterator.next().done;
                if (done)
                    this.levelIterator = null;
            }
            else if (!this.levelCleared) {
                this.levelCleared = this.map.path.every(pt => !pt.hasCreep());
                if (this.levelCleared)
                    this.endLevel();
            }
        }
    }
    startLevel() {
        this.isPaused = false;
        this.levelNumber++;
        console.log("Starting level " + this.levelNumber);
        this.levelIterator = getLevel(this.levelNumber, this.updateInterval);
        this.levelCleared = false;
        console.log("Time: " + this.levelIterator.totalTime() * this.updateInterval / 1000 + " s");
        console.log("Total creeps: " + this.levelIterator.totalExplicitCreeps());
        console.log("Creep summary: ", this.levelIterator.creepSummary());
    }
    endLevel() {
        this.isPaused = true;
        this.levelIterator = null;
        this.levelCleared = false;
        console.log("Cleared level " + this.levelNumber);
    }
}

let controller;
setTimeout(() => {
    controller = new TDController();
    new Helmer(6, 4);
    new Helmer(3, 7);
    new OmniHelmer(3, 4);
    new KeytarHelmer(5, 1);

}, 1000);