import Phaser from "phaser";
import ScoreLabel from "./ScoreLabel.js";
import LadyBugSpawner from "./LadyBugSpawner.js";

const PLAYER_KEY = "player";
const LADYBUG_KEY = "bomb";

const PATH_ASSETS = "../assets/";
const PATH_ENEMIES = PATH_ASSETS + "enemies/";
const PATH_MAPS = PATH_ASSETS + "maps/";
const PATH_PLAYERS = PATH_ASSETS + "players/";
const PATH_TILESHEETS = PATH_ASSETS + "tilesheets/";

const PLAYER_SPEED = 160;
const MAP_RESIZING_FACTOR = 0.5;
const PLAYER_RESIZING_FACTOR = 0.75;

class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player = undefined;
    this.cursors = undefined;
    this.scoreLabel = undefined;
    this.ladyBugSpawner = undefined;
    this.warpZone = undefined;
    this.gameOver = false;
  }

  preload() {
    // Maps
    this.load.image("tiles", PATH_TILESHEETS + "winter.png");
    this.load.tilemapTiledJSON("map", PATH_MAPS + "mapTest.json");

    this.load.tilemapTiledJSON("mapDodo", PATH_MAPS + "mapTestDorian.json");

    // Enemies
    this.load.image(LADYBUG_KEY, PATH_ENEMIES + "ladyBug.png");

    // Players
    this.load.atlas(PLAYER_KEY, PATH_PLAYERS+"player.png", PATH_PLAYERS+"playerAtlas.json");
  }

  create() {
    // Images of Maps
    this.tilemap = this.make.tilemap({key: "map"});
    this.tileset = this.tilemap.addTilesetImage("Winter","tiles");

    // Set all layers of the map in params
    this.setLayer("map");

    // Set the Bounds of the map
    this.physics.world.setBounds(0,0,this.tilemap.widthInPixels*MAP_RESIZING_FACTOR,this.tilemap.heightInPixels*MAP_RESIZING_FACTOR);
    

    // Player
    this.player = this.createPlayer();
    
    // Enemies
    this.ladyBugSpawner = new LadyBugSpawner(this, LADYBUG_KEY);
    const ladyBugsGroup = this.ladyBugSpawner.group;

    // Cameras
    this.manageCamera();
  
    // Cursors
    this.cursors = this.input.keyboard.createCursorKeys();

    this.codeKonami();

    /* FOR DEBUGGING !!! Make all colliding object colloring in ORAGNE ! */
    this.setDebugingGraphics();
  }

  update() {
    if (this.gameOver) {
      return;
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.anims.play("playerWalk", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.anims.play("playerWalk", true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("playerDown");
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-PLAYER_SPEED);
      this.player.anims.play("playerUp");
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(PLAYER_SPEED);
      this.player.anims.play("playerDown");
    } else {
      this.player.setVelocityY(0);
    }

   /* if(this.player.x >this.end.x - 2 && this.player.x < this.end.x +2){
      this.end = this.tilemap.findObject("Objects", obj => obj.name === "end");
    }*/

  }

  setLayer(nextMap) {
    switch(nextMap){
      case "map":
        this.landLayer = this.tilemap.createStaticLayer("land",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.worldLayer = this.tilemap.createStaticLayer("world",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.topLayer = this.tilemap.createStaticLayer("cityRoad",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityLayer = this.tilemap.createStaticLayer("City",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityBuild1Layer = this.tilemap.createStaticLayer("CityBuild1",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityBuild2Layer = this.tilemap.createStaticLayer("CityBuild2",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityBuild3Layer = this.tilemap.createStaticLayer("CityBuild3",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityBuild4Layer = this.tilemap.createStaticLayer("CityBuild4",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityBuild5Layer = this.tilemap.createStaticLayer("CityBuild5",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.cityBuild6Layer = this.tilemap.createStaticLayer("Citybuild6",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        this.abovePlayerLayer = this.tilemap.createStaticLayer("AbovePlayer",this.tileset,0,0).setScale(MAP_RESIZING_FACTOR);
        //this.overlapLayer = this.tilemap.createDynamicLayer("overlap",this.tileset,0,0); // pour claques avec objets récoltable ou pique qui font mal

        // By default, everything gets depth sorted on the screen in the order we created things. Here, we
        // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
        // Higher depths will sit on top of lower depth objects
        this.abovePlayerLayer.setDepth(10);

        // Set the point for changing the map
        this.warpZone = {};
        break;
      case "mapDodo":
        // Calque of Dorian's Map
        this.downLayer = this.tilemap.createStaticLayer("bottom",this.tileset,0,0);
        this.worldLayer = this.tilemap.createStaticLayer("world",this.tileset,0,0);
        this.topLayer = this.tilemap.createStaticLayer("topRoad",this.tileset,0,0);
        this.overlapLayer = this.tilemap.createDynamicLayer("overlap",this.tileset,0,0);

        this.topLayer.setDepth(10);
        break;
      default:
        this.setLayer("map");
        break;
    }
  }

  setDebugingGraphics() {
    const debugGraphics = this.add.graphics().setAlpha(PLAYER_RESIZING_FACTOR);
    this.worldLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  }

  createPlayer() {
    const player = this.physics.add.sprite(100, 450, PLAYER_KEY, "adventurer_stand").setScale(0.7);
    player.setCollideWorldBounds(true);
    
    this.anims.create({
      key : "playerWalk",
      frames : this.anims.generateFrameNames(PLAYER_KEY, {prefix: "adventurer_walk", start:1, end: 2}),
      frameRate : 5,
      repeat : -1 /* -1 value tells the animation to loop. */
    });

    this.anims.create({
      key : "playerDown",
      frames : [{key: PLAYER_KEY, frame: "adventurer_stand"}],
      frameRate : 5,
      repeat : -1
    });

    this.anims.create({
      key : "playerUp",
      frames : [{key: PLAYER_KEY, frame: "adventurer_back"}],
      frameRate : 5,
      repeat : -1
    });

    // exemple of anims with more then 1 frame without following in the Atlas
    /*this.anims.create({
      key : "playerIdle",
      frames : [
          {key: PLAYER_KEY, frame: "adventurer_stand"},
          {key: PLAYER_KEY, frame: "adventurer_idle"}
      ],
      frameRate : 2,
      repeat : -1
    });*/

    return player;
  }

  manageCamera() {
    this.cameras.main.startFollow(this.player);
    console.log(this.tilemap.widthInPixels*MAP_RESIZING_FACTOR,this.tilemap.heightInPixels);
    this.cameras.main.setBounds(0,0,this.tilemap.widthInPixels*MAP_RESIZING_FACTOR,this.tilemap.heightInPixels*MAP_RESIZING_FACTOR);
  }

  changeMap(){
    let nextMap = this.tilemap.findObject("Objects", obj => obj.name === "nextMap").properties[0].value;
    this.setLayer(nextMap);
    this.restart();
  }

  codeKonami(){
    //  Lien pour les keyCodes : https://github.com/photonstorm/phaser/blob/v3.22.0/src/input/keyboard/keys/KeyCodes.js
    //  37 = LEFT
    //  38 = UP
    //  39 = RIGHT
    //  40 = DOWN
    //  65  = A
    //  66  = B

    var combo = this.input.keyboard.createCombo([ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65 ], { resetOnMatch: true });

    this.input.keyboard.on('keycombomatch', function (event) {

        console.log('Konami Code entered!');

    });
  }

}

export default GameScene;
