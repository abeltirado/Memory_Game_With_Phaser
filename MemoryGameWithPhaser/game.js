window.onload = function() {
    var tileSize = 80;  
    var numRows = 8;
    var numCols = 10;
    var tileSpacing = 10;
    var localStorageName = "crackalien";
    var highScore;
    var tilesArray = [];
    var selectedArray = [];
    var playSound;
    var score;
    var timeLeft;
    var tilesLeft;
    var fails; 
    var game = new Phaser.Game(1250, 800);

    var preloadAssets = function(game) {}
    preloadAssets.prototype = {
        preload: function(){
            game.load.spritesheet("tiles", "assets/sprites/tiles.png", tileSize, tileSize);
            game.load.audio("select", ["assets/sounds/select.mp3","assets/sounds/select.ogg"]);
            game.load.audio("right", ["assets/sounds/right.mp3","assets/sounds/right.ogg"]);
            game.load.audio("wrong", ["assets/sounds/wrong.mp3","assets/sounds/wrong.ogg"]);
            game.load.spritesheet("soundicons", "assets/sprites/soundicons.png", 80, 80);
        },
        create: function(){
            game.state.start("TitleScreen");
        }
    }

    var gameOver = function(game) {}
    gameOver.prototype = {
        create: function(){
            highScore = Math.max(score, highScore);
            localStorage.setItem(localStorageName, highScore);
            var style = {
                font: "32px Monospace",
                fill: "#00ff00",
                align: "center"
            }
            var text = game.add.text(game.width / 2, game.height / 2, "GameOver\nBest score: " + highScore + "\nYour score: " + score + "\nFails: " + fails + "\n\nTap to restart", style);
            text.anchor.set(0.5);
            game.input.onDown.add(this.restartGame, this);
        },
        restartGame: function(){
            tilesArray.length = 0;
            selectedArray.length = 0;
            game.state.start("TitleScreen");
        }
    }

    var titleScreen = function(game) {}
    titleScreen.prototype = {
        preload: function(){
            game.load.spritesheet("soundicons", "assets/sprites/soundicons.png", 80, 80);
        },
        create: function(){
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.stage.disableVisibilityChange = true;
            var style = {
                font: "48px Monospace",
                fill: "#00ff00",
                align: "center"
            };
            var text = game.add.text(game.width / 2, game.height / 2 - 100, "Crack Alien Code", style);
            text.anchor.set(0.5);
            var soundButton = game.add.button(game.width / 2 - 100, game.height / 2 + 100, "soundicons", this.startGame, this);
            soundButton.anchor.set(0.5);
            soundButton = game.add.button(game.width / 2 + 100, game.height / 2 + 100, "soundicons", this.startGame, this);
            soundButton.frame = 1;
            soundButton.anchor.set(0.5);
        },
        startGame: function(target){
            if(target.frame == 0){
                playSound = true;
            } else {
                playSound = false;
            }
            game.state.start("PlayGame");
        }
    }

    var playGame = function(game) {}
    playGame.prototype = {
        scoreText: null,
        timeText: null,
        failsText: null,
        soundArray: [],
        preload: function(){
            game.load.spritesheet("tiles", "assets/sprites/tiles.png", tileSize, tileSize);
            game.load.audio("select", ["assets/sounds/select.mp3", "assets/sounds/select.ogg"]);
            game.load.audio("right",  ["assets/sounds/right.mp3", "assets/sounds/right.ogg"]);
            game.load.audio("wrong",  ["assets/sounds/wrong.mp3", "assets/sounds/wrong.ogg"]);
        },
        create: function(){
            score = 0;
            timeLeft = 300;
            fails = 0; 
            this.placeTiles();
            if(playSound){
                this.soundArray[0] = game.add.audio("select", 1);
                this.soundArray[1] = game.add.audio("right", 1);
                this.soundArray[2] = game.add.audio("wrong", 1);
            }
            var style = {
                font: "32px Monospace",
                fill: "#00ff00",
                align: "center"
            }
            this.scoreText = game.add.text(5, 5, "Score: " + score, style);
            this.failsText = game.add.text(game.width - 200, 5, "Fails: " + fails, style); 
            this.timeText = game.add.text(5, game.height - 5, "Time left: " + timeLeft, style);
            this.timeText.anchor.set(0, 1);
            game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);	   
        },
        decreaseTime: function () {
            timeLeft--;
            this.timeText.text = "Time left: " + timeLeft;
            if (timeLeft <= 0) {
                game.state.start("GameOver");
            }
        },
        placeTiles: function(){
            tilesLeft = numRows * numCols;
            var leftSpace = (game.width - (numCols * tileSize) - ((numCols - 1) * tileSpacing))/2;
            var topSpace = (game.height - (numRows * tileSize) - ((numRows - 1) * tileSpacing))/2;
            for(var i = 0; i < numRows * numCols; i++){
                tilesArray.push(Math.floor(i / 2));
            }
            for (i = 0; i < numRows * numCols; i++){
                var from = game.rnd.between(0,tilesArray.length-1);
                var to =   game.rnd.between(0,tilesArray.length-1);
                var temp = tilesArray[from];
                tilesArray[from] = tilesArray[to];
                tilesArray[to] = temp;
            }
            for(i = 0; i < numCols; i++){
                for(var j = 0; j < numRows; j++){
                    var tile= game.add.button(leftSpace + i * (tileSize + tileSpacing), topSpace + j * (tileSize + tileSpacing), "tiles",
                    this.showTile, this);
                    tile.frame = 40;
                    tile.value = tilesArray[j * numCols + i];
                    tile.scale.setTo(tileSize / tile.width, tileSize / tile.height); 
                }
            }
        },
        showTile: function(target) {
            if(selectedArray.length < 2 && selectedArray.indexOf(target) == -1){
                if(playSound){
                    this.soundArray[0].play();
                }
                target.frame = target.value;
                selectedArray.push(target);	
                if(selectedArray.length == 2){
                    game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);
                }
            }
        },
        checkTiles: function(){
            if(selectedArray[0].value == selectedArray[1].value){
                if(playSound){
                    this.soundArray[1].play();
                }
                score++;
                timeLeft += 2;
                this.timeText.text = "Time left: " + timeLeft;
                this.scoreText.text = "Score: " + score;
                selectedArray[0].destroy();
                selectedArray[1].destroy();	 
                tilesLeft -= 2;
                if(tilesLeft == 0){
                    game.state.start("GameOver");
                }
            } else {
                if(playSound){
                    this.soundArray[2].play();
                }
                fails++;
                this.failsText.text = "Fails: " + fails; 
                selectedArray[0].frame = 40; 
                selectedArray[1].frame = 40; 
            }
            selectedArray.length = 0;		
        }
    }
    
    game.state.add("PreloadAssets", preloadAssets);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
    game.state.add("GameOver", gameOver);
    highScore = localStorage.getItem(localStorageName) == null ? 0 : localStorage.getItem(localStorageName);
    game.state.start("PreloadAssets");
}
