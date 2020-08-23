

class CampusMap extends TDMap {

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
		this.name = "KTH Campus";
	}
}


class RandomMap extends TDMap {

	constructor(gameArea, width, height){

		let path = TDMap.randomPath(width, height);
		var map_img = new Image();
		map_img.src = "img/map.png";

		super(map_img, path, gameArea);
		this.name = "KTH Campus";
	}
}