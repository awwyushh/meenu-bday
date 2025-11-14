import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        this.load.image("menuBackground", "assets/images/menuBackground.png");
        this.load.audio("menuMusic", "assets/audio/menuMusic.mp3");
    }

    create() {
        this.add.image(0, 0, "menuBackground").setOrigin(0);
        this.sound.play("menuMusic", { loop: true });

        const title = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, "Meenu's Birthday Game", {
            font: "32px Arial",
            color: "#ffffff"
        }).setOrigin(0.5);

        const startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Start Game", {
            font: "24px Arial",
            color: "#ffffff",
            backgroundColor: "#ffb3d1",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startButton.on("pointerup", () => {
            this.scene.start("MainScene");
        });

        const instructionsButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, "Instructions", {
            font: "24px Arial",
            color: "#ffffff",
            backgroundColor: "#ffb3d1",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        instructionsButton.on("pointerup", () => {
            // Logic to show instructions can be added here
            alert("Instructions: Use mouse or space/enter to flap and avoid obstacles!");
        });

        const exitButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, "Exit", {
            font: "24px Arial",
            color: "#ffffff",
            backgroundColor: "#ffb3d1",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        exitButton.on("pointerup", () => {
            this.game.destroy(true);
        });
    }

    update() {
        // Any updates needed for the menu can be handled here
    }
}