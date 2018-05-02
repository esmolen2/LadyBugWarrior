// Enemies our player must avoid
const Enemy = function() {
    // The image/sprite for our enemies, this uses a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Actual visual size of the enemy, takes into account the image file's transparency
    this.spriteWidth = 98;
    this.spriteHeight = 66;

    // Randomize the left-side starting position of the enemy to randomly time it's appearance on the canvas
    this.xStart = function () {
        return Math.floor(Math.random() * -600) - 97;
    };
    this.x = this.xStart();

    // Randomize the row (1 of 3) the enemy appears in
    this.yStart = function () {
        let yStart;
        const randomizer = Math.floor(Math.random() * 3) + 1;
        randomizer == 1 ? yStart = 63  :
        randomizer == 2 ? yStart = 145 : yStart = 229;
        return yStart;
    };
    this.y = this.yStart();

    // Randomize the enemy speed
    this.speedSet = function () {
        return Math.random() * 150 + 75;
    };
    this.speed = this.speedSet();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks; will ensure the game runs at the same speed for all computers
Enemy.prototype.update = function(dt) {
    if (this.x < 600) {                       // If enemy is on screen,
        this.x = this.x + (this.speed * dt);  // move enemy according to its speed.
    } else {                                  // If enemy is off screen to the right,
        this.x = this.xStart();               // restart its position to the left side and
        this.y = this.yStart();
        this.speed = this.speedSet();         // randomly reset it's speed
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player to be controlled
class Player {
    constructor() {
      // The image/sprite for our player, this uses a helper we've provided to easily load images
      this.sprite = 'images/char-boy.png';

      // Actual visual size of the player, takes into account the image file's transparency
      this.spriteWidth = 67;
      this.spriteHeight = 76;

      // Always start the player in the middle of the bottom row of grass on the canvas
      this.xStart = 202;
      this.yStart = 400;
      this.x = this.xStart;
      this.y = this.yStart;
    }

    // Reset the player to the starting position: middle of the bottom row of grass on the canvas
    reset() {
      this.x = this.xStart;
      this.y = this.yStart;
    }

    // Move the player to the next block accordingly for each key press
    // Confine player movement to within the canvas
    handleInput(key) {
        if (key == 'left' && this.x > 0) {
            this.x -= 101;
            moveCounter();
        } else if (key == 'right' && this.x < 404) {
            this.x += 101;
            moveCounter();
        } else if (key == 'up') {
            this.y -= 83;
            moveCounter();
        } else if (key == 'down' && this.y < 400) {
            this.y += 83;
            moveCounter();
        }
    }

    // Check if any of the enemies and the player occupy the same space, and reset the player if they do
    checkCollisions() {
        // Set the actual visual start of the player, taking into account the image file's transparency
        let playerBoxX = this.x + 17;
        let playerBoxY = this.y + 63;

        // Loop through all instantiated enemies and check if any occupy the same space as the player
        // Reset the player if they do
        allEnemies.forEach(function(enemy) {
            // Set the actual visual start of the enemy, taking into account the image file's transparency
            let enemyBoxX = enemy.x + 1;
            let enemyBoxY = enemy.y + 77;

            // Check for any overlap of enemy and player
            if (playerBoxX < enemyBoxX + enemy.spriteWidth &&   // check left side of player vs. right side of enemy
                playerBoxX + player.spriteWidth > enemyBoxX &&  // check right side of player vs. left side of enemy
                playerBoxY < enemyBoxY + enemy.spriteHeight &&  // check top side of player vs. bottom side of enemy
                player.spriteHeight + playerBoxY > enemyBoxY) { // check bottom side of player vs. top side of enemy
                  player.reset();                               // reset the player to start position if overlap
            }
        });
    }
    // Update the player's position
    update() {
      // If the player hits the water, reset to starting position
      if (this.y < 45) {
        player.reset();
      };

      // Check if the player and enemy overlap at all
      this.checkCollisions();
    }

    // Draw the player on the screen
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// Instantiate enemies and place them in an array
const enemyOne = new Enemy();
const enemyTwo = new Enemy();
const enemyThree = new Enemy();
const enemyFour = new Enemy();
const enemyFive = new Enemy();

const allEnemies = [enemyOne, enemyTwo, enemyThree, enemyFour, enemyFive];

// Instantiate the player
const player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Control move counter

let moves = 0;
const movesDisplay = document.querySelector('.moves');

function moveCounter() {
    moves += 1;
    movesDisplay.innerHTML = moves;
}

function clearMoves() {
    moves = 0;
    movesDisplay.innerHTML = moves;
}
