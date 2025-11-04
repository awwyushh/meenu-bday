import { useEffect } from "react";
import Phaser from "phaser";
import GameConfig from "../phaser/GameConfig"

export default function GameCanvas(){
    useEffect(() => {
        const game = new Phaser.Game(GameConfig);
        return () => game.destroy(true);
    }, []);

    return <div id="game-container" style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
    }}></div>
}