import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene")
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, 480, 720, "bg").setOrigin(0);

        if (!this.anims.exists("fly_anim")) {
            this.anims.create({
                key: "fly_anim",
                frames: this.anims.generateFrameNumbers("flying", { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            })
        }

        const startX = Math.floor(this.scale.width * 0.25)
        const startY = Math.floor(this.scale.height * 0.5)

        this.player = this.physics.add.sprite(startX, startY, "flying", 0)
        this.player.setOrigin(0.45)

        const targetW = Math.min(this.scale.width * 0.22, 140)
        if (this.player.width && this.player.height) {
            const aspect = this.player.height / this.player.width
            this.player.setDisplaySize(Math.round(targetW), Math.round(targetW * aspect))
        } else {
            this.player.setScale(0.6)
        }


        this.player.play("fly_anim")
        this.player.setCollideWorldBounds(true)
        this.player.setBounce(0.2, 0.2)
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

        // this.physics.add.collider(this.player, this.obstacles, () => {
        //     this.scene.restart();
        // })

        const flap = () => {

            if (this.isGameOver || this.hasWon) return;

            this.player.setVelocityY(-320)
            this.tweens.killTweensOf(this.player)
            this.tweens.add({
                targets: this.player,
                angle: -10,
                duration: 80,
                ease: "Power1",
                yoyo: false
            })

            if (this.sound && (this.cache.audio && this.cache.audio.exists("whoosh"))) {
                try {
                    this.sound.play("whoosh")
                } catch (e) {
                    console.log(e)
                    // nothing
                }
            }
        };

        this.input.on("pointerdown", flap)
        this.input.keyboard.on("keydown-ENTER", flap)
        this.input.keyboard.on("keydown-SPACE", flap)

        this.hasStarted = true;
        this.isGameOver = false;
        this.hasWon = false;


        this.score = 0;
        this.scoreText = this.add.text(12, 12, `Cakes: ${this.score}`, {
            font: "20px Arial",
            color: "#ffa6a6ff",
            stroke: "#000000",
            strokeThickness: 4
        }).setDepth(50).setScrollFactor(0);

        this.coinGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })
        this.physics.add.overlap(this.player, this.coinGroup, this.collectCoin, null, this)

        this.coinSpawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(1200, 2200),
            callback: () => {
                this.coinSpawnTimer.delay = Phaser.Math.Between(1200, 2200)
                this.spawnCoin()
            },
            callbackScope: this,
            loop: true
        })

        this.physics.add.collider(this.player, this.obstacles, this.onGameOver, null, this)


        this.scoreText = this.add.text(12, 12, `Cakes: ${this.score}`, {
            font: "20px Arial",
            color: "#ffa6a6ff",
            stroke: "#000000",
            strokeThickness: 4
        }).setDepth(50).setScrollFactor(0);

        // start hint: brief instruction for the player
        const hintText = this.add.text(this.cameras.main.centerX, Math.round(this.scale.height * 0.12),
            "Collect 10 Cakes Meenu 💖", {
            font: "20px Arial",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.45)",
            padding: { x: 12, y: 8 },
            align: "center"
        }).setOrigin(0.5).setDepth(60);

        // subtle entrance and fade out so it doesn't block gameplay
        hintText.setAlpha(0);
        this.tweens.add({
            targets: hintText,
            alpha: 1,
            y: hintText.y - 6,
            duration: 600,
            ease: "Sine.easeOut",
            yoyo: false,
            onComplete: () => {
                // keep visible briefly then fade and destroy
                this.time.delayedCall(2200, () => {
                    this.tweens.add({
                        targets: hintText,
                        alpha: 0,
                        duration: 700,
                        ease: "Sine.easeIn",
                        onComplete: () => hintText.destroy()
                    });
                });
            }
        });
    }

    spawnCoin() {
        const spawnX = this.scale.width + 60;
        const coinW = 56
        const attempts = 8
        const padTop = Math.floor(this.scale.height * 0.19)
        const padBottom = Math.floor(this.scale.height * 0.19)

        for (let i = 0; i < attempts; i++) {
            const y = Phaser.Math.Between(padTop, this.scale.height - padBottom)
            // temp
            const tmp = this.add.image(spawnX, y, "coin").setOrigin(0.5)
            if (tmp.width && tmp.height) {
                const scale = coinW / tmp.width;
                tmp.setDisplaySize(Math.round(coinW), Math.round(tmp.height * scale))
            }
            const rect = tmp.getBounds()
            tmp.destroy()

            // reject if intersects
            const intersectsExisting = this.activeRects.some(r => Phaser.Geom.Intersects.RectangleToRectangle(r, rect))
            const intersectsPlayer = Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), rect)

            const margin = Math.max(36, Math.floor(this.scale.width * 0.06))
            let tooClose = false
            for (let r of this.activeRects) {
                const cloned = Phaser.Geom.Rectangle.Clone(r)
                Phaser.Geom.Rectangle.Inflate(cloned, margin, margin)
                if (Phaser.Geom.Intersects.RectangleToRectangle(cloned, rect)) {
                    tooClose = true;
                    break;
                }
            }


            if (!intersectsExisting && !intersectsPlayer && !tooClose) {
                const coin = this.coinGroup.create(spawnX, y, "coin").setOrigin(0.5)

                if (coin.width && coin.height) {
                    const scale = coinW / coin.width;
                    coin.setDisplaySize(Math.round(coinW), Math.round(coin.height * scale))
                }

                const speed = - (180 + Math.min(120, Math.floor((1600 - this.spawnInterval) / 6)))
                coin.body.setVelocityX(speed)

                this.activeRects.push(coin.getBounds())
                console.log("Coin shown")
                return;
            }
        }

    }

    spawnRandomObstacle() {
        if (this.spawnInterval > 900) {
            this.spawnInterval -= 8;
            this.spawnTimer.reset({
                delay: this.spawnInterval,
                callback: this.spawnRandomObstacle,
                callbackScope: this,
                loop: true
            })
        }
        if (this.gapSize > this.minGap) {
            this.gapSize -= 6;
        }

        const type = (Math.random() < 0.7) ? "pipes" : "floating"

        this.activeRects = this.activeRects.filter(r => r.right > -50)

        if (type == "pipes") {
            console.log("Pipes called")
            this.spawnPipePair();
        } else {
            // this.spawnFloating();
        }
    }

    spawnPipePair() {
        const maxAttempts = 10;
        const padTop = Math.floor(this.scale.height * 0.12)
        const padBottom = Math.floor(this.scale.height * 0.12)
        const minY = padTop + Math.floor(this.gapSize / 2)
        const maxY = this.scale.height - padBottom - Math.floor(this.gapSize / 2)

        const spawnX = this.scale.width + 60
        const pipeW = Math.min(92, Math.floor(this.scale.width * 0.22))

        for (let i = 0; i < maxAttempts; i++) {
            console.log("Try: ", i)
            const gapY = Phaser.Math.Between(minY, maxY)
            const top = this.add.image(spawnX, gapY - (this.gapSize / 2), "obstacle1").setOrigin(0.5, 1)
            const bottom = this.add.image(spawnX, gapY + (this.gapSize / 2), "obstacle1").setOrigin(0.5, 0)

            top.setFlipY(true);

            if (top.width && top.height) {
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

            if (!intersectsExisting && !intersectsPlayer) {
                const topPipe = this.obstacles.create(spawnX, gapY - (this.gapSize / 2), "obstacle1").setOrigin(0.5, 1)
                topPipe.setFlipY(true);
                const bottomPipe = this.obstacles.create(spawnX, gapY + (this.gapSize / 2), "obstacle1").setOrigin(0.5, 0)

                if (topPipe.width && topPipe.height) {
                    const scale = pipeW / topPipe.width;
                    topPipe.setDisplaySize(Math.round(pipeW), Math.round(topPipe.height * scale))
                    bottomPipe.setDisplaySize(Math.round(pipeW), Math.round(bottomPipe.height * scale))
                }

                const speed = - (180 + Math.min(120, Math.floor((1600 - this.spawnInterval) / 6)))
                topPipe.body.setVelocityX(speed)
                bottomPipe.body.setVelocityX(speed)

                this.activeRects.push(topPipe.getBounds())
                this.activeRects.push(bottomPipe.getBounds())

                topPipe.once('destroy', () => { })
                bottomPipe.once('destroy', () => { })

                return;
            }


        }
    }

    collectCoin(player, coin) {

        if (!coin || !coin.active) return;
        if (coin.body && coin.body.enable) coin.body.enable = false
        coin.setActive(false)
        coin.setVisible(false)
        try {
            this.sound.play("whoosh")
        } catch (e) {
            console.log(e)
            // ignore            
        }
        this.tweens.add({
            targets: coin,
            scale: 1.4,
            alpha: 0,
            duration: 220,
            ease: "Power1",
            onComplete: () => {
                coin.destroy();
            }
        })
        coin.destroy()
        this.score += 1
        this.scoreText.setText(`Cakes: ${this.score}`)

        if (this.score >= 10 && !this.hasWon) {
            this.onWin()
        }
    }

    onGameOver(player, obstacle) {
        console.log("onGameOver called")
        if (this.isGameOver || this.hasWon) return;
        this.isGameOver = true

        this.physics.pause()
        if (this.spawnTimer) this.spawnTimer.remove(false);
        if (this.coinSpawnTimer) this.coinSpawnTimer.remove(false);

        if (this.player) this.player.setTint(0xff4444);

        const cx = this.cameras.main.centerX
        const cy = this.cameras.main.centerY

        const overlay = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6).setDepth(100)
        const title = this.add.text(cx, cy - 40, 'Arereee Jaan', {
            font: '32px Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(101)

        const btnStyle = {
            font: '20px Arial',
            color: "#000000",
            backgroundColor: "#ffb3d1",
            padding: { x: 14, y: 8 }
        };

        const retry = this.add.text(cx + 49, cy + 36, 'Firse', btnStyle).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true })
        retry.on("pointerup", () => {
            this.scene.restart()
        })

        const menu = this.add.text(cx - 49, cy + 36, 'Menu', btnStyle).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true })
        menu.on("pointerup", () => {
            this.scene.start('MenuScene')
        })
    }

    onWin() {
        if (this.hasWon) return;
        this.hasWon = true;

        // stop gameplay
        this.physics.pause();
        if (this.spawnTimer) this.spawnTimer.remove(false);
        if (this.coinSpawnTimer) this.coinSpawnTimer.remove(false);
        try { if (this.sound.get("bgmusic")) this.sound.get("bgmusic").stop(); } catch (e) { /* ignore */ }

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6).setDepth(100);

        // Compute 16:9 size that fits both width and a portion of height
        const maxWidth = Math.round(this.scale.width * 0.9);
        const maxHeight = Math.round(this.scale.height * 0.6); // leave room for messages/buttons
        let vidW = maxWidth;
        let vidH = Math.round(vidW * 9 / 16);
        if (vidH > maxHeight) {
            vidH = maxHeight;
            vidW = Math.round(vidH * 16 / 9);
        }
        const videoCenterY = cy - 10; // small upward offset so messages/buttons sit comfortably below

        // Simple redirect approach: show click text that opens the video in a new tab
        const clickText = this.add.text(cx, videoCenterY, "Click here to open the video", {
            font: '20px Arial',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.45)',
            padding: { x: 12, y: 8 },
            align: 'center'
        }).setOrigin(0.5).setDepth(215).setInteractive({ useHandCursor: true });

        clickText.once('pointerup', () => {
            // open in new tab - relative path to your asset
            window.open('assets/hbd.mp4', '_blank');
        });

        // messages (Phaser) centered under the click text
        const messages = [
            "Happy Birthday My Love ❤️",
            "So glad to have you 😊",
            "Love you so much 😘"
        ];
        const msgText = this.add.text(cx, videoCenterY + Math.round(vidH / 2) + 12, "", {
            font: "20px Arial",
            color: "#ffa6a6",
            align: "center",
            wordWrap: { width: Math.round(this.scale.width * 0.9) }
        }).setOrigin(0.5).setDepth(216);

        // cycle messages; ensure final message remains visible
        let idx = 0;
        const showNext = () => {
            if (idx >= messages.length) {
                msgText.setAlpha(1);
                msgText.setText("Love you forever jaanu 🥰");
                return;
            }
            msgText.setAlpha(0);
            msgText.setText(messages[idx]);
            this.tweens.add({ targets: msgText, alpha: 1, duration: 600, ease: 'Power1' });
            this.time.delayedCall(2200, () => {
                this.tweens.add({
                    targets: msgText, alpha: 0, duration: 600, ease: 'Power1', onComplete: () => {
                        idx++; showNext();
                    }
                });
            });
        };
        showNext();

        // buttons below messages
        const btnY = videoCenterY + Math.round(vidH / 2) + 80;
        const btnStyle = { font: '18px Arial', color: "#000000", backgroundColor: "#ffb3d1", padding: { x: 12, y: 8 } };
        const playAgain = this.add.text(cx - 70, btnY, "Play Again", btnStyle).setOrigin(0.5).setDepth(220).setInteractive({ useHandCursor: true });
        const backMenu = this.add.text(cx + 70, btnY, "Back", btnStyle).setOrigin(0.5).setDepth(220).setInteractive({ useHandCursor: true });

        playAgain.on('pointerup', () => {
            this.scene.restart();
        });
        backMenu.on('pointerup', () => {
            this.scene.start('MenuScene');
        });
    }

    update() {
        this.bg.tilePositionX += 3;
        if (!this.player) return

        const vy = this.player.body.velocity.y;
        const targetAngle = Phaser.Math.Clamp(vy / 6, -25, 70)

        this.player.angle = Phaser.Math.Interpolation.Linear([this.player.angle, targetAngle], 0.2)

        this.obstacles.getChildren().forEach(obs => {
            if (obs.x + (obs.displayWidth || obs.width) < -80) {
                obs.destroy()
            }
        })

        this.coinGroup.getChildren().forEach(c => {
            if (c.x + (c.displayWidth || c.width) < -80) c.destroy();
        })

        this.activeRects = this.obstacles.getChildren().map(o => o.getBounds()).concat(this.coinGroup.getChildren().map(c => c.getBounds()));
    }
}