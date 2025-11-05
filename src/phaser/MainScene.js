import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    constructor(){
        super("MainScene")
    }

    create(){
        this.bg = this.add.tileSprite(0,0,480,720,"bg").setOrigin(0);

        if(!this.anims.exists("fly_anim")){
            this.anims.create({
                key:"fly_anim",
                frames: this.anims.generateFrameNumbers("flying", {start: 0, end: 3}),
                frameRate: 10,
                repeat: -1
            })
        }

        const startX = Math.floor(this.scale.width * 0.25)
        const startY = Math.floor(this.scale.width * 0.5)

        this.player = this.physics.add.sprite(startX, startY, "flying", 0)
        this.player.setOrigin(0.45)

        const targetW = Math.min(this.scale.width * 0.22, 140)
        if (this.player.width && this.player.height) {
            const aspect = this.player.height / this.player.width
            this.player.setDisplaySize(Math.round(targetW),Math.round(targetW * aspect))
        }else{
            this.player.setScale(0.6)
        }


        this.player.play("fly_anim")

        this.player.setCollideWorldBounds(true)
        this.player.setBounce(0.2,0.2)
        this.player.setGravityY(900)
        this.player.body.setSize(Math.round(this.player.displayWidth * 0.8), Math.round(this.player.displayHeight * 0.9))

        this.player.setAngle(0)

        const flap = () => {
            this.player.setVelocityY(-320)
            this.tweens.killTweensOf(this.player)
            this.tweens.add({
                targets: this.player,
                angle: -10,
                duration: 80,
                ease: "Power1",
                yoyo: false
            })
            
            if(this.sound && (this.cache.audio && this.cache.audio.exists("whoosh"))){
                try{
                    this.sound.play("whoosh")
                } catch(e){
                    console.log(e)
                    // nothing
                }
            }
        };

        this.input.on("pointerdown", flap)
        this.input.keyboard.on("keydown-ENTER", flap)
        this.input.keyboard.on("keydown-SPACE", flap)

        this.hasStarted = true;
    }

    update(){
        this.bg.tilePositionX += 3;
        if(!this.player) return
        
        const vy = this.player.body.velocity.y;
        const targetAngle = Phaser.Math.Clamp(vy/6, -25, 70)

        this.player.angle = Phaser.Math.Interpolation.Linear([this.player.angle, targetAngle], 0.2)

    }
}