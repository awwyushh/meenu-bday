# Meenu's Birthday Game

This project is a fun and interactive game created using Phaser, designed to celebrate Meenu's birthday. The game features engaging gameplay mechanics, including player movement, obstacle avoidance, and coin collection.

## Project Structure

```
meenu-bday
├── src
│   ├── phaser
│   │   └── MainScene.js       # Main gameplay logic
│   ├── index.js                # Entry point for the application
│   └── scenes
│       └── MenuScene.js        # Main menu management
├── public
│   └── index.html              # Main HTML file
├── assets
│   ├── audio                   # Audio files (sound effects, music)
│   ├── images                  # Image files (sprites, backgrounds)
│   └── video                   # Video files (congratulatory video)
├── package.json                # npm configuration file
├── webpack.config.js           # Webpack configuration
├── .gitignore                  # Git ignore file
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd meenu-bday
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to play the game.

## Gameplay

- Control the player character to avoid obstacles and collect coins.
- The game ends when the player collides with an obstacle.
- Collecting coins increases your score, and reaching a certain score triggers a win condition.

## Assets

- All game assets (audio, images, video) are located in the `assets` directory.
- Ensure that the paths to these assets are correctly referenced in the code.

## License

This project is open-source and available for anyone to use and modify. Enjoy the game!