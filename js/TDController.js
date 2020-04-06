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
        var map_img = new Image();
        map_img.src = "img/map.png";
        this.map = new TDMap(map_img, path, this.gameArea);
        this.registerObject(this.map, true);

        this.isPaused = true;
        this.levelNumber = 0;
        this.levelIterator = null;
        this.levelCleared = false;

        //console.log("https://statistik.uhr.se/rest/stats/tableData?request=%7B%22tillfalle%22%3A%22Urval2%22%2C%22vy%22%3A%22Total%22%2C%22antagningsomgang%22%3A%22HT2019%22%2C%22larosateId%22%3A%22KTH%22%2C%22utbildningstyp%22%3A%22p%22%2C%22fritextFilter%22%3A%22Teknisk%22%2C%22urvalsGrupp%22%3A%22%22%2C%22firstResult%22%3A0%2C%22maxResults%22%3A25%2C%22sorteringsKolumn%22%3A1%2C%22sorteringsOrdningDesc%22%3Afalse%2C%22requestNumber%22%3A1%2C%22paginate%22%3Atrue%7D");
        //TODO: gör nåt av detta
        // HP borde ju rimligtvis vara 7.5
        this.hp = 139;
        this.money = 500;

        this.towerSpecs = [
            {
                type: Helmer,
                cost: 200,
                name: "Helmer",
                description: "Ett väldigt grundläggande torn som skjuter ett skott mot fiender det ser. Det åstadkommer kanske inte så mycket, men i slutändan måste man inte alltid göra det för att vara lycklig här i livet. Det är ändå vännerna man vinner på vägen som räknas.",
                img: "img/helmer1.png",
                button: null
            },
            {
                type: OmniHelmer,
                cost: 600,
                name: "Omni-Helmer",
                description: "Ett torn med enorm potential. Genom att göra skotten mer kompakta kan det träffa flera fiender samtidigt. Det tycker väldigt mycket om den här typen av skott och använder därför hellre för många än för få.",
                img: "img/helmer2.png",
                button: null
            },
            {
                type: KeytarHelmer,
                cost: 500,
                name: "Keytar-Helmer",
                description: "Det här tornet förklarar sig självt.",
                img: "img/helmer3.png",
                button: null
            }
        ];
        
        this.buyingTower = null;
    }

    update(gameArea) {
        super.update();

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
            document.getElementById("healthcounter").innerHTML= this.hp.toString();
        }
        document.getElementById("moneycounter").innerHTML= this.money.toString();
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

    setupTowerTable() {

        for (var i = 0; i < this.towerSpecs.length; i++) {
            let spec = this.towerSpecs[i];

            let template = document.getElementById("towerTemplate").cloneNode(true);
            template.querySelector("img[name='image']").src = spec.img;
            template.querySelector("strong[name='title']").innerText = spec.name;
            template.querySelector("span[name='desc']").innerText = spec.description;
            template.querySelector("span[name='cost']").innerText = spec.cost;
            let btn = template.querySelector("button[name='buybtn']");
            btn.onclick = function(){
                controller.buyTower(spec.type, spec.cost, btn)
            }.bind(spec);

            template.classList.remove("template");
            template.removeAttribute("id");
            document.getElementById("towerTemplate").parentElement.appendChild(template);
            spec.button = btn;
        }
        

        /*
        function createTowerButton(spec) {
            let button = document.createElement("button");
            button.innerText = spec.name;
            button.title = spec.description;
            button.onclick = () => controller.buyTower(spec.type, spec.cost, button);

            spec.button = button;
            return button;
        }

        let table = document.getElementById("towerTable");
        for (let row = 0; row < 2; row++) {
            let tr = document.createElement("tr");
            for (let col = 0; col < this.towerSpecs.length / 2; col++) {
                let td = document.createElement("td");
                if (col * 2 + row < this.towerSpecs.length) {
                    td.appendChild(createTowerButton(this.towerSpecs[col * 2 + row]));
                } else
                    td.innerHTML = "&nbsp;";

                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        */
    }

    buyTower(type, cost, originatingButton) {
        let onlyCancel = this.buyingTower !== null && this.buyingTower.type === type;

        // Avbryt ett eventuellt pågående köp om sånt finns
        if (this.buyingTower !== null) {
            this.buyingTower.done();
            this.buyingTower = null;
        }

        // Om man tryckte på ett annat torn än det man först höll på att köpa
        // (eller om man inte höll på att köpa något) påbörjar vi ett köp
        if (!onlyCancel) {
            this.buyingTower = new PseudoTower(type, cost, () => {
                let spec = this.towerSpecs.find(s => s.type === type);
                spec.button.innerText = "Köp";
                spec.button.title = spec.description;
                controller.buyingTower = null;

                console.log("Money:", controller.money);
            });
            this.registerObject(this.buyingTower);
            originatingButton.innerText = "Avbryt";
            originatingButton.title = "Avbryt det pågående köpet";
        }

        console.log("Money:", this.money);
    }
}

class PseudoTower extends GameObject {
    constructor(type, cost, doneCallback) {
        super(type.image, -100, -100, 0, type.scale);
        this.type = type;
        this.cost = cost;
        this.posOK = false;

        this.doneCallback = doneCallback;
        this.mouseMoveCallback = this.updatePos.bind(this);
        controller.gameArea.canvas.addEventListener('mousemove', this.mouseMoveCallback);
        this.clickCallback = this.buy.bind(this);
        controller.gameArea.canvas.addEventListener('click', this.clickCallback);
    }

    updatePos(event) {
        let rect = controller.gameArea.canvas.getBoundingClientRect();
        let pos = controller.gameArea.canvasToGrid(event.clientX - rect.left, event.clientY - rect.top);
        this.x = Math.round(pos[0]);
        this.y = Math.round(pos[1]);
        this.posOK = controller.map.validPosition(this.x, this.y) && controller.map.getGridAt(this.x, this.y) === null;
    }

    done() {
        controller.gameArea.canvas.removeEventListener('mousemove', this.mouseMoveCallback);
        controller.gameArea.canvas.removeEventListener('click', this.clickCallback);
        this.id = null;

        this.doneCallback();
    }

    buy() {
        if (this.posOK) {
            controller.money -= this.cost;
            new this.type(this.x, this.y);
            this.done();
        }
    }

    update(gameArea) {
        gameArea.disc(this.x, this.y, this.type.range, this.posOK ? "rgba(0, 212, 0, 0.5)" : "rgba(212, 0, 0, 0.5)");
        super.update(gameArea);
    }
}

