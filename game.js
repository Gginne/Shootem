var canvas = document.getElementById('canvas');
// Get the canvas drawing context
var context = canvas.getContext('2d');

// Create an object representing a character on the canvas
function makeCharacter(x, y, length, speed, health=1, type="ship", move="normal") {
  return {
    x: x,
    y: y,
    l: length,
    s: speed,
    health: health,
    type: type,
    move: move,
    draw: function() {
      
      context.font=`${this.l*1.5}px FontAwesome`;
      context.textAlign = 'center';
      context.textBaseline = "middle";
      if(type == "ship"){
        context.fillText(String.fromCharCode("0xf197"),this.x+this.l/2,this.y+this.l/2);
      } else if(type == "enemy"){
        context.fillText(String.fromCharCode("0xf188"),this.x+this.l/2,this.y+this.l/2);
      } else if(type == "bullet"){
        context.fillText(String.fromCharCode("0xf0da"),this.x+this.l/2,this.y+this.l/2);
      }
      
  
      
    }
  };
}

// The ship the user controls
var ship = makeCharacter(50, canvas.height / 2 - 25, 45, 5);

// Flags to tracked which keys are pressed
var up = false;
var down = false;
var space = false;

// Is a bullet already on the canvas?
var shooting = false;
// The bulled shot from the ship
var bullet = makeCharacter(0, 0, 15, 15, 1, "bullet");
// An array for enemies (in case there are more than one)
var enemies = [];

// Add an enemy object to the array
var enemyBaseSpeed = 2; 
function makeEnemy() {
  var move = Math.random() < 0.4 ? "diagonal" : "normal";
  
  var enemySize = Math.round((Math.random() * 15)) + 15;
  var enemySpeed = (move == "diagonal" && Math.random() < 0.5 ? -1 : 1)*((Math.round(Math.random() * enemyBaseSpeed)) + enemyBaseSpeed)
  var enemyX = move == "diagonal" ? canvas.width-enemySize*5 : canvas.width;
  
  var enemyY = move == "diagonal" ? (enemySpeed > 0 ? (canvas.height - enemySize) : 0) : Math.round(Math.random() * (canvas.height - enemySize * 2)) + enemySize;
  var enemyHealth = Math.floor(score/5) + 1
  enemies.push(makeCharacter(enemyX, enemyY, enemySize, enemySpeed, enemyHealth, "enemy", move));
}

// Check if number a is in the range b to c (exclusive)
function isWithin(a, b, c) {
  return (a > b && a < c);
}

// Return true if two squares a and b are colliding, false otherwise
function isColliding(a, b) {
  var result = false;
  if (isWithin(a.x, b.x, b.x + b.l) || isWithin(a.x + a.l, b.x, b.x + b.l)) {
    if (isWithin(a.y, b.y, b.y + b.l) || isWithin(a.y + a.l, b.y, b.y + b.l)) {
      result = true;
    }
  }
  return result;
}

// Track the user's score
var score = 0;
// The delay between enemies (in milliseconds)
var timeBetweenEnemies = 5 * 1000;
// ID to track the spawn timeout
var timeoutId = null;

// Show the game menu and instructions
function menu() {
  erase();
  context.fillStyle = '#000000';
  context.font = '36px Arial';
  context.textAlign = 'center';
  context.fillText('Shoot \'Em!', canvas.width / 2, canvas.height / 4);
  context.font = '24px Arial';
  context.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
  context.font = '18px Arial';
  context.fillText('Up/Down to move, Space to shoot.', canvas.width / 2, (canvas.height / 4) * 3);
  // Start the game on a click
  canvas.addEventListener('click', startGame);
}

function soundFX(effect){
  sounds = {
    "shoot": "./assets/shoot.mp3",
    "enemyDeath": "./assets/death.mp3",
    "gameOver": "./assets/gameOver.mp3"
  }
  var audio = document.createElement("audio")
  audio.setAttribute("preload", "auto");
  audio.setAttribute("controls", "none");
  audio.style.display = "none";
  audio.src = sounds[effect]
  document.body.appendChild(audio);
  audio.play()
}

// Start the game
function startGame() {
	// Kick off the enemy spawn interval
  timeoutId = setInterval(makeEnemy, timeBetweenEnemies);
  // Make the first enemy
  setTimeout(makeEnemy, 1000);
  // Kick off the draw loop
  draw();
  // Stop listening for click events
  canvas.removeEventListener('click', startGame);
}

// Show the end game screen
function endGame() {
	// Stop the spawn interval
  clearInterval(timeoutId);
  // Show the final score
  erase();
  context.fillStyle = '#000000';
  context.font = '24px Arial';
  context.textAlign = 'center';
  context.fillText('Game Over. Final Score: ' + score, canvas.width / 2, canvas.height / 2);
}

// Listen for keydown events
canvas.addEventListener('keydown', function(event) {
  event.preventDefault();
  if (event.keyCode === 38) { // UP
    up = true;
  }
  if (event.keyCode === 40) { // DOWN
    down = true;
  }
  if (event.keyCode === 32) { // SPACE
    shoot();
  }
});

// Listen for keyup events
canvas.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 38) { // UP 
    up = false;
  }
  if (event.keyCode === 40) { // DOWN
    down = false;
  }
});

// Clear the canvas
function erase() {
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, 600, 400);
}

// Shoot the bullet (if not already on screen)
function shoot() {
  if (!shooting) {
    shooting = true;
    soundFX("shoot")
    bullet.x = ship.x + ship.l;
    bullet.y = ship.y + ship.l/2;
  }
}

// The main draw loop
function draw() {
  erase();
  var gameOver = false;
  // Move and draw the enemies
  enemies.forEach(function(enemy) {

    if (enemy.move === "normal") {
      enemy.x -= enemy.s; 
    } else if(enemy.move === "diagonal"){
      enemy.x -= Math.abs(enemy.s) ;
      enemy.y -= enemy.s;
    }
    
    if(enemy.x < 0 || enemy.y < 0 || enemy.y > canvas.height){
      gameOver = true
    } 
    
    context.fillStyle = '#00FF00';
    enemy.draw();
    context.fillStyle = '#FF0000';
    context.font = 'bold 12px Arial';
    context.textAlign = 'center';
    context.fillText(`${enemy.health}`, enemy.x+enemy.l/2, enemy.y-enemy.l/2);  
    
    
  });
  
  
  
  // Collide the ship with enemies
  enemies.forEach(function(enemy, i) {
    if(isColliding(enemy, ship)){
      gameOver = true
    }
  });
  // Move the ship
  if (down) {
    ship.y += ship.s;
  }
  if (up) {
    ship.y -= ship.s;
  }
  // Don't go out of bounds
  if (ship.y < 0) {
    ship.y = 0;
  }
  if (ship.y > canvas.height - ship.l) {
    ship.y = canvas.height - ship.l;
  }
  // Draw the ship
  context.fillStyle = '#FF0000';
  ship.draw();
  
  
  // Move and draw the bullet
  if (shooting) {
    // Move the bullet
    bullet.x += bullet.s;
    // Collide the bullet with enemies
    
    enemies = enemies.map(function(enemy){
      if(isColliding(bullet, enemy) && enemy.health > 0){
        shooting = false
        return {...enemy, health: enemy.health-1}
      }
      return enemy
    })
    enemies.forEach(function(enemy, i) {
      
      if (isColliding(bullet, enemy) && enemy.health == 0) {
        enemies.splice(i, 1);
        soundFX("enemyDeath");
        score++;
        shooting = false;
        // Make the game harder
        if (score % 10 === 0 && timeBetweenEnemies > 1000) {
          clearInterval(timeoutId);
          timeBetweenEnemies -= 1000;
          timeoutId = setInterval(makeEnemy, timeBetweenEnemies);
        } else if (score % 5 === 0) {
          enemyBaseSpeed += 1;
          
        }
      }
    
    });
    // Collide with the wall
    if (bullet.x > canvas.width) {
      shooting = false;
    }
    // Draw the bullet
    context.fillStyle = '#0000FF';
    bullet.draw();
  }
  // Draw the score
  context.fillStyle = '#000000';
  context.font = '24px Arial';
  context.textAlign = 'left';
  context.fillText('Score: ' + score, 1, 25)
  // End or continue the game
  if (gameOver) {
    endGame();
  } else {
    window.requestAnimationFrame(draw);
  }
}

// Start the game
menu();
canvas.focus();