class TDController extends Controller {
    constructor() {
        super(19, 16);
        controller = this;
        let path = [
            [18, 16],
            [18, 13],
            [13, 13],
            [13, 12],
            [10, 12],
            [10, 11],
            [8, 11],
            [8, 10],
            [7, 10],
            [7, 8],
            [9, 8],
            [9, 6],
            [12, 6],
            [12, 4],
            [11, 4],
            [11, 3],
            [10, 3],
            [10, 2],
            [8, 2],
            [8, 1],
            [5, 1],
            [5, 3],
            [4, 3],
            [4, 5],
            [3, 5],
            [3, 7],
            [5, 7],
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
        this.levelNumberElement = document.getElementById("levelno");
        this.creepSummaryElement = document.getElementById("creepSummary");

        this.initialHP = 140+51;
        this.hp = this.initialHP;
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
            },
            {
                type: Forfadder1,
            },
            {
                type: Frida,
                unlockLevel: 3
            },
            {
                type: Nicole,
                unlockLevel: 4
            },
            {
                type: Becca,
                unlockLevel: 5
            },
            {
                type: Axel,
                unlockLevel: 6
            },
            {
                type: Fnoell,
                unlockLevel: 7
            },
            {
                type: CoffeMaker,
                unlockLevel: 8
            }
        ];

        for (var i = 0; i < this.towerSpecs.length; i++) {
            this.towerSpecs[i].cost = this.towerSpecs[i].type.cost;
            this.towerSpecs[i].name = this.towerSpecs[i].type.name;
            this.towerSpecs[i].description = this.towerSpecs[i].type.desc;
            this.towerSpecs[i].button = null;
        }
        
        this.buyingTower = null;

        this.loadFromCookie();
        this.updateCreepSummary();
        this.setMessage(levelMessage(this.levelNumber), false);
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
                    if(current.obj instanceof Projectile || current.obj instanceof BaseCreep){
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
            this.setMessage("<b>Game over</b><br /><br />Du nådde till nivå " + this.levelNumber.toString() + ".");
            this.clearState();
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
        if (music.readyState == 4)
            music.play();
        super.onPlay();
    }

    onPause() {
        if (music_speedy.duration > 0 && !music_speedy.paused)
            music.currentTime = music_speedy.currentTime * music.duration / music_speedy.duration;
        music.pause();
        music_speedy.pause();
        super.onPause();
    }

    onFF() {
        music.pause();
        music_speedy.currentTime = music.currentTime * music_speedy.duration / music.duration;
        music_speedy.play();
    }
    offFF() {
        music_speedy.pause();
        music.currentTime = music_speedy.currentTime * music.duration / music_speedy.duration;
        music.play();
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
                let cl = ti.querySelector("span[class='unlockInfo']");
                if(!cl){
                    return;
                }
                cl.classList.remove("hideme");
                ti.classList.remove("locked");
                ti.classList.add("unlocked");
                console.log("added");
                setTimeout(() => ti.classList.remove("unlocked") || console.log("removed"), /\d/.exec(window.getComputedStyle(ti).animationDuration)[0]* 1000);
            }
        });
        this.levelNumber++;
        this.saveToCookie();
        this.updateCreepSummary();
        this.setMessage(levelMessage(this.levelNumber), false);
    }

    updateCreepSummary() {
        let iterator = (this.levelIterator || getLevel(this.levelNumber, this.updateInterval));
        let remaining = iterator.remaining();
        let codebook = iterator.codebook();

        this.levelNumberElement.innerText = this.levelNumber;
        while (this.creepSummaryElement.firstChild)
            this.creepSummaryElement.removeChild(this.creepSummaryElement.lastChild);
        let i = 0;
        for (let creepType in remaining)
        {
            let img = new Image();
            img.src = codebook[creepType].image.src;
            this.creepSummaryElement.appendChild(new Text((i ? ", " : "") + remaining[creepType] + "\xa0"));
            this.creepSummaryElement.appendChild(img);
            i++;
        }
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
                "Skicka faddern att hjälpa en annan sektion. Du får tillbaka " + (this.sellPriceMultiplier * spec.cost) + " " + dollares,
                null, () => {
                    this.selectedTower.destroy();
                    this.selectedTower = null;
                    this.destroyContextMenu();
                    this.money += this.sellPriceMultiplier * spec.cost;
                }
            );
            if (this.selectedTower.upgrades){

                for (var i = 0; i < this.selectedTower.upgrades.length; i++) {
                    let upgrade = this.selectedTower.upgrades[i];

                    // Check if we have all required previous upgrades
                    if(!upgrade.requires.every(function(elem){
                        return this.selectedTower.gadgets.some(function(g){
                            return g.constructor.name === elem.name;
                        })
                    }.bind(this))){
                        continue;
                    }

                    // Check that we dont have any upgrades that blockes this one
                    if(upgrade.blocked.some(function(elem){
                        return this.selectedTower.gadgets.some(function(g){
                            return g.constructor.name === elem.name;
                            // return typeof(g) === elem;
                        })
                    }.bind(this))){
                        continue;
                    }

                    this.contextOption(
                        upgrade.name,
                        "Betala " + upgrade.cost + " " + dollares + " " +
                        (upgrade.hits && this.selectedTower.hits < upgrade.hits ? "Kräver " + upgrade.hits + " träffar. " : "") +
                        upgrade.desc,
                        "Uppgradera",
                        () => {
                            // Gör detta elegantare med knappar som är disabled och enablas när man faktiskt har råd
                            let hitdiff = upgrade.hits - this.selectedTower.hits;
                            if (this.money < upgrade.cost)
                                alert("Du har inte råd med det.");
                            else if (hitdiff > 0)
                                alert("Faddern måste träna mer - den behöver ytterligare " + hitdiff + " träff" + (hitdiff === 1 ? "" : "ar") + ".");
                            else {
                                this.money -= upgrade.cost;
                                let gadget = new upgrade.type(this.selectedTower);

                                this.saveToCookie();
                                this.destroyContextMenu();
                                this.setupContextMenu();
                            }
                        }
                    );
                }
            }
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
            if (spec.unlockLevel && spec.unlockLevel > this.levelNumber)
            {
                template.querySelector("span[class='unlockInfo']").innerText = "Låses upp vid nivå " + spec.unlockLevel;
                template.classList.add("locked");
            }
            else
            {
                template.querySelector("span[class='unlockInfo']").classList.add("hideme");
                template.classList.add("initiallyAvailable");
            }

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
                spec.button.innerHTML = this.buyingTower.oldContent;
                spec.button.title = spec.description;
                controller.buyingTower = null;
                this.saveToCookie();

                // console.log("Money:", controller.money);
            });
            this.registerObject(this.buyingTower);
            this.buyingTower.oldContent = originatingButton.innerHTML;
            originatingButton.innerText = "Avbryt";
            originatingButton.title = "Avbryt det pågående köpet";
        }
    }

    saveToCookie(){

        if(this.levelIterator !== null || this.levelCleared == false){
            // Spara inte mitt i en level
            return;
        }

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
                t.gadgets = [];
                for (var i = 0; i < current.obj.gadgets.length; i++) {
                    t.gadgets.push(current.obj.gadgets[i].constructor.name)
                }
                data.towers.push(t);
            }
        }

        window.localStorage.setItem("campusdefence_state", JSON.stringify(data));

    }

    loadFromCookie(){

        let data = window.localStorage.getItem("campusdefence_state");
        if (!data)
            return;
        data = JSON.parse(data);


        this.levelNumber = data.level;
        this.hp = data.health;
        this.money = data.money;

        for (var i = 0; i < data.towers.length; i++) {
            let x = data.towers[i].x;
            let y = data.towers[i].y;
            let type = this.towerSpecs.find(ts => ts.type.name === data.towers[i].type).type;
            let tower = new type(x, y);
            tower.hits = data.towers[i].hits;

            if(data.towers[i].gadgets){
            
                for (var j = 0; j < data.towers[i].gadgets.length; j++) {
                    for (var k = 0; k < tower.upgrades.length; k++) {
                        if(tower.upgrades[k].type.name == data.towers[i].gadgets[j]){
                            let g = new tower.upgrades[k].type(tower);
                            break;
                        }
                    }
                }
            }
        }
    }

    clearState() {
        window.localStorage.removeItem("campusdefence_state");
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
                Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.type.range + 0.1
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

