import Phaser, { Physics } from "phaser"
import BootScene from "./BootScene"
import MainScene from "./MainScene"
import MenuScene from "./MenuScene"

export default {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    backgroundColor: "#000000",
    parent: "game-container",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade"
    },
    scene: [BootScene, MainScene, MenuScene]
}