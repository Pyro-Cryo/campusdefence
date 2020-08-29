const volume = 0.4;

let music = new Audio("audio/myrstacken.mp3");
music.loop = true;
music.preload = true;
music.addEventListener('timeupdate', function () {
    var buffer = .44;
    if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play();
    }
}, false);
music.volume = volume;

let music_speedy = new Audio("audio/myrstacken_speedy.mp3");
music_speedy.loop = true;
music_speedy.preload = true;
music_speedy.addEventListener('timeupdate', function () {
    var buffer = .44;
    if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play();
    }
}, false);
music_speedy.volume = volume;