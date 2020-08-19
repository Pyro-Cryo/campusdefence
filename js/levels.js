function getLevel(number, updateInterval) {
    let s = 1000 / updateInterval;
    switch (number) {
        case 1:
            return (new CreepSequence()
                .send(20, Ninja).over(15 * s));
        case 2:
            return (new CreepSequence()
                .send(30, Ninja).over(15 * s)
                .wait(2 * s)
                .send(20, Ninja).over(10 * s));
        case 3:
            return (new CreepSequence()
                .send(30, Ninja).over(10 * s)
                .wait(2 * s)
                .send(10, Red).over(10 * s));
        case 4:
            return (new CreepSequence()
                .wait(10 * s).send(40, Ninja).over(10 * s)
                .interleave(new CreepSequence().send(20, Red).over(20 * s)));
        case 5:
            return (new CreepSequence()
                .send(30, Red).over(20 * s)
                .wait(1 * s)
                .send(20, Ninja).over(2 * s)
                .wait(4 * s)
                .send(5, Blue).over(3 * s));
        case 6:
            return (new CreepSequence()
                .send(1, Blue).immediately()
                .wait(2 * s)
                .send(40, Red).over(20 * s)
                .interleave(new CreepSequence()
                    .wait(13 * s)
                    .send(10, Blue).over(7 * s)));
        case 7:
            return (new CreepSequence()
                .send(40, Red).over(20 * s)
                .interleave(new CreepSequence().send(20, Blue).over(20 * s)));
        case 8:
            return (new CreepSequence()
                .send(1, TF_1).immediately());

        case 9:
            return (new CreepSequence()
                .send(40, Red).over(20 * s)
                .interleave(new CreepSequence().send(30, Blue).over(20 * s))
                .wait(8 * s)
                .send(10, Pink).over(5 * s));

        case 10:
            return (new CreepSequence()
                .send(30, Blue).over(15 * s)
                .interleave(new CreepSequence().send(10, Red).over(10 * s))
                .wait(4 * s)
                .send(20, Pink).over(12 * s)
                .wait(3 * s)
                .send(10, Blue).over(4 * s));

        case 11:
            return (new CreepSequence() 
                .send(1,SF_1).immediately());

        case 12:
            return (new CreepSequence()
                .send(50, Blue).over(20 * s)
                .wait(1 * s)
                .send(10, Pink).over(10 * s));

        case 13:
            return (new CreepSequence()
                .send(20, Pink).over(15 * s)
                .interleave(new CreepSequence().send(20, Blue).over(15 * s))
                .send(20, Pink).over(8 * s)
                );

        case 14:
            return (new CreepSequence()
                .send(15, Green).over(15 * s)
                .wait(1 * s)
                .send(50, Pink).over(20 * s)
                .interleave(new CreepSequence().send(50, Blue).over(20 * s)));

        case 15:
            return (new CreepSequence()
                .send(1, OF_1).immediately());

        case 16:
            return (new CreepSequence()
                .send(1, TF_2).immediately()
                .wait(1.5 * s)
                .send(1, OF_2).immediately()
                .wait(1.5 * s)
                .send(1, SF_2).immediately());

        case 17:
            return (new CreepSequence()
                .send(1, Violet).immediately()
                .wait(2 * s)
                .send(30, Green).over(15 * s)
                .interleave(new CreepSequence().send(50, Pink).over(15 * s))
                );
        case 18:
            return (new CreepSequence()
                .send(25, Violet).over(14 * s));

        case 19:
            return (new CreepSequence()
                .send(1, Orange).immediately()
                .wait(2 * s)
                .send(50, Blue).over(12 * s)
                .send(3, Orange).over(3 * s));

        case 20:
            return (new CreepSequence()
                .send(20, Blue).over(10 * s)
                .send(8, Pink).over(4 * s)
                .interleave(new CreepSequence()
                    .wait(10 * s)
                    .send(1, TF_2).immediately()
                    .wait(1.4 * s)
                    .send(1, OF_2).immediately()
                    .wait(1.4 * s)
                    .send(1, SF_2).immediately())
                .send(10, Blue).over(10 * s));


        // Fortsätt introducera föhsare typ var 4-6 nivå, fler föhsspöken

        default:
        	return autolevel(number, updateInterval);
    }
}

function autolevel(levelnumber, updateInterval){

	let s = 1000 / updateInterval;
	let cs = new CreepSequence()
		.send(30, Pink).over(10 * s)
		.interleave(new CreepSequence().send(30, Green).over(10 * s))
		.wait(4 * s)
		.send(4*levelnumber, Green).over(levelnumber/4 * s)
		.wait(3 * s)
		.send(4*levelnumber, Green).over(levelnumber/4 * s)
		.interleave(new CreepSequence().send(2*levelnumber, Pink).over(8/levelnumber * s))
		.wait(4 * s);

	if(levelnumber > 40){
		cs.send(0.1*levelnumber*levelnumber, Orange).over(levelnumber * s)
		.interleave(new CreepSequence().send(levelnumber, Pink).over(10 * s));
	}

	if(levelnumber % 4 == 0 || levelnumber % 6 == 0){
		cs.send(1, TF_inf).immediately()
		.wait(0.2 * s)
		.send(1, OF_inf).immediately()
		.wait(0.2 * s)
		.send(1, SF_inf).immediately()
		.wait(1 * s);
	}

	if(levelnumber > 20){
		cs.send(2*levelnumber, Orange).over(10 * s);
	}

	cs.send(100, Blue).over(20 * s)
		.interleave(new CreepSequence().send(40, Red).over(10 * s))
		.interleave(new CreepSequence().send(40, Pink).over(10 * s))
		.send(5 * levelnumber, Pink).over(15 * s);


	return cs.do(() => console.log("All creeps sent"));

}

// Här kan man koda in specialhändelser efter vissa nivåer också (typ att man får ett gratis maskottorn efter lvl 10 eller nåt)
function levelClearReward(number) {
    let cash = 0;
    switch (number) {
        default:
            cash = 100;
            break;
    }
    controller.money += cash;
}

// Skrivs ut innan respektive nivå
function levelMessage(number) {
    switch (number) {
        case 1: return "Välkommen! Välj en fadder i menyn och placera ut det nära vägen. Ringen och prickarna visar hur långt faddern ser.<br /><br /><i>nØllan sitter glatt och tuggar pastasallad i Konsulatet när plötsligt ninjorna från Föhsarkrocketen visar sig igen, denna gång med ännu ondare avsikter. Nu är det upp till faddrarna att stoppa dem!</i>";

        case 2:
            if (controller.hp === controller.initialHP)
                return "Bra jobbat! Du kan klicka på faddrarna du placerat ut för att uppgradera eller sälja dem.<br /><br/><i>Den första attacken avstyrdes enkelt, men ninjorna kommer att återvända i större antal.</i>";
            else
                return "Aj då, nu slank det igenom " + (controller.initialHP - controller.hp == 1 ? "en" : "ett par") + ". Prova att placera ut fler faddrar, eller att sätta dem mer strategiskt! Du kan sälja eller uppgradera dina faddrar genom att klicka på dem.<br /><br /><i>Någon nØllan strök med, men lite svinn får man räkna med. Det är dock än fler ninjor på väg...</i>";
            
        case 3: return "Det finns olika typer av ninjor, vilket man kan se på deras färg. De med röd huva har två stycken med svart huva i sig.<br /><br /><i>Föhseriet inser att faddrarna utgör ett starkare försvar än väntat - som väntat. Taktikföhs sätter in de specialtränade trojanska ninjorna.</i>";
        
        case 4: return "Du har nu låst upp två nya sorters faddrar! I menyn kan du se hur mycket varje fadder kostar samt en vag beskrivning av vad de gör.<br /><br /><i>Fjädrande Fadderiet har har fått nys om Föhseriets planer och sällar sig till fadderförsvaret.</i>";

        case 5: return "Fadderisterna har lite olika förmågor - testa dig fram och se vilka du föredrar!<br /><br /><i>Att fadderisterna skulle ansluta sig var väntat - Föhseriet står redo att skicka ut de nästlade trojanska ninjorna.</i>";

        case 6: return "Blåa ninjor har två röda ninjor i sig - mycket att hantera men det klirrar dödsskönt i kassakistan. Varje ninja du kramar ger en peng, förutom extrapengarna du får efter varje nivå.<br /><br /><i>Trots ninjornas upprepade anfall finns inte minsta antydan till tvekan hos faddrarna - ingen ninja kommer fram okramad.</i>"

        case 7: return "Förhoppningsvis har du redan hittat informationslisten ovanför spelplanen - där kan du pausa, snabbspola och återställa spelet samt se din fikabudget och hur många nØllan som finns kvar. Du kan också se vad nästa nivå har att bjuda på.<br /><br /><i>Föhseriet gör sig redo att ta i med hårdhanskarna.</i>"

        case 8: return "ÖF, $F och TF kräver många kramar innan de ger med sig. De har dessutom olika förmågor som gör dem ännu svårare att besegra!<br /><br /><i>\"Ska det bli bra får man göra det själv. JUBLA, nØLLAN!\"</i>"

        default:
            return "\xa0";
    }
}

class CreepSequence {
    constructor() {
        this.iterating = false;
        this.currentSequence = [];
        this.totalSequence = [];
        this._sent = {};
        this._creepSummary = null;
    }

    _checks(shouldBeZero) {
        if (shouldBeZero !== undefined && shouldBeZero ^ (this.currentSequence.length === 0)) {
            console.log(this);
            throw new Error("Invalid state for that operation");
        }
        if (this.iterating)
            throw new Error("Cannot modify sequence once iteration has begun");
    }

    totalTime() {
        return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => ins[0] === "wait" ? tot + ins[1] : tot, 0);
    }

    totalExplicitCreeps() {
        return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => {
            if (ins[0] === "spawn") {
                if (ins[1] instanceof Array)
                    return tot + ins[1].length;
                else
                    return tot + 1;
            } else
                return tot;
        }, 0);
    }

    creepSummary() {
        if (!this.iterating || !this._creepSummary)
            this._creepSummary = this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => {
                if (ins[0] === "spawn") {
                    if (ins[1] instanceof Array)
                        for (let i = 0; i < ins[1].length; i++)
                            tot[ins[1][i].name] = (tot[ins[1][i].name] || 0) + 1;
                    else
                        tot[ins[1].name] = (tot[ins[1].name] || 0) + 1;
                }

                return tot;
            }, {});

        return this._creepSummary;
    }

    sent() {
        return this._sent;
    }

    remaining() {
        let cs = this.creepSummary();
        if (!this.iterating)
            return cs;
        let sent = this.sent();
        let rem = {};

        for (let t in cs)
            rem[t] = cs[t] - (sent[t] || 0);

        return rem;
    }

    codebook() {
        return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => {
            if (ins[0] === "spawn") {
                if (ins[1] instanceof Array)
                {
                    for (let i = 0; i < ins[1].length; i++)
                        if (!tot[ins[1][i].name])
                            tot[ins[1][i].name] = ins[1][i];
                }
                else
                    if (!tot[ins[1].name])
                        tot[ins[1].name] = ins[1];
            }

            return tot;
        }, {});
    }

    wait(totalTime) {
        this._checks(true);
        if (totalTime < 0)
            throw new Error("Invalid totalTime " + totalTime);

        this.totalSequence.push(["wait", totalTime]);

        return this;
    }

    send(number, creepType) {
        this._checks();
        if (number < 0)
            throw new Error("Invalid number " + number);
        this.currentSequence = this.currentSequence.concat(new Array(number).fill(creepType));

        return this;
    }

    immediately() {
        this._checks(false);

        this.totalSequence.push(["spawn", this.currentSequence]);
        this.currentSequence = [];

        return this;
    }

    over(totalTime) {
        this._checks(false);
        if (totalTime < 0)
            throw new Error("Invalid totalTime " + totalTime);

        let nDelays = this.currentSequence.length - 1;
        let delays = new Array(nDelays).fill(0).map(
            (_, i) => Math.floor(totalTime * (i + 1) / nDelays)
                - Math.floor(totalTime * i / nDelays)
        );
        for (let i = 0; i < this.currentSequence.length; i++) {
            if (i !== 0)
                this.totalSequence.push(["wait", delays[i - 1]]);
            this.totalSequence.push(["spawn", this.currentSequence[i]]);
        }
        this.currentSequence = [];

        return this;
    }

    spaced(deltaTime) {
        this._checks(false);
        if (deltaTime < 0)
            throw new Error("Invalid deltaTime " + deltaTime);

        for (let i = 0; i < this.currentSequence.length; i++) {
            if (i !== 0)
                this.totalSequence.push(["wait", deltaTime]);
            this.totalSequence.push(["spawn", this.currentSequence[i]]);
        }
        this.currentSequence = [];

        return this;
    }

    do(func) {
        this._checks(true);

        this.totalSequence.push(["call", func]);

        return this;
    }

    interleave(other) {
        this._checks(true);
        other._checks(true);

        let this_ind = 0;
        let other_ind = 0;

        while (this_ind < this.totalSequence.length && other_ind < other.totalSequence.length) {
            let t = this.totalSequence[this_ind];
            let o = other.totalSequence[other_ind];
            if (t[0] === "wait" && o[0] === "wait") {
                if (t[1] === o[1]) {
                    this.currentSequence.push(t);
                    this_ind++;
                    other_ind++;
                }
                else {
                    this.currentSequence.push(["wait", Math.min(t[1], o[1])]);
                    if (t[1] > o[1]) {
                        t[1] = t[1] - o[1];
                        other_ind++;
                    } else {
                        o[1] = o[1] - t[1];
                        this_ind++;
                    }
                }
            } else {
                if (t[0] !== "wait") {
                    this.currentSequence.push(t);
                    this_ind++;
                }
                if (o[0] !== "wait") {
                    this.currentSequence.push(o);
                    other_ind++;
                }
            }
        }
        if (this_ind !== this.totalSequence.length)
            this.currentSequence = this.currentSequence.concat(this.totalSequence.slice(this_ind));
        if (other_ind !== other.totalSequence.length)
            this.currentSequence = this.currentSequence.concat(other.totalSequence.slice(other_ind));

        this.totalSequence = this.currentSequence;
        this.currentSequence = [];
        other.totalSequence = [];

        return this;
    }

    next() {
        if (!this.iterating) {
            this.iterating = true;
            this.index = 0;
        }
        while (this.index < this.totalSequence.length && this.totalSequence[this.index][0] !== "wait") {
            let instruction = this.totalSequence[this.index];
            switch (instruction[0]) {
                case "call":
                    instruction[1]();
                    break;

                case "spawn":
                    if (instruction[1] instanceof Array)
                    {
                        instruction[1].forEach(creepType => new creepType());
                        for (let i = 0; i < instruction[1].length; i++)
                            this.sent[instruction[1][i].name] = (this.sent[instruction[1][i].name] || 0) + 1;
                    }
                    else
                    {
                        new instruction[1]();
                        this.sent[instruction[1].name] = (this.sent[instruction[1].name] || 0) + 1;
                    }
                    break;
            }

            this.index++;
        }
        if (this.index >= this.totalSequence.length)
            return { done: true };
        else {
            if (--this.totalSequence[this.index][1] <= 0)
                this.index++;
            return { done: false };
        }
    }
}