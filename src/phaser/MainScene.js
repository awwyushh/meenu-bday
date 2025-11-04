import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    
    constructor(){
        super("MainScene")
    }

    create(){
        this.bg = this.add.tileSprite(0,0,480,720,"bg").setOrigin(0);
    }
    update(){
        this.bg.tilePositionX += 3;
    }
}