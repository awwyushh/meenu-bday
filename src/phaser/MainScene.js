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

        // obstacles group
        this.obstacles = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })
        this.activeRects = [];

        this.spawnInterval = 1600
        this.gapSize = 190
        this.minGap = 100
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnInterval,
            callback: this.spawnRandomObstacle,
            callbackScope: this,
            loop: true
        })

        this.physics.add.collider(this.player, this.obstacles, () => {
            this.scene.restart();
        })

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

    spawnRandomObstacle(){
        if(this.spawnInterval > 900){
            this.spawnInterval -= 8;
            this.spawnTimer.reset({
                delay: this.spawnInterval,
                callback: this.spawnRandomObstacle,
                callbackScope: this,
                loop: true
            })
        }
        if(this.gapSize > this.minGap){
            this.gapSize -= 6;
        }
        
        const type = (Math.random() < 0.7) ? "pipes" : "floating"
        
        this.activeRects = this.activeRects.filter(r => r.right > -50)
        
        if(type == "pipes"){
            console.log("Pipes called")
            this.spawnPipePair();
        }else{
            // this.spawnFloating();
        }
    }
    
    spawnPipePair(){
        const maxAttempts = 10;
        const padTop = Math.floor(this.scale.height * 0.12)
        const padBottom = Math.floor(this.scale.height * 0.12)
        const minY = padTop + Math.floor(this.gapSize/2)
        const maxY = this.scale.height - padBottom - Math.floor(this.gapSize/2)

        const spawnX = this.scale.width + 60
        const pipeW = Math.min(92, Math.floor(this.scale.width * 0.22))

        for(let i=0; i<maxAttempts; i++){
            console.log("Try: ", i)
            const gapY = Phaser.Math.Between(minY, maxY)
            const top = this.add.image(spawnX,gapY - (this.gapSize/2), "obstacle1").setOrigin(0.5,1)
            const bottom = this.add.image(spawnX,gapY + (this.gapSize/2), "obstacle1").setOrigin(0.5,0)

            top.setFlipY(true);

            if(top.width && top.height){
                    const scale = pipeW / top.width;
                    top.setDisplaySize(Math.round(pipeW), Math.round(top.height * scale))
                    bottom.setDisplaySize(Math.round(pipeW), Math.round(bottom.height * scale))
            }
            
            const topRect = top.getBounds()
            const bottomRect = bottom.getBounds()

            top.destroy()
            bottom.destroy()

            const intersectsExisting = this.activeRects.some(r => Phaser.Geom.Intersects.RectangleToRectangle(r, topRect))
            const intersectsPlayer = Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), topRect) || Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), bottomRect)

            if(!intersectsExisting && !intersectsPlayer){
                const topPipe = this.obstacles.create(spawnX, gapY - (this.gapSize/2), "obstacle1").setOrigin(0.5,1)
                topPipe.setFlipY(true);
                const bottomPipe = this.obstacles.create(spawnX, gapY + (this.gapSize/2), "obstacle1").setOrigin(0.5,0)

                if(topPipe.width && topPipe.height){
                    const scale = pipeW / topPipe.width;
                    topPipe.setDisplaySize(Math.round(pipeW), Math.round(topPipe.height * scale))
                    bottomPipe.setDisplaySize(Math.round(pipeW), Math.round(bottomPipe.height * scale))
                }

                const speed = - (180 + Math.min(120, Math.floor((1600 - this.spawnInterval)/6)))
                topPipe.body.setVelocityX(speed)
                bottomPipe.body.setVelocityX(speed)

                this.activeRects.push(topPipe.getBounds())
                this.activeRects.push(bottomPipe.getBounds())
                
                topPipe.once('destroy',()=>{})
                bottomPipe.once('destroy',()=>{})
                
                return;
            }


        }
    }

    update(){
        this.bg.tilePositionX += 3;
        if(!this.player) return
        
        const vy = this.player.body.velocity.y;
        const targetAngle = Phaser.Math.Clamp(vy/6, -25, 70)

        this.player.angle = Phaser.Math.Interpolation.Linear([this.player.angle, targetAngle], 0.2)

        this.obstacles.getChildren().forEach(obs => {
            if(obs.x + (obs.displayWidth || obs.width) < -80){
                obs.destroy()
            }
        })

        this.activeRects = this.obstacles.getChildren().map(o => o.getBounds());
    }
}