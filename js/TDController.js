class TDController extends Controller {
    constructor() {
        super(16, 16);
        controller = this;
        let path = [
            [15, 16],
            [15, 13],
            [9, 13],
            [9, 12],
            [8, 12],
            [8, 11],
            [7, 11],
            [7, 6],
            [11, 6],
            [11, 4],
            [9, 4],
            [9, 2],
            [7, 2],
            [7, 1],
            [5, 1],
            [5, 3],
            [4, 3],
            [4, 5],
            [3, 5],
            [3, 7],
            [4, 7],
            [4, 8],
            [5, 8],
            [5, 10],
            [3, 10],
            [3, 9],
            [-1, 9]
        ];
        path = this.fixPath(path);
        var map_img = new Image();
        map_img.src = "img/map.png";
        this.map = new TDMap(map_img, path, this.gameArea);
        this.registerObject(this.map, true);

        this.selectedTower = null;
        this.gameArea.canvas.addEventListener('click', this.onClickBoard.bind(this));

        this.levelNumber = 1;
        this.levelIterator = null;
        this.levelCleared = true;

        this.hp = 140+51;
        this.money = 500;
        this.sellPriceMultiplier = 0.8;
        this.healthcounter = document.getElementById("healthcounter");
        this.moneycounter = document.getElementById("moneycounter");

        this.resetbutton.onclick = function(){
            if(!window.confirm("Vill du verkligen börja om? Alla framsteg kommer förloras.")){
                return;
            }
            this.clearState();
            location.reload();
        }.bind(this);

        this.towerSpecs = [
            {
                type: Fadder,
                cost: 200,
                name: "Fadder",
                description: "En vanlig fadder som kramar ninjor den ser. Faddern åstadkommer kanske inte så mycket, men i slutändan måste man inte alltid göra det för att vara lycklig här i livet. Det är ändå vännerna man vinner på vägen som räknas.",
                button: null,
                upgrades: [
                    {
                        type: Forfadder1,
                        cost: 150,
                        name: "Förfadder (snabb)",
                        description: "Den här förfaddern kramar dubbelt så snabbt som en vanlig fadder.",
                        requiredHits: 20
                    },
                    {
                        type: Forfadder2,
                        cost: 150,
                        name: "Förfadder (lång)",
                        description: "Den här förfaddern når mycket längre än en vanlig fadder.",
                        requiredHits: 20
                    }
                ]
            },
            {
                type: Forfadder1,
                cost: 350,
                name: "Förfadder (snabb)",
                description: "Den här förfaddern kramar dubbelt så snabbt som en vanlig fadder.",
                cannotPurchaseDirectly: true,
                upgrades: [
                    {
                        type: Becca,
                        cost: 0,
                        name: "Fjädrande Becca",
                        description: "Flamberande Becca har en eldkastare.",
                        requiredHits: 50
                    },
                    {
                        type: Axel,
                        cost: 200,
                        name: "Fjädrande Axel",
                        description: "Fackliga Axel älskar två saker: facklor och att festa. Han bjuder gärna alla omkring sig på Molotovcocktails, och när dessa exploderar träffar de alla ninjor inom ett visst område.",
                        requiredHits: 50
                    }
                ]
            },
            {
                type: Forfadder2,
                cost: 350,
                name: "Förfadder (lång)",
                description: "Den här förfaddern når mycket längre än en vanlig fadder.",
                cannotPurchaseDirectly: true,
                upgrades: [
                    {
                        type: Frida,
                        cost: 0,
                        name: "Fjädrande Frida",
                        description: "Fuskande Frida lägger inte ifrån sig sin avstängda mobil på anvisad plats. När hon skickar lösningarna till lämnisarna till en grupp ninjor försöker de läsa och gå samtidigt, men simultanförmåga är en bristvara hos ninjor.",
                        requiredHits: 50
                    },
                    {
                        type: Nicole,
                        cost: 100,
                        name: "Fjädrande Nicole",
                        description: "Fina Nicole älskar blommor. När en ninja blir träffad av en blomma inser den hur fel den haft, och ger sig av hemåt igen. Insikten varar tyvärr dock bara några sekunder varpå ninjan fortsätter framåt.",
                        requiredHits: 50
                    }
                ]
            },
            {
                type: Frida,
                cost: 400,
                name: "Fjädrande Frida",
                description: "Fuskande Frida lägger inte ifrån sig sin avstängda mobil på anvisad plats. När hon skickar lösningarna till lämnisarna till en grupp ninjor försöker de läsa och gå samtidigt, men simultanförmåga är en bristvara hos ninjor.",
                button: null,
                unlockLevel: 3
            },
            {
                type: Nicole,
                cost: 500,
                name: "Fjädrande Nicole",
                description: "Fina Nicole älskar blommor. När en ninja blir träffad av en blomma inser den hur fel den haft, och ger sig av hemåt igen. Insikten varar tyvärr dock bara några sekunder varpå ninjan fortsätter framåt.",
                button: null,
                unlockLevel: 4
            },
            {
                type: Becca,
                cost: 400,
                name: "Fjädrande Becca",
                description: "Flamberande Becca har en eldkastare.",
                button: null,
                unlockLevel: 5
            },
            {
                type: Axel,
                cost: 600,
                name: "Fjädrande Axel",
                description: "Fackliga Axel älskar två saker: facklor och att festa. Han bjuder gärna alla omkring sig på Molotovcocktails, och när dessa exploderar träffar de alla ninjor inom ett visst område.",
                button: null,
                unlockLevel: 6
            }
        ];
        
        this.buyingTower = null;

        this.loadFromCookie();
    }

    update() {
        super.update();

        if (this.levelIterator) {
            let done = this.levelIterator.next().done;
            if (done)
                this.levelIterator = null;
        }
        else if (!this.levelCleared) {
            this.levelCleared = this.map.path.every(pt => !pt.hasCreep());
            if(this.levelCleared){
                for (let current = this.objects.first; current !== null; current = current.next){
                    if(current.obj instanceof Projectile){
                        this.levelCleared = false;
                        break;
                    }
                }
            }
            if (this.levelCleared)
                this.endLevel();
        }

        // Hantera hälsa
        this.healthcounter.innerText = this.hp.toString();
        if (this.hp <= 0) {
            this.onPause();
            this.levelIterator = null;
            this.levelCleared = false;
            this.objects = new LinkedList();
            this.registerObject(new SplashScreen());
            console.log("Game over. You reached level " + this.levelNumber.toString());
            
            if (this.selectedTower !== null)
                this.destroyContextMenu();
            document.querySelector(".towerMarket").classList.add("hideme");
            document.querySelector(".contextMenu").classList.remove("hideme");
            this.contextOption("Spelet över", "Du kom till nivå " + this.levelNumber.toString())
                .querySelector("button[name='actionbtn']").classList.add("hideme");
            document.querySelectorAll("button").forEach(b => {
                b.disabled = "disabled";
            });
        }

    }

    draw() {
        super.draw();

        //Hantera pengar
        this.moneycounter.innerText = this.money.toString();
        for (var i = 0; i < this.towerSpecs.length; i++) {
            // om pengar minskar kan köp-knappen disablas medan du köper tornet, men det verkar osannolikt?
            if (this.towerSpecs[i].cost > this.money || (this.towerSpecs[i].unlockLevel && this.levelNumber < this.towerSpecs[i].unlockLevel)) {
                this.towerSpecs[i].button.disabled = "disabled";
            }
            else if (this.towerSpecs[i].button.hasAttribute("disabled")){
                this.towerSpecs[i].button.removeAttribute("disabled");
            }
        }
        // Highlighta valt torn
        if (this.selectedTower !== null) {
            this.gameArea.disc(this.selectedTower.x, this.selectedTower.y, this.selectedTower.range, "rgba(212, 212, 212, 0.4)");
            // Highlighta path som är in range
            this.selectedTower.inrange.forEach(pt =>
                this.gameArea.disc(pt.x, pt.y, 0.3, "rgba(255, 255, 255, 0.7)")
            );
        }

    }

    onPlay() {
        if(this.levelCleared)
            this.startLevel();
        super.onPlay();
    }

    startLevel() {
        console.log("Starting level " + this.levelNumber);
        this.levelIterator = getLevel(this.levelNumber, this.updateInterval);
        this.levelCleared = false;
        console.log("Time: " + this.levelIterator.totalTime() * this.updateInterval / 1000 + " s");
        console.log("Total creeps: " + this.levelIterator.totalExplicitCreeps());
        console.log("Creep summary: ", this.levelIterator.creepSummary());
    }
    endLevel() {
        this.onPause();
        this.levelIterator = null;
        this.levelCleared = true;
        console.log("Cleared level " + this.levelNumber);
        this.map.clear();

        levelClearReward(this.levelNumber);
        document.querySelectorAll(".towerInfo:not(.template)").forEach((ti, i) => {
            if (this.towerSpecs[i].unlockLevel && this.levelNumber + 1 >= this.towerSpecs[i].unlockLevel)
            {
                ti.querySelector("span[class='unlockInfo']").classList.remove("hideme");
                ti.classList.remove("locked");
            }
        });
        this.levelNumber++;
        this.saveToCookie();
    }

    onClickBoard(event) {
        if (this.buyingTower !== null)
            return;

        if (this.selectedTower !== null) {
            this.selectedTower = null;
            this.destroyContextMenu();
        }

        let rect = controller.gameArea.canvas.getBoundingClientRect();
        this.x = Math.round(controller.gameArea.canvasToGridX(event.clientX - rect.left));
        this.y = Math.round(controller.gameArea.canvasToGridY(event.clientY - rect.top));
        if (!controller.map.validPosition(this.x, this.y))
            return;
        let tower = controller.map.getGridAt(this.x, this.y);
        if (tower === null || !(tower instanceof BaseTower))
            return;
        
        //Tower clicked
        this.selectedTower = tower;
        this.setupContextMenu();
    }

    contextOption(name, description, buttonLabel, buttonAction) {
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

        let spec = this.towerSpecs.find(spec => this.selectedTower instanceof spec.type);
        if (!spec)
            this.contextOption(
                "Skicka hem",
                "Skicka hem faddern. Du får inte tillbaka några " + dollares + ", men platsen blir ledig för att placera ut en ny.",
                null, () => {
                    this.selectedTower.destroy();
                    this.selectedTower = null;
                    this.destroyContextMenu();
                }
            );
        else {
            this.contextOption(spec.name, "Träffar: " + this.selectedTower.hits)
                .querySelector("button[name='actionbtn']").classList.add("hideme");
            this.contextOption(
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
                    this.contextOption(
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
            if (spec.unlockLevel && spec.unlockLevel > 1)
            {
                template.querySelector("span[class='unlockInfo']").innerText = "Låses upp vid nivå " + spec.unlockLevel;
                template.classList.add("locked");
            }
            else
                template.querySelector("span[class='unlockInfo']").classList.add("hideme");

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


    saveToCookie(){

        let data = {};
        data.level = this.levelNumber;
        data.health = this.hp;
        data.money = this.money;
        data.towers = [];

        for (let current = this.objects.first; current !== null; current = current.next) {
            if(current.obj instanceof BaseTower){
                let t = {};
                t.type = current.obj.constructor.name;
                t.x = current.obj.x;
                t.y = current.obj.y;
                t.hits = current.obj.hits;
                data.towers.push(t);
            }
        }

        let now = new Date();
        now.setDate(now.getDate() + 5);

        let cookie = "state="+JSON.stringify(data) + "; expires=" + now.toUTCString() + "; path=/; samesite=lax";
        document.cookie = cookie;

    }

    loadFromCookie(){

        let cookie = getCookie("state");

        if(cookie == ""){
            return;
        }

        let data = JSON.parse(cookie);

        this.levelNumber = data.level;
        this.hp = data.health;
        this.money = data.money;

        for (var i = 0; i < data.towers.length; i++) {
            let x = data.towers[i].x;
            let y = data.towers[i].y;
            let type = this.towerSpecs.find(ts => ts.type.name === data.towers[i].type).type;
            
            let tower = new type(x, y);
            tower.hits = data.towers[i].hits;

        }

    }

    clearState(){

        document.cookie = "state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax";

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
        this.x = Math.round(controller.gameArea.canvasToGridX(event.clientX - rect.left));
        this.y = Math.round(controller.gameArea.canvasToGridY(event.clientY - rect.top));
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

    update() {
        super.update();
    }

    draw(gameArea) {
        gameArea.disc(this.x, this.y, this.type.range, this.posOK ? "rgba(0, 212, 0, 0.5)" : "rgba(212, 0, 0, 0.5)");
        if (this.posOK)
            controller.map.path.filter(pt =>
                Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.type.range
            ).forEach(pt =>
                gameArea.disc(pt.x, pt.y, 0.3, "rgba(255, 255, 255, 0.7)")
            );
        super.draw(gameArea);
    }
}


function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

