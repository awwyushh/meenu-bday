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
        this.load.image("obstacle1","assets/obs1.png")
        this.load.image("obstacle2","assets/obs2.png")
        this.load.image("treausre","assets/gift.png")
        this.load.image("coin","/assets/coin.png")
        // audios
        this.load.audio("bgmusic", "/assets/bgmusic.mp3")
        this.load.audio("whoosh", "/assets/whoosh.wav")
        // spritesheet
        this.load.spritesheet("flying","/assets/flying.png",{
            frameWidth: 345,
            frameHeight: 372
        })
    }

    create(){
        this.scene.start("MenuScene")
    }
}