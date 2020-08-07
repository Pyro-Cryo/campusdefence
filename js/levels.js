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
                .send(40, Ninja).over(20 * s)
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
                    .wait(15 * s)
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

        // Fortsätt introducera föhsare typ var 4-6 nivå, fler föhsspöken

        /*case 1:
            return (new CreepSequence()
                .send(1, Jonas).immediately()
                .wait(1 * s)
                .send(10, Jonas).spaced(1 * s)
                .wait(1 * s)
                .send(10, Jonas).over(4 * s)
                .do(() => console.log("All creeps sent")));
        case 2:
            return (new CreepSequence()
                .send(20, Jonas).spaced(1 * s)
                .interleave(new CreepSequence().wait(7.5 * s).send(20, Jonas).over(5 * s))
                .do(() => console.log("All creeps sent")));

        case 3:
            return (new CreepSequence()
                .send(10, Ninja).over(3 * s));

        case 4:
            return (new CreepSequence()
                .send(2, FastNinja).over(5 * s));*/

        default:
            return new CreepSequence().send(number * 20, Ninja).over(Math.max(1, 15 - number) * s)
            .wait(2 * s)
            .send(1, TF_1).over(0.2 * 2)
            .send(1, OF_1).over(0.2 * 2)
            .send(1, SF_1).over(0.2 * 2)
            .do(() => console.log("All creeps sent"));
    }
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

class CreepSequence {
    constructor() {
        this.iterating = false;
        this.currentSequence = [];
        this.totalSequence = [];
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
        return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => {
            if (ins[0] === "spawn") {
                if (ins[1] instanceof Array)
                    for (let i = 0; i < ins[1].length; i++)
                        tot[ins[1][i].name] = (tot[ins[1][i].name] || 0) + 1;
                else
                    tot[ins[1].name] = (tot[ins[1].name] || 0) + 1;
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
                        instruction[1].forEach(creepType => new creepType());
                    else
                        new instruction[1]();
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