class TDController extends Controller {

    constructor() {
        super(19, 16);
        controller = this;

        this.map = null;

        this.delayedRenderType = BaseFohs;

        this.selectedTower = null;
        this.gameArea.canvas.addEventListener('click', this.onClickBoard.bind(this));
        this.contextMenuRefresh = null;

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

        this.levelListeners = [];

        this.versions = [
            "1.1.0",
            "1.1.1",
            "1.1.2",
            "1.1.3",
            "1.1.4",
            "1.1.5",
			"1.1.6",
            "1.1.7"
        ];
        if ((window.localStorage.getItem("campusdefence_version") || "1.0") !== this.versions[this.versions.length - 1]) {
            //window.alert("Campus Defence har uppdaterats och ditt sparade spel går tyvärr inte längre att fortsätta på.");
            window.localStorage.setItem("campusdefence_version", this.versions[this.versions.length - 1]);
            this.clearState();
            window.localStorage.removeItem("campusdefence_mapclass");
            location.reload();
        }
        window.localStorage.setItem("campusdefence_version", this.versions[this.versions.length - 1]);
        document.getElementById("version").innerText = this.versions[this.versions.length - 1];

        this.resetbutton.onclick = function(){
            if(!window.confirm("Vill du verkligen börja om? Alla framsteg kommer förloras.")){
                return;
            }
            this.clearState();
            location.reload();
        }.bind(this);

        this.muteButton = document.getElementById("muteButton");
        this.muteButton.onclick = this.toggleMute.bind(this);
        this.isMuted = false;
        if (JSON.parse(window.localStorage.getItem("campusdefence_muted") || "0"))
            this.toggleMute();

        this.towerSpecs = [];
        // Det här kan flyttas ut till nån sorts setup-map-funktion och ändras beroende på saker
        this.addTowerSpec({type: Fadder, unlockLevel: 0});
        this.addTowerSpec({type: Forfadder1, unlockLevel: 0});
        this.addTowerSpec({type: PseudoJellyHeartTower, unlockLevel: 3});
        this.addTowerSpec({type: Frida, unlockLevel: 3});
        this.addTowerSpec({type: Nicole, unlockLevel: 4});
        this.addTowerSpec({type: Axel, unlockLevel: 5});
        this.addTowerSpec({type: Becca, unlockLevel: 6});
        this.addTowerSpec({type: Fnoell, unlockLevel: 7});
        this.addTowerSpec({type: MatBeredare, unlockLevel: 8});
        this.addTowerSpec({type: MediaFadder, unlockLevel: 9});
        
        this.buyingTower = null;
        
        this.hitsFromSoldTowers = {};
        this.towerSpecs.forEach(ts => {
            this.hitsFromSoldTowers[ts.type.name] = 0;
        });
    }

    begin(){
    	this.loadFromCookie();
        this.updateCreepSummary();
        this.setMessage(levelMessage(this.levelNumber), false);

        super.begin();
    }

    setMap(map) {

    	if(this.map !== null){
    		throw "Map already set, cannot change map";
    	}
    	this.map = map;
        this.registerObject(this.map, true);
    }

    addTowerSpec(ts) {
    	if(ts.type == undefined)
    		throw "Undefined tower type for towerspec";
    	
    	if(ts.cost == undefined)
	    	ts.cost = ts.type.cost;
	    if(ts.name == undefined)
        	ts.name = ts.type.name;
        if(ts.description == undefined)
        	ts.description = ts.type.desc;
        ts.button = null;
    	this.towerSpecs.push(ts);
    }

    addLevelListener(obj){
        this.levelListeners.push(obj);
    }

    removeLevelListener(obj){
        this.levelListeners = this.levelListeners.filter(function(o){
            if(o.id != undefined && o.id === null)
                return true;
            if(o.id != undefined && o.id == obj.id)
                return true;
            return false;
        });
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
            if (this.levelCleared){
                for (let current = this.objects.first; current !== null; current = current.next){
                    if ((current.obj instanceof Projectile && !current.obj.constructor.persistent) || current.obj instanceof BaseCreep){
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
            this.delayedRenderObjects = [];
            this.registerObject(new SplashScreen());
            this.setMessage("<b>Game over</b><br /><br />Du nådde till nivå " + this.levelNumber.toString() + ".", false);
            this.clearState();
        }
    }

    draw() {
        super.draw();

        if (this.selectedTower !== null && this.contextMenuRefresh !== null) {
            if (this.contextMenuRefresh.hits !== this.selectedTower.hits || this.contextMenuRefresh.money !== this.money) {
                this.contextMenuRefresh.hits = this.selectedTower.hits;
                this.contextMenuRefresh.money = this.money;
                this.contextMenuRefresh.hitsspan.innerText = this.selectedTower.hits;
                this.contextMenuRefresh.contextOptions.forEach(co => {
                    co.currentState = this.checkContextOption(co.upgrade, co.option, co.currentState, co.blocking, co.existingRequired);
                });
            }
        }

        //Hantera pengar
        this.moneycounter.innerText = this.money.toString();
        for (var i = 0; i < this.towerSpecs.length; i++) {
            // om pengar minskar kan köp-knappen disablas medan du köper tornet, men det verkar osannolikt?
            if (this.hp <= 0 || this.towerSpecs[i].cost > this.money || (this.towerSpecs[i].unlockLevel && this.levelNumber < this.towerSpecs[i].unlockLevel)) {
                this.towerSpecs[i].button.disabled = "disabled";
            }
            else if (this.towerSpecs[i].button.hasAttribute("disabled")){
                this.towerSpecs[i].button.removeAttribute("disabled");
            }
        }
        // Highlighta valt torn
        if (this.selectedTower !== null) {
            this.gameArea.disc(this.selectedTower.x, this.selectedTower.y, this.selectedTower.range, "rgba(50, 50, 50, 0.4)");
            // Highlighta path som är in range
            this.selectedTower.inrange.forEach(pt =>
                this.gameArea.disc(pt.x, pt.y, 0.25, "rgba(255, 255, 255, 0.9)")
            );
        }
    }

    onPlay() {
        if(this.levelCleared)
            this.startLevel();
        if (music.readyState === 4)
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
        super.onFF();
    }
    offFF() {
        music_speedy.pause();
        music.currentTime = music_speedy.currentTime * music.duration / music_speedy.duration;
        music.play();
        super.offFF();
    }
    toggleMute() {
        this.isMuted ^= true;
        window.localStorage.setItem("campusdefence_muted", JSON.stringify(this.isMuted));

        if (this.isMuted) {
            this.muteButton.children[0].classList.remove("hideme");
            this.muteButton.children[1].classList.add("hideme");
            music.volume = 0;
            music_speedy.volume = 0;

        } else {
            this.muteButton.children[1].classList.remove("hideme");
            this.muteButton.children[0].classList.add("hideme");
            music.volume = volume;
            music_speedy.volume = volume;
        }
    }

    startLevel() {
        console.log("Starting level " + this.levelNumber);
        this.levelIterator = getLevel(this.levelNumber, this.updateInterval);
        this.levelCleared = false;
        console.log("Time: " + this.levelIterator.totalTime() * this.updateInterval / 1000 + " s");
        console.log("Total creeps: " + this.levelIterator.totalExplicitCreeps());
        console.log("Creep summary: ", this.levelIterator.creepSummary());

        for (var i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].onLevelUpdate(true);
        }
    }
    endLevel() {
        this.onPause();
        this.levelIterator = null;
        this.levelCleared = true;
        console.log("Cleared level " + this.levelNumber);
        this.map.clear();

        this.money += levelClearReward(this.levelNumber);
        document.querySelectorAll(".towerInfo:not(.template)").forEach((ti, i) => {
            if (this.towerSpecs[i].unlockLevel && this.levelNumber + 1 === this.towerSpecs[i].unlockLevel)
            {
                let cl = ti.querySelector("span[class='unlockInfo']");
                if(!cl){
                    return;
                }
                cl.classList.remove("hideme");
                ti.classList.remove("locked");
                ti.classList.add("unlocked");
                let cb = () => ti.classList.remove("unlocked");
                ti.addEventListener("webkitAnimationEnd", cb);
                ti.addEventListener("animationend", cb);
                ti.addEventListener("oanimationend", cb);
            }
        });
        this.levelNumber++;
        this.saveToCookie();
        this.updateCreepSummary();
        this.setMessage(levelMessage(this.levelNumber), false);

        for (var i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].onLevelUpdate(true);
        }
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
            let imgContainer = document.createElement("span");
            let addImg = () => {
                if (codebook[creepType].image instanceof Image)
                    imgContainer.appendChild(codebook[creepType].image.cloneNode());
                else if (codebook[creepType].image instanceof HTMLCanvasElement) {
                    let clone = codebook[creepType].image.cloneNode();
                    clone.getContext("2d").drawImage(codebook[creepType].image, 0, 0);
                    imgContainer.appendChild(clone);
                } else
                    throw new Error("Unrecognized image type");
            };
            if (codebook[creepType].image instanceof Image && codebook[creepType].image.complete)
                addImg();
            else if (codebook[creepType].image instanceof HTMLCanvasElement)
                addImg();
            else {
                let onload = codebook[creepType].image.onload;
                codebook[creepType].image.onload = () => {
                    if (onload)
                        onload();
                    addImg();
                };
            }
            this.creepSummaryElement.appendChild(new Text((i ? ", " : "") + remaining[creepType] + "\xa0"));
            this.creepSummaryElement.appendChild(imgContainer);
            i++;
        }
    }

    onClickBoard(event) {
        if (this.buyingTower !== null)
            return;

        if (this.selectedTower !== null) {
            this.selectedTower = null;
            this.contextMenuRefresh = null;
            this.destroyContextMenu();
        }

        let rect = controller.gameArea.canvas.getBoundingClientRect();
        this.x = Math.round(controller.gameArea.canvasToGridX(event.clientX - rect.left));
        this.y = Math.round(controller.gameArea.canvasToGridY(event.clientY - rect.top));
        // Avkommentera för hjälp att rita banor
        //console.log(this.x, this.y);

        if (!controller.map.validPosition(this.x, this.y))
            return;
        let tower = controller.map.getGridAt(this.x, this.y);
        if (tower === null || !(tower instanceof BaseTower))
            return;
        
        //Tower clicked
        this.selectedTower = tower;
        let contextOptions = this.setupContextMenu();
        this.contextMenuRefresh = {
            hits: 0, 
            hitsspan: document.querySelector(".contextMenu .infofield span[name='hits']"),
            contextOptions: contextOptions,
            money: this.money
        };
    }

    contextOption(spec) {
        let option = document.getElementById("optionTemplate").cloneNode(true);

        if (spec.imgsrc)
            option.querySelector("img[name='image']").src = spec.imgsrc;
        if (spec.title)
            option.querySelector("strong[name='title']").innerText = spec.title;
        if (spec.desc)
            option.querySelector("span[name='desc']").innerText = spec.desc;

        let btn = option.querySelector("button[name='actionbtn']");
        if (spec.button && spec.button.onclick)
        {
            if (!spec.button.cost)
                btn.innerText = spec.button.action || "Köp";
            else
            {
                btn.querySelector("span[name='action']").innerText = spec.button.action || "Köp";
                let costspan = btn.querySelector("span[name='cost']");
                if (spec.button.cost < 0)
                {
                    spec.button.cost = "+" + Math.abs(spec.button.cost);
                    costspan.style.color = "green";
                }
                costspan.innerText = spec.button.cost;
            }
            btn.onclick = spec.button.onclick;
        } else
            btn.classList.add("hideme");

        let incompatiblediv = option.querySelector("div[name='incompatibleUpgrades']");
        if (spec.incompatible && spec.incompatible.list && spec.incompatible.list.length
            && spec.incompatible.namesource && spec.incompatible.namesource.length)
            this.listUpgrades(spec.incompatible.list, spec.incompatible.namesource, incompatiblediv);
        else
            incompatiblediv.classList.add("hideme");

        option.classList.remove("template");
        option.removeAttribute("id");
        document.getElementById("optionTemplate").parentElement.appendChild(option);
        return option;
    }

    listGadgets(gadgetList, upgradeList, targetdiv) {
        for (let i = 0; i < gadgetList.length; i++) {
            let gadget = gadgetList[i];
            targetdiv.appendChild(
                new Text((i ? ", " : "")
                    + upgradeList.find(u => u.type.name === gadget.constructor.name).name
                    + "\xa0"
            ));
            if (gadget.image && gadget.image.src && gadget.image.src.length)
            {
                let img = new Image();
                img.src = gadget.image.src;
                targetdiv.appendChild(img);
            }
        }
    }

    listUpgrades(upgradeTypeList, towerUpgradesList, targetdiv) {
        for (let i = 0; i < upgradeTypeList.length; i++) {
            let upgrade = upgradeTypeList[i];
            if (towerUpgradesList.find(u => u.type === upgrade) === undefined){
            	continue;
            }
            targetdiv.appendChild(new Text((i ? ", " : "") + towerUpgradesList.find(u => u.type === upgrade).name + "\xa0"));
            if (upgrade.image && upgrade.image.src && upgrade.image.src.length)
            {
                let img = new Image();
                img.src = upgrade.image.src;
                targetdiv.appendChild(img);
            }
        }
    }

    setupContextMenu() {
        document.querySelector(".towerMarket").classList.add("hideme");
        let contextMenu = document.querySelector(".contextMenu");
        contextMenu.classList.remove("hideme");

        const scrollAmount = 4; //Valt genom empirisk testning. Mindre än så så cancelleras inte scrollningen.
        if (window.scrollY < scrollAmount) {
            window.scrollBy(0, scrollAmount);
            window.scrollBy(0, -scrollAmount);
        } else {
            window.scrollBy(0, -scrollAmount);
            window.scrollBy(0, scrollAmount);
        }

        // Setup info field
        let spec = this.towerSpecs.find(spec => this.selectedTower.constructor.name === spec.type.name);
        let sameTowers = this.map.towers.filter(t => t.constructor === this.selectedTower.constructor);
        let name = spec.name + (sameTowers.length > 1 ? " " + (sameTowers.indexOf(this.selectedTower) + 1) : "");

        contextMenu.querySelector("h3[name='name']").innerText = name;
        contextMenu.querySelector(".infofield img[name='image']").src = this.selectedTower.image.src;
        contextMenu.querySelector(".infofield span[name='hits']").innerText = this.selectedTower.hits;
        contextMenu.querySelector(".infofield span[name='range']").innerText = this.selectedTower.range;
        let cdtime_ms = Math.round(this.selectedTower.CDtime * this.updateInterval);
        contextMenu.querySelector(".infofield span[name='CDtime']").innerText = cdtime_ms < Math.pow(10, 2.5) ? cdtime_ms + " ms" : (cdtime_ms / 1000) + " s";

        let upgradesdiv = contextMenu.querySelector(".infofield div[name='upgrades']");
        upgradesdiv.innerText = "";

        if (this.selectedTower.gadgets && this.selectedTower.gadgets.length)
        {
            this.listGadgets(this.selectedTower.gadgets, this.selectedTower.upgrades, upgradesdiv);
            if (upgradesdiv.style.color)
                upgradesdiv.style.color = null;
        }
        else
        {
            upgradesdiv.innerText = "Inga";
            upgradesdiv.style.color = "gray";
        }

        // Setup target priority switch
        let prioselect = contextMenu.querySelector(".priorityfield > select[name='targeting']");

        if (this.selectedTower.targeting === BaseTower.TARGET_NONE) {
            prioselect.parentElement.classList.add("hideme");
            prioselect.disabled = true;
            prioselect.value = null;
        }
        else{
            prioselect.value = BaseTower.targetingValue(this.selectedTower.targeting);
            prioselect.parentElement.classList.remove("hideme");
            prioselect.disabled = false;
            prioselect.onchange = function(){
                this.selectedTower.targeting = prioselect.value;
            }.bind(this);
        }

        // Setup projectile info field
        let projectileInfo = this.selectedTower.projectileInfo();
        this.setupProjectileInfo(projectileInfo, contextMenu);
        
        // Setup available options
        this.contextOption({
            title: "Låna ut arbetskraft",
            desc: "Skicka faddern att permanent hjälpa en annan sektion. Du får tillbaka " + (this.sellPriceMultiplier * 100) + " % av fadderns värde.",
            imgsrc: "img/yeet.png",
            button: {
                action: "Adjö",
                cost: -Math.round(this.sellPriceMultiplier * this.selectedTower.value * (this.selectedTower.discount_multiplier || 1)),
                onclick: () => {
                    this.money += Math.round(this.sellPriceMultiplier * this.selectedTower.value * (this.selectedTower.discount_multiplier || 1));
                    this.hitsFromSoldTowers[this.selectedTower.constructor.name] += this.selectedTower.hits;
                    this.selectedTower.destroy();
                    this.selectedTower = null;
                    this.contextMenuRefresh = null;
                    this.destroyContextMenu();

                }
            }
        });

        let contextOptions = [];
        if (this.selectedTower.upgrades) {
            for (var i = 0; i < this.selectedTower.upgrades.length; i++) {
                let upgrade = this.selectedTower.upgrades[i];

                const truecost = Math.round(upgrade.cost * (this.selectedTower.discount_multiplier || 1));
                let option = this.contextOption({
                    title: upgrade.name,
                    desc: upgrade.desc,
                    imgsrc: (upgrade.type.image || this.selectedTower.image).src,
                    incompatible: {
                        list: upgrade.blocked.filter(u => u !== upgrade.type),
                        namesource: this.selectedTower.upgrades
                    },
                    button: {
                        action: "Köp",
                        cost: upgrade.costText ? upgrade.costText(truecost, this.selectedTower.discount_multiplier) : truecost,
                        onclick: () => {
                            this.money -= truecost;
                            let gadget = new upgrade.type(this.selectedTower);

                            this.saveToCookie();
                            this.destroyContextMenu();
                            let contextOptions = this.setupContextMenu();
                            this.contextMenuRefresh = {
                                hits: 0,
                                hitsspan: document.querySelector(".contextMenu .infofield span[name='hits']"),
                                contextOptions: contextOptions,
                                money: this.money
                            };
                        }
                    }
                    
                });

                let res = this.checkContextOption(upgrade, option, null);

                contextOptions.push({
                    upgrade: upgrade,
                    option: option,
                    currentState: res[0],
                    blocking: res[1],
                    existingRequired: res[2]
                });
            }
        }

        return contextOptions;
    }

    setupProjectileInfo(projectileInfo, contextMenu) {
        contextMenu = contextMenu || document.querySelector(".contextMenu");

        let projectilename = contextMenu.querySelector("h4[name='projectilename']");
        let projectileinfofield = contextMenu.querySelector(".projectilefield");
        if (!projectileInfo) {
            projectilename.classList.add("hideme");
            projectileinfofield.classList.add("hideme");
        } else {
            // Set name and image
            projectilename.classList.remove("hideme");
            projectileinfofield.classList.remove("hideme");
            projectilename.innerText = projectileInfo.name;
            projectileinfofield.querySelector("img[name='projectileimage']").src = projectileInfo.image.src;

            let labeltemplate = projectileinfofield.querySelector("div[name='labels'] .template");
            let valuetemplate = projectileinfofield.querySelector("div[name='values'] .template");
            let labels = [];
            let values = [];

            // Add all info entries
            for (var key of Object.keys(projectileInfo)) {
                if (key === "name" || key === "image")
                    continue;
                let label = labeltemplate.cloneNode();
                label.innerText = key;
                labels.push(label);
                let value = valuetemplate.cloneNode();
                value.innerText = projectileInfo[key];
                values.push(value);
            }

            // Set the correct classes on elements
            for (let i = 0; i < labels.length; i++) {
                labels[i].classList.remove("template");
                labels[i].classList.remove("hideme");
                values[i].classList.remove("template");
                values[i].classList.remove("hideme");
                if (i > 0) {
                    labeltemplate.parentElement.appendChild(document.createElement("br"));
                    valuetemplate.parentElement.appendChild(document.createElement("br"));
                }

                labeltemplate.parentElement.appendChild(labels[i]);
                valuetemplate.parentElement.appendChild(values[i]);
            }
        }
    }

    checkContextOption(upgrade, option, currentState, blocking, existingRequired) {
        const gotAllArgs = blocking && existingRequired;
        blocking = blocking || upgrade.blocked.filter(elem =>
            this.selectedTower.gadgets.some(g => 
                g.constructor.name === elem.name
            )
        );
        existingRequired = existingRequired || upgrade.requires.filter(elem => 
            this.selectedTower.gadgets.some(g =>
                g.constructor.name === elem.name
            )
        );
        // Check that we dont have any upgrades that block this one
        if (blocking.length) {
            if (currentState === "blocked")
                return gotAllArgs ? currentState : [currentState, blocking, existingRequired];
            if (this.selectedTower.gadgets.some(g => g.constructor.name == upgrade.type.name))
                option.classList.add("hideme");
            else {
                option.classList.add("locked");
                option.querySelector("button[name='actionbtn']").disabled = "disabled";
                let unlockInfo = option.querySelector(".unlockInfo");
                unlockInfo.innerText = "Inkompatibel med ";
                this.listUpgrades(blocking, this.selectedTower.upgrades, unlockInfo);
            }
            
            return gotAllArgs ? "blocked" : ["blocked", blocking, existingRequired];
        }
        // Check if we have all required previous upgrades
        else if (existingRequired.length !== upgrade.requires.length) {
            if (currentState === "requires")
                return gotAllArgs ? currentState : [currentState, blocking, existingRequired];
            option.classList.add("locked");
            option.querySelector("button[name='actionbtn']").disabled = "disabled";
            let unlockInfo = option.querySelector(".unlockInfo");
            unlockInfo.innerText = "Kräver ";
            this.listUpgrades(upgrade.requires.filter(u => existingRequired.indexOf(u) === -1), this.selectedTower.upgrades, unlockInfo);
            
            return gotAllArgs ? "requires" : ["requires", blocking, existingRequired];
        }
        // Check if we have trained enough
        else if (this.selectedTower.hits < upgrade.hits) {
            if (currentState === "untrained")
                return gotAllArgs ? currentState : [currentState, blocking, existingRequired];
            option.classList.add("locked");
            option.querySelector("button[name='actionbtn']").disabled = "disabled";
            option.querySelector(".unlockInfo").innerText = "Kräver " + upgrade.hits + " träff" + (upgrade.hits !== 1 ? "ar" : "");

            return gotAllArgs ? "untrained" : ["untrained", blocking, existingRequired];
        // Upgrade is available
        } else {
            if (currentState !== "unlocked") {
                option.classList.remove("locked");
                option.classList.remove("hideme");
            }
            if (currentState !== "affordable" && this.money >= Math.round(upgrade.cost * (this.selectedTower.discount_multiplier || 1)))
                option.querySelector("button[name='actionbtn']").removeAttribute("disabled");
            else if ((!currentState || currentState === "affordable") && this.money < Math.round(upgrade.cost * (this.selectedTower.discount_multiplier || 1)))
                option.querySelector("button[name='actionbtn']").disabled = "disabled";
            
            if (this.money >= Math.round(upgrade.cost * (this.selectedTower.discount_multiplier || 1)))
                return gotAllArgs ? "affordable" : ["affordable", blocking, existingRequired];
            else
                return gotAllArgs ? "unlocked" : ["unlocked", blocking, existingRequired];
        }
    }

    destroyContextMenu() {
        document.querySelector(".towerMarket").classList.remove("hideme");
        document.querySelector(".contextMenu").classList.add("hideme");
        document.querySelectorAll(".contextOption:not(.template)").forEach(option => option.remove());
        this.destroyProjectileInfo();
        this.contextMenuRefresh = null;
    }

    destroyProjectileInfo() {
        document.querySelectorAll(".projectilefield span:not(.template)").forEach(span => span.remove());
        document.querySelectorAll(".projectilefield br").forEach(br => br.remove());
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
            this.buyingTower.done(false);
            this.buyingTower = null;
        }

        // Om man tryckte på ett annat torn än det man först höll på att köpa
        // (eller om man inte höll på att köpa något) påbörjar vi ett köp
        if (!onlyCancel) {
        	this.buyingTower = new PseudoTower(type, cost, (didBuy) => {
                let spec = this.towerSpecs.find(s => s.type === type);

                spec.button.innerHTML = this.buyingTower.oldContent;
                spec.button.title = spec.description;
                controller.buyingTower = null;
                this.saveToCookie();

                if (didBuy && spec.type === PseudoJellyHeartTower && this.money >= cost){
			        // Köp fler på en gång
			        let btn = this.towerSpecs.find(elem => elem.type === PseudoJellyHeartTower).button;
			        this.buyTower(PseudoJellyHeartTower, PseudoJellyHeartTower.cost, btn);
                }
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
        data.hitsFromSoldTowers = this.hitsFromSoldTowers;
        data.path = this.map.path.map(pt => [pt.x, pt.y]);
        data.towers = [];

        for (let current = this.objects.first; current !== null; current = current.next) {
            if(current.obj instanceof BaseTower){
                let t = {};
                t.type = current.obj.constructor.name;
                t.x = current.obj.x;
                t.y = current.obj.y;
                t.hits = current.obj.hits;
                if (current.obj instanceof Fnoell) {
                    t.originalX = current.obj.originalX;
                    t.originalY = current.obj.originalY;
                }
                t.gadgets = [];
                for (var i = 0; i < current.obj.gadgets.length; i++) {
                    t.gadgets.push(current.obj.gadgets[i].constructor.name)
                }
                t.target = current.obj.targeting;
                t.discount_multiplier = current.obj.discount_multiplier;
                t.CDpenalty_multiplier = current.obj.CDpenalty_multiplier;
                data.towers.push(t);
            }
        }

        data.projectiles = [];
        for (let current = this.objects.first; current !== null; current = current.next){
        	if (current.obj instanceof JellyHeart){
				let p = {};
				p.type = current.obj.constructor.name;
				p.hp = current.obj.hitpoints;

				p.x = current.obj.x;
				p.y = current.obj.y;
                p.angle = current.obj.angle;

				data.projectiles.push(p);
        	}
        }

        window.localStorage.setItem("campusdefence_state", JSON.stringify(data));
    }

    getState() {
        let data = window.localStorage.getItem("campusdefence_state");
        return data ? JSON.parse(data) : null;
    }

    loadFromCookie() {
        let data = this.getState();
        if (!data)
            return;



        this.levelNumber = data.level;
        this.hp = data.health;
        this.money = data.money;
        this.hitsFromSoldTowers = data.hitsFromSoldTowers;
        // Detta sköts i constructorn istället
        // this.path = data.path;

        for (var i = 0; i < data.towers.length; i++) {
            let x = data.towers[i].x;
            let y = data.towers[i].y;
            let type = this.towerSpecs.find(ts => ts.type.name === data.towers[i].type).type;
            let tower = new type(x, y);
            tower.hits = data.towers[i].hits;
            tower.targeting = data.towers[i].target;

            tower.discount_multiplier = data.towers[i].discount_multiplier;
            tower.CDpenalty_multiplier = data.towers[i].CDpenalty_multiplier;
            tower.CDtime *= data.towers[i].CDpenalty_multiplier;

            if (tower instanceof Fnoell) {
                tower.originalX = data.towers[i].originalX;
                tower.originalY = data.towers[i].originalY;
            }

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

        for (var i = 0; i < data.projectiles.length; i++) {

            if (!this.map.validPosition(data.projectiles[i].x, data.projectiles[i].y) ){
                continue;
            }
        	let pt = this.map.getGridAt(data.projectiles[i].x, data.projectiles[i].y);
            //console.log(data.projectiles[i].type, JellyHeart.constructor.name, DelicatoBoll.constructor.name)
            
            if(data.projectiles[i].type == "JellyHeart")
                var p = new JellyHeart(pt);
            else if(data.projectiles[i].type == "DelicatoBoll")
                var p = new DelicatoBoll(pt);

            p.x = data.projectiles[i].x;
            p.y = data.projectiles[i].y;
            p.angle = data.projectiles[i].angle;
        	p.hitpoints = data.projectiles[i].hp;

        	controller.registerObject(p);
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
        this.extrarange = 0;

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

        if(this.type === PseudoJellyHeartTower){
        	this.posOK = controller.map.validPosition(this.x, this.y) && controller.map.getGridAt(this.x, this.y) instanceof PathTile;
        }
        else{
        	this.posOK = controller.map.validPosition(this.x, this.y) && controller.map.getGridAt(this.x, this.y) === null;
            this.extrarange = this.getExtraRange(this.x,this.y);
        }
    }

    done(didBuy) {
        controller.gameArea.canvas.removeEventListener('mousemove', this.mouseMoveCallback);
        controller.gameArea.canvas.removeEventListener('click', this.clickCallback);
        this.id = null;

        this.doneCallback(didBuy);
    }

    buy() {
        if (this.posOK) {
            let pc = this.getPriceCut(this.x,this.y);
            //console.log(pc);
            controller.money -= this.cost * pc[0];
            let t = new this.type(this.x, this.y);
            t.discount_multiplier = pc[0];
            t.CDpenalty_multiplier = pc[1];
            t.CDtime *= pc[1];
            this.done(true);
        }
    }

    // update() {
    //     super.update();
    // }

    draw(gameArea) {
        gameArea.disc(this.x, this.y, this.type.range+this.extrarange, this.posOK ? "rgba(0, 212, 0, 0.5)" : "rgba(212, 0, 0, 0.5)");
        if (this.posOK)
            controller.map.path.filter(pt =>
                Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.type.range + 0.1
            ).forEach(pt =>
                gameArea.disc(pt.x, pt.y, 0.25, "rgba(255, 255, 255, 0.7)")
            );
        if(this.posOK && this.type.prototype instanceof SupportTower)
            controller.map.towers.filter(pt =>
                Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2)) < this.type.range + 0.1
            ).forEach(pt =>
                gameArea.disc(pt.x, pt.y, 0.25, "rgba(255, 255, 100, 0.7)")
            );
        super.draw(gameArea);
    }

    getExtraRange(x,y){

        let range = 0;
        let towers = controller.map.getSupportTowersInRange(x,y);
        for (var i = 0; i < towers.length; i++) 
            if(towers[i] instanceof MatBeredare && towers[i].pasta == true)
                range += towers[i].extrarange;
        return range;
    }

    getPriceCut(x,y){

        let multiplier = 1;
        let CDchange = 1;
        let towers = controller.map.getSupportTowersInRange(x,y);
        for (var i = 0; i < towers.length; i++) 
            if(towers[i] instanceof MatBeredare && towers[i].discounts == true){
                multiplier *= (1-towers[i].pricecut);
                CDchange *= towers[i].CDchange;
            }
        return [multiplier, CDchange];
    }
}

function fusk(x, y){

	if (x == monies_plz){
		if (y !== undefined)
			controller.money += y;
		else
			controller.money += 1000;
	}

	if (x == level_set){
		controller.levelNumber = y-1;
		controller.endLevel();
	}

	if (x == unlock_all){
		for (var i = 0; i < controller.map.towers.length; i++) {
			for (var j = 0; j < controller.map.towers[i].upgrades.length; j++) {
				controller.map.towers[i].upgrades[j].hits = 0;
			}
		}
	}

	if (x == harvest_time){
		for (var i = 0; i < controller.map.towers.length; i++) {
			if (controller.map.towers[i] instanceof Nicole){
				if (controller.map.towers[i].upgrades.find(u => u.type.name == MonoCultureGadget.name) !== undefined)
					continue;
				controller.map.towers[i].addUpgrade(
					Pollen,
					"Pollenallergi",
					"Genom att noggrant välja blommor kan Nicole utnyttja att vissa ninjor har pollenallergi och tar skada istället för att vända om.",
					100,
					[],
					[Pollen, Roses, Midsummers, NightFlower, FireFlower, QueenOfNightGadget],
					10
					);
				controller.map.towers[i].addUpgrade(
					MonoCultureGadget,
					"Industriell odling",
					"Genom att använda moderna industriella redskap kan Nicole nå en aldrig tidigare skådad effektivitet och förse nästan hela campus med blommor.",
					2500,
					[Nutrient, Pollen, BouquetGadget],
					[MonoCultureGadget, Roses, Midsummers, NightFlower, FireFlower, QueenOfNightGadget, TentaculaGadget],
					500);
			}
		}
	}

	if (x == list_value){

		let value = 0;
		for (var i = 1; i <= y; i++) {
			let iterator = getLevel(i, 10);
			let remaining = iterator.remaining();
			let codebook = iterator.codebook();

			for (let creepType in remaining){
				if (codebook[creepType].prototype instanceof BaseCreep)
					value += codebook[creepType].totalValue() * remaining[creepType];
				else{
					value += codebook[creepType].prototype.totalValue() * remaining[creepType];
				}
			}
			value += levelClearReward(i);
		}

		return value;
	}



}

let monies_plz = 6809;
let level_set = 9539;
let harvest_time = 2602;
let unlock_all = 3102;
let list_value = 6673;