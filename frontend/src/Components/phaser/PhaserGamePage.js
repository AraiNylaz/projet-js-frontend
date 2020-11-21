//let Phaser = require("phaser");
import Phaser from "phaser";
import GameScene from "./GameScene.js";
import { setTitle } from "../../utils/render.js";

var game;

const PhaserGamePage = () => {
  setTitle("Game");
  let phaserGame = `
<div id="gameDiv" class="d-flex justify-content-center my-3 offset-2 pl-4">
</div>`;

  let page = document.querySelector("#page");
  page.innerHTML = phaserGame;

  let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: true,
      },
    },
    scene: [GameScene],
    //  parent DOM element into which the canvas created by the renderer will be injected.
    parent: "gameDiv",
  };

  // there could be issues when a game was quit (events no longer working)
  // therefore destroy any started game prior to recreate it
  if(game)
    game.destroy(true);
  game = new Phaser.Game(config);
};

export default PhaserGamePage;
