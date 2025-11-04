import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
    
    constructor(){
        super("BootScene")
    }

    preload(){
        // images
        this.load.image("bg", "assets/background.jpg")
        this.load.image("meenu", "assets/meenu.png")
        this.load.image("banner", "assets/banner.png")
        // audios
        this.load.audio("bgmusic", "/assets/bgmusic.mp3")
        this.load.audio("whoosh", "/assets/whoosh.wav")
    }

    create(){
        this.scene.start("MenuScene")
    }
}