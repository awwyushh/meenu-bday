import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene")
    }

    create() {
        this.add
            .image(0, 0, "bg")
            .setOrigin(0).setDisplaySize(this.scale.width, this.scale.height)

        this.bgm = this.sound.get("bgmusic") || this.sound.add("bgmusic", { loop: true })
        this.bgm.play();

        const cx = this.cameras.main.centerX
        const cy = this.cameras.main.centerY

        const topPadding = Math.max(24, Math.floor(this.scale.height * 0.07))
        const banner = this.add
            .image(cx, topPadding, "banner")
            .setOrigin(0.5, 0)
        const bannerTargetW = Math.min(this.scale.width * 0.6, 220)
        if (banner.width && banner.height) {
            banner.setDisplaySize(bannerTargetW, bannerTargetW * (banner.height / banner.width))
        }

        this.tweens.add({
            targets: banner,
            y: banner.y - 10,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        })

        const sprite = this.add
            .image(cx, cy+24, "meenu")
            .setOrigin(0.5);
        const targetSpriteW = Math.min(this.scale.width * 0.6, 200)
        if (sprite.width && sprite.height) {
            sprite.setDisplaySize(targetSpriteW, targetSpriteW * (sprite.height / sprite.width))
        }


        const btnWidth = Math.min(this.scale.width * 0.7, 320)
        const btnHeight = Math.min(Math.floor(this.scale.height * 0.13), 96)
        const pink = 0xff6fb3
        const pinkHover = 0xff4fa0

        const spriteHalfH = (sprite.displayHeight || 0) / 2;
        const btnY = cy + Math.max(spriteHalfH, 30) + 40;

        const rect = this.add.
            rectangle(cx, btnY, btnWidth, btnHeight, pink, 0.8)
            .setStrokeStyle(4, 0xffffff)
            .setOrigin(0.5)
            .setInteractive({
                useHandCursor: true,
            })

        const label = this.add.text(cx, btnY, "Start", {
            fontFamily: "Arial",
            fontSize: "45px",
            color: '#ffffff',
            align: "center",
            fontStyle: "bold"
        }).setOrigin(0.5);

        rect.on("pointerover", () => {
            rect.setFillStyle(pinkHover)
            rect.setScale(1.15)
            label.setScale(1.15)
        })

        rect.on("pointerout", () => {
            rect.setFillStyle(pink)
            rect.setScale(1)
            label.setScale(1)
            label.setStyle({
                color: "#ffffff"
            })
        })

        const startGame = () => {
            this.bgm = this.sound.get("whoosh") || this.sound.add("whoosh")
            this.bgm.play();
            this.time.delayedCall(150, () => {
                this.scene.start("MainScene");
                3
            })
        }
        rect.on("pointerup", startGame);

        this.input.keyboard.on("keydown-ENTER", () => {
            this.scene.start("MainScene");
        })
    }
} 2