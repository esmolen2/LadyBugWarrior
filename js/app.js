// Global variables
const movesDisplay = document.querySelector('.moves');
const lifeDisplay = document.querySelector('.lives');
const winsDisplay = document.querySelector('.wins');
const restart = document.querySelector('.restart');
const playAgain = document.querySelector('.play-again');

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
        this.x = this.xStart();               // restart its position to the left side,
        this.y = this.yStart();               // randomly assign a row position, and
        this.speed = this.speedSet();         // randomly reset it's speed
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Stop enemy
Enemy.prototype.stop = function() {
    this.speed = 0;
};

// Reset enemy
Enemy.prototype.reset = function() {
    this.speed = this.speedSet();
    this.x = this.xStart();
    this.y = this.yStart();
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

      // Count the player's moves
      this.moves = 0;

      // Count the player's lives
      this.lives = 3;

      // Count the player's wins
      this.wins = 0;
    }

    // Reset the player to the starting position: middle of the bottom row of grass on the canvas
    reset() {
      this.x = this.xStart;
      this.y = this.yStart;
    }

    // Count the player's moves and reset when needed
    moveCounter() {
        this.moves += 1;
        movesDisplay.innerHTML = this.moves;
    }

    resetMoves() {
        this.moves = 0;
        movesDisplay.innerHTML = this.moves;
    }

    // Count the player's lives and reset when needed
    killLife() {
        lifeDisplay.firstChild.remove();
        this.lives -= 1;
    }

    resetLives() {
        lifeDisplay.innerHTML = '<li><span class="fa fa-male"></span></li><li><span class="fa fa-male"></span></li><li><span class="fa fa-male"></span></li>';
        this.lives = 3;
    }

    // Count the player's wins and reset when needed
    addWin() {
        this.wins += 1;
        winsDisplay.innerHTML = this.wins;
    }

    resetWins() {
        this.wins = 0;
        winsDisplay.innerHTML = this.wins;
    }

    // Move the player to the next block accordingly for each key press
    // Confine player movement to within the canvas
    // Stop player movement when all lives used up or game won
    handleInput(key) {
        if (this.lives > 0 && this.wins < 10) {
            if (key == 'left' && this.x > 0) {
                this.x -= 101;
                this.moveCounter();
            } else if (key == 'right' && this.x < 404) {
                this.x += 101;
                this.moveCounter();
            } else if (key == 'up') {
                this.y -= 83;
                this.moveCounter();
            } else if (key == 'down' && this.y < 400) {
                this.y += 83;
                this.moveCounter();
            }
        }
    }

    // Check if any of the enemies and the player occupy the same space, and reset the player if they do
    checkCollisions() {
        // Set the actual visual start of the player, taking into account the image file's transparency
        let playerBoxX = this.x + 17;
        let playerBoxY = this.y + 63;

        // Loop through all instantiated enemies and check if any occupy the same space as the player
        // Reset the player and remove a life if they do
        allEnemies.forEach(function(enemy) {
            // Set the actual visual start of the enemy, taking into account the image file's transparency
            let enemyBoxX = enemy.x + 1;
            let enemyBoxY = enemy.y + 77;

            // Check for any overlap of enemy and player
            if (playerBoxX < enemyBoxX + enemy.spriteWidth &&   // check left side of player vs. right side of enemy
                playerBoxX + player.spriteWidth > enemyBoxX &&  // check right side of player vs. left side of enemy
                playerBoxY < enemyBoxY + enemy.spriteHeight &&  // check top side of player vs. bottom side of enemy
                player.spriteHeight + playerBoxY > enemyBoxY) { // check bottom side of player vs. top side of enemy
                  if (player.lives > 1) {                       // if overlap and lives left,
                      player.killLife();                        // reduce life count and
                      player.reset();                           // reset the player to start position
                  } else {                                      // if overlap and no lives left,
                      player.killLife();                        // reduce life count and end game
                      player.reset();
                      allEnemies.forEach(function(enemy) {
                          enemy.stop();
                      });
                      hideRestart();
                      showLoseModal();
                  }
            }
        });
    }

    // Update the player's position
    update() {
      // If the player hits the water, add a win and reset to starting position
      if (this.y < 45 && this.wins < 9) {
          this.addWin();
          this.reset();
      } else if (this.y < 45 && this.wins === 9){   // When player reaches the water for tenth win, end game
          this.addWin();
          this.reset();
          allEnemies.forEach(function(enemy) {
              enemy.stop();
          });
          hideRestart();
          showWinModal();
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

// Restart game button
const restartGame = function() {
    player.resetMoves();
    player.resetLives();
    player.resetWins();
    player.reset();
    allEnemies.forEach(function(enemy) {
        enemy.reset();
    });
}

// Remove the restart button upon game-ending modal appearing
function hideRestart() {
    restart.removeEventListener('click', restartGame);
    restart.classList.add('hide');
}

// Add restart button back in once game is restarted from game-ending modal
function showRestart() {
    restart.addEventListener('click', restartGame);
    restart.classList.remove('hide');
}

// Game-ending modal control
const endModal = document.getElementById('modal-screen');
const modalHeading = endModal.querySelector('.modal-heading');
const modalText = endModal.querySelector('.modal-text');

function showWinModal() {
    modalHeading.innerHTML = 'You Win!';
    modalText.innerHTML = 'Congrats, you won in ' + player.moves +' moves!';
    endModal.classList.add('flex');
}

function showLoseModal() {
    modalHeading.innerHTML = 'Game Over';
    modalText.innerHTML = 'You lose.';
    endModal.classList.add('flex');
}

function hideModal() {
    endModal.classList.remove('flex');
}

// Event Listeners
restart.addEventListener('click', restartGame);
playAgain.addEventListener('click', function() {
    restartGame();
    hideModal();
    showRestart();
});

// Original Moves, Lives, and Wins counter code. Moved into Player class

// Control move counter
// let moves = 0;
// const movesDisplay = document.querySelector('.moves');

// function moveCounter() {
//     moves += 1;
//     movesDisplay.innerHTML = moves;
// }
//
// function resetMoves() {
//     moves = 0;
//     movesDisplay.innerHTML = moves;
// }

// Control life counter
// let lives = 3;
// const lifeDisplay = document.querySelector('.lives');

// function killLife() {
//     lifeDisplay.firstChild.remove();
//     lives -= 1;
// }
//
// function resetLives() {
//     lifeDisplay.innerHTML = '<li><span class="fa fa-male"></span></li><li><span class="fa fa-male"></span></li><li><span class="fa fa-male"></span></li>';
//     lives = 3;
// }

// Control wins counter
// let wins = 0;
// const winsDisplay = document.querySelector('.wins');

// function addWin() {
//     wins += 1;
//     winsDisplay.innerHTML = wins;
// }
//
// function resetWins() {
//     wins = 0;
//     winsDisplay.innerHTML = wins;
// }
