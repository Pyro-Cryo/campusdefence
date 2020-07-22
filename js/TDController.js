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

        this.selectedTower = null;
        this.gameArea.canvas.addEventListener('click', this.onClickBoard.bind(this));

        this.levelNumber = 0;
        this.levelIterator = null;
        this.levelCleared = false;

        //console.log("https://statistik.uhr.se/rest/stats/tableData?request=%7B%22tillfalle%22%3A%22Urval2%22%2C%22vy%22%3A%22Total%22%2C%22antagningsomgang%22%3A%22HT2019%22%2C%22larosateId%22%3A%22KTH%22%2C%22utbildningstyp%22%3A%22p%22%2C%22fritextFilter%22%3A%22Teknisk%22%2C%22urvalsGrupp%22%3A%22%22%2C%22firstResult%22%3A0%2C%22maxResults%22%3A25%2C%22sorteringsKolumn%22%3A1%2C%22sorteringsOrdningDesc%22%3Afalse%2C%22requestNumber%22%3A1%2C%22paginate%22%3Atrue%7D");
        //TODO: gör nåt av detta
        // HP borde ju rimligtvis vara 7.5
        this.hp = 139;
        this.money = 500;
        this.sellPriceMultiplier = 0.8;

        this.towerSpecs = [
            {
                type: Helmer,
                cost: 200,
                name: "Helmer",
                description: "Ett väldigt grundläggande torn som skjuter ett skott mot fiender det ser. Det åstadkommer kanske inte så mycket, men i slutändan måste man inte alltid göra det för att vara lycklig här i livet. Det är ändå vännerna man vinner på vägen som räknas.",
                button: null,
                upgrades: [
                    {
                        type: KeytarHelmer,
                        cost: 280,
                        name: "Keytar-Helmer",
                        description: "Det här tornet förklarar sig självt.",
                        requiredHits: 20
                    },
                    {
                        type: OmniHelmer,
                        cost: 325,
                        name: "Omni-Helmer",
                        description: "Ett torn med enorm potential. Genom att göra skotten mer kompakta kan det träffa flera fiender samtidigt. Det tycker väldigt mycket om den här typen av skott och använder därför hellre för många än för få.",
                        requiredHits: 50
                    }
                ]
            },
            {
                type: OmniHelmer,
                cost: 600,
                name: "Omni-Helmer",
                description: "Ett torn med enorm potential. Genom att göra skotten mer kompakta kan det träffa flera fiender samtidigt. Det tycker väldigt mycket om den här typen av skott och använder därför hellre för många än för få.",
                button: null,
                cannotPurchaseDirectly: true
            },
            {
                type: KeytarHelmer,
                cost: 500,
                name: "Keytar-Helmer",
                description: "Det här tornet förklarar sig självt.",
                button: null,
                upgrades: [
                    {
                        type: OmniHelmer,
                        cost: 25,
                        name: "Omni-Helmer",
                        description: "Ett torn med enorm potential. Genom att göra skotten mer kompakta kan det träffa flera fiender samtidigt. Det tycker väldigt mycket om den här typen av skott och använder därför hellre för många än för få.",
                        requiredHits: 50
                    }
                ]
            },
            {
                type: GKJonas,
                cost: 300,
                name: "GK-Jonas",
                description: "Vad det här tornet gör är ganska uppenbart. Ingen vill kännas vid dess uråldriga kraft.",
                button: null
            }
        ];
        
        this.buyingTower = null;
    }

    update() {
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

            // Hantera hälsa
            document.getElementById("healthcounter").innerHTML= this.hp.toString();
            if(this.hp <= 0){
                this.endLevel();
                console.log("Game over. You reached level " + this.levelNumber.toString());
            }
        }

        //Hantera pengar
        document.getElementById("moneycounter").innerHTML= this.money.toString();
        for (var i = 0; i < this.towerSpecs.length; i++) {
            // om pengar minskar kan köp-knappen disablas medan du köper tornet, men det verkar osannolikt?
            if(this.towerSpecs[i].cost > this.money){
                this.towerSpecs[i].button.disabled = "disabled";
            }
            else if (this.towerSpecs[i].button.hasAttribute("disabled")){
                this.towerSpecs[i].button.removeAttribute("disabled");
            }
        }

        // Highlighta valt torn
        if (this.selectedTower !== null)
            this.gameArea.disc(this.selectedTower.x, this.selectedTower.y, 0.5, "rgba(0, 212, 0, 0.4)");
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
        this.map.clear();
    }
    playPause(){
        this.isPaused = !this.isPaused;
    }

    onClickBoard(event) {
        if (this.buyingTower !== null)
            return;

        if (this.selectedTower !== null) {
            this.selectedTower = null;
            this.destroyContextMenu();
        }

        let rect = controller.gameArea.canvas.getBoundingClientRect();
        let pos = controller.gameArea.canvasToGrid(event.clientX - rect.left, event.clientY - rect.top);
        this.x = Math.round(pos[0]);
        this.y = Math.round(pos[1]);
        if (!controller.map.validPosition(this.x, this.y))
            return;
        let tower = controller.map.getGridAt(this.x, this.y);
        if (tower === null || !(tower instanceof BaseTower))
            return;
        
        //Tower clicked
        this.selectedTower = tower;
        this.setupContextMenu();
    }

    setupContextMenu() {
        document.querySelector(".towerMarket").classList.add("hideme");
        document.querySelector(".contextMenu").classList.remove("hideme");

        const scrollAmount = 4; //Valt genom empirisk testning. Mindre än så så cancelleras inte scrollningen.
        if (window.scrollY < scrollAmount) {
            window.scrollBy(0, scrollAmount);
            window.scrollBy(0, -scrollAmount);
        } else {
            window.scrollBy(0, -scrollAmount);
            window.scrollBy(0, scrollAmount);
        }

        let dollares = document.getElementById("moneycounter").parentElement.innerText.replace(/[\d ]+/, "");

        function contextOption(name, description, buttonLabel, buttonAction) {
            let option = document.getElementById("optionTemplate").cloneNode(true);
            option.querySelector("strong[name='title']").innerText = name;
            option.querySelector("span[name='desc']").innerText = description;
            let btn = option.querySelector("button[name='actionbtn']");
            btn.innerText = buttonLabel || name;
            btn.onclick = buttonAction;

            option.classList.remove("template");
            option.removeAttribute("id");
            document.getElementById("optionTemplate").parentElement.appendChild(option);
            return option;
        }

        let spec = this.towerSpecs.find(spec => this.selectedTower instanceof spec.type);
        if (!spec)
            contextOption(
                "Skicka hem",
                "Skicka hem faddern. Du får inte tillbaka några " + dollares + ", men platsen blir ledig för att placera ut en ny.",
                null, () => {
                    this.selectedTower.destroy();
                    this.selectedTower = null;
                    this.destroyContextMenu();
                }
            );
        else {
            contextOption(spec.name, "Träffar: " + this.selectedTower.hits)
                .querySelector("button[name='actionbtn']").classList.add("hideme");
            contextOption(
                "Sälj",
                "Skicka faddern att hjälpa en annan sektion. Du får tillbaka " + (this.sellPriceMultiplier * spec.cost) + " " + dollares + ".",
                null, () => {
                    this.selectedTower.destroy();
                    this.selectedTower = null;
                    this.destroyContextMenu();
                    this.money += this.sellPriceMultiplier * spec.cost;
                }
            );
            if (spec.upgrades)
                spec.upgrades.forEach(upgrade => {
                    contextOption(
                        "Uppgradera till " + upgrade.name,
                        "Betala " + upgrade.cost + " " + dollares + " för att uppgradera till " + upgrade.name + ". " +
                        (upgrade.requiredHits && this.selectedTower.hits < upgrade.requiredHits ? "Kräver " + upgrade.requiredHits + " träffar. " : "") +
                        upgrade.description,
                        "Uppgradera",
                        () => {
                            // Gör detta elegantare med knappar som är disabled och enablas när man faktiskt har råd
                            let hitdiff = upgrade.requiredHits - this.selectedTower.hits;
                            if (this.money < upgrade.cost)
                                alert("Du har inte råd med det.");
                            else if (hitdiff > 0)
                                alert("Faddern måste träna mer - den behöver ytterligare " + hitdiff + " träff" + (hitdiff === 1 ? "" : "ar") + ".");
                            else {
                                let x = this.selectedTower.x;
                                let y = this.selectedTower.y;
                                let hits = this.selectedTower.hits;
                                this.money -= upgrade.cost;
                                this.selectedTower.destroy();
                                this.destroyContextMenu();
                                this.selectedTower = new upgrade.type(x, y);
                                this.selectedTower.hits = hits;
                                this.setupContextMenu();
                            }
                        }
                    );
                });
        }
    }
    destroyContextMenu() {
        document.querySelector(".towerMarket").classList.remove("hideme");
        document.querySelector(".contextMenu").classList.add("hideme");
        document.querySelectorAll(".contextOption:not(.template)").forEach(option => option.remove())
    }

    setupTowerTable() {

        for (var i = 0; i < this.towerSpecs.length; i++) {
            let spec = this.towerSpecs[i];

            let template = document.getElementById("towerTemplate").cloneNode(true);
            template.querySelector("img[name='image']").src = spec.type.image.src;
            template.querySelector("strong[name='title']").innerText = spec.name;
            template.querySelector("span[name='desc']").innerText = spec.description;
            template.querySelector("span[name='cost']").innerText = spec.cost;
            let btn = template.querySelector("button[name='buybtn']");
            btn.onclick = function(){
                controller.buyTower(spec.type, spec.cost, btn);
            }.bind(spec);

            template.classList.remove("template");
            template.removeAttribute("id");
            document.getElementById("towerTemplate").parentElement.appendChild(template);
            spec.button = btn;

            if (spec.cannotPurchaseDirectly)
                template.classList.add("hideme");
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

