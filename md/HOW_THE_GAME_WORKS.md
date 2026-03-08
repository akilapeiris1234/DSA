# How HeartSweeper Works

## Game Overview

HeartSweeper is a puzzle game inspired by the classic Minesweeper, but with a unique twist. Instead of just avoiding mines, players must find hidden hearts and carrots while navigating a grid filled with bombs. The game combines strategy, luck, and quick decision-making.

## How to Play

### Objective
- **Win**: Reveal all safe tiles on the board (tiles that don't contain bombs)
- **Lose**: Click on a bomb tile
- **Collect**: Find hearts and carrots for bonus points and leaderboard scoring

### Game Board
The game board is a grid of square tiles with three types of hidden content:
- **Bombs** (💣): Clicking these ends the game immediately
- **Hearts** (❤️): Bonus collectibles that add to your score
- **Carrots** (🥕): Bonus collectibles that add to your score
- **Empty tiles**: Show a number indicating how many bombs are in the adjacent 8 tiles

### Difficulty Levels
- **Beginner**: 8×8 grid with 10 bombs
- **Intermediate**: 12×12 grid with 25 bombs  
- **Expert**: 16×16 grid with 45 bombs

### Gameplay Mechanics

1. **Starting a Game**
   - Select your difficulty level
   - The game fetches random counts of hearts and carrots from an external server
   - The board is generated with bombs, hearts, and carrots placed randomly
   - Timer starts on your first tile click

2. **Tile Interaction**
   - **Left Click**: Reveal a tile
     - If it's a bomb → Game Over
     - If it's a heart/carrot → Collect it (adds to score)
     - If it's empty → Shows number of adjacent bombs (0-8)
   - Empty tiles with 0 adjacent bombs automatically reveal surrounding tiles

3. **Winning Condition**
   - Reveal all tiles that don't contain bombs
   - Hearts and carrots are safe to click and help your score

4. **Scoring**
   - Primary score: Total hearts + carrots collected
   - Secondary score: Time taken (faster is better for ties)
   - Only winning games are eligible for leaderboard

## API Usage

HeartSweeper uses several APIs to enhance gameplay and provide social features:

### Game Data API
- **Purpose**: Provides random heart and carrot counts for each game
- **Endpoint**: `http://marcconrad.com/uob/heart/api.php?out=json&t=<timestamp>`
- **Usage**: Called at the start of each new game to get fresh random values
- **Response**: JSON with `solution` (hearts count) and `carrots` (carrots count)
- **Proxy**: Uses `https://corsproxy.io/` to handle CORS restrictions

### Leaderboard API (Firebase Firestore)
- **Purpose**: Stores and retrieves player scores for competitive leaderboards
- **Features**:
  - Real-time leaderboard updates
  - Score saving with duplicate prevention (only saves if better score)
  - Separate leaderboards per difficulty level
  - Top 20 players displayed
- **Data Stored**:
  - Player ID and display name
  - Hearts and carrots collected
  - Game time
  - Win/loss status
  - Timestamp

### User Profile API (Firebase Firestore)
- **Purpose**: Manages user accounts and profiles
- **Features**:
  - User registration and authentication
  - Profile data storage (name, email, photo)
  - Activity tracking (last active time)
- **Authentication**: Uses Firebase Auth for login/signup

### GIF API (Giphy)
- **Purpose**: Provides celebratory or failure animations on game end
- **Usage**: Fetches random GIFs based on win/loss status
- **API Key**: Integrated Giphy API for dynamic content

## Game Flow

1. **Authentication**: Players can play as guests or create accounts
2. **Game Setup**: Select difficulty, fetch heart/carrot counts from API
3. **Board Generation**: Random placement of bombs, hearts, carrots
4. **Gameplay**: Click tiles to reveal content, collect items, avoid bombs
5. **Game End**: Win by clearing all safe tiles, lose by hitting bombs
6. **Scoring**: Save score to leaderboard if authenticated
7. **Celebration**: Show GIF and update real-time leaderboard

## Strategy Tips

- Start with corners or edges (fewer adjacent tiles)
- Use the numbers to deduce bomb locations
- Hearts and carrots are safe - click them for points
- Faster completion gives leaderboard advantage in ties
- Practice on Beginner before trying harder difficulties

## Technical Architecture

The game uses a modern web stack:
- **Frontend**: Next.js with React hooks for state management
- **Backend**: Firebase for authentication and data storage
- **Real-time**: Firestore listeners for live leaderboard updates
- **External APIs**: For game randomization and visual feedback
- **Styling**: CSS with responsive design for mobile and desktop</content>
<parameter name="filePath">d:\HeartSweeper\heartsweeper\md\HOW_THE_GAME_WORKS.md