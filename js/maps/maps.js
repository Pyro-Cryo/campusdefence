class CampusMap extends TDMap {
    static get mapName() {
        return "KTH Campus (Originalet)";
    }

	constructor(gameArea) {
		let standardPath = [
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
		let path = TDMap.fixPath(standardPath);
		var map_img = new Image();
		map_img.src = "img/map.png";

		super(map_img, path, gameArea);
	}
}


class DiagMap extends TDMap {

	    static get mapName() {
        return "KTH Campus (Diagonal)";
    }

	constructor(gameArea) {
		let standardPath = [
			[18, 16],
			[18, 13],
			[13, 13],
			[10, 12],
			[10, 11],
			[8, 11],
			[8, 10],
			[7, 10],
			[7, 8],
			[9, 6],
			[12, 6],
			[12, 4],
			[10, 2],
			[8, 2],
			[8, 1],
			[5, 1],
			[3, 5],
			[3, 7],
			[5, 7],
			[5, 10],
			[3, 10],
			[3, 9],
			[-1, 9]
		];
		let path = TDMap.fixPath(standardPath);
		var map_img = new Image();
		map_img.src = "img/map.png";

		super(map_img, path, gameArea);
	}
}


class RandomMap extends TDMap {
    static get mapName() {
        return "KTH Campus (Slumpad)";
    }

	constructor(gameArea, width, height){
		let path = controller.getState() === null ? TDMap.randomPath(width, height) : controller.getState().path;
		var map_img = new Image();
		map_img.src = "img/map.png";

		super(map_img, path, gameArea);
	}
}

class AlbaMap extends TDMap {
    static get mapName() {
        return "AlbaNova (Lättare)";
    }

    constructor(gameArea) {
        let standardPath = [
            [7, 16],
            [7, 13],
            [5, 13],
            [5, 11],
            [6, 11],
            [6, 7],
            [2, 7],
            [2, 5],
            [6, 5],
            [6, 1],
            [7, 1],
            [7, 2],
            [9, 2],
            [9, 3],
            [10, 3],
            [10, 7],
            [14, 7],
            [14, 9],
            [10, 9],
            [10, 12],
            [17, 12],
            [17, 11],
            [18, 11],
            [18, 10],
            [19, 10]
        ];
        let path = TDMap.fixPath(standardPath);
        var map_img = new Image();
        map_img.src = "img/map_alba.png";

        super(map_img, path, gameArea);
    }
}

class FadderietMap extends TDMap {
    static get mapName() {
        return "Fadderiet (Svårare)";
    }

    constructor(gameArea) {
        let standardPath = [
            [10, -1],
            [10, 3],
            [12, 3],
            [12, 4],
            [14, 4],
            [14, 5],
            [15, 5],
            [15, 6],
            [16, 7],
            [17, 7],
            [17, 10],
            [13, 10],
            [12, 11],
            [6, 11],
            [6, 10],
            [5, 10],
            [5, 9],
            [4, 9],
            [4, 8],
            [3, 7],
            [4, 6],
            [4, 5],
            [5, 5],
            [5, 4],
            [7, 4],
            [7, 3],
            [9, 3],
            [9, -1]
        ];
        let path = TDMap.fixPath(standardPath);
        var map_img = new Image();
        map_img.src = "img/map_fadderiet.png";

        super(map_img, path, gameArea);
    }
}