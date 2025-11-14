import Phaser from "phaser";
import MainScene from "./phaser/MainScene";
import MenuScene from "./scenes/MenuScene";

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, MainScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#87CEEB'
};

const game = new Phaser.Game(config);