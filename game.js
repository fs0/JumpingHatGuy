/*
* Based on the code written by Michal Budzynski: http://michalbe.blogspot.com
* Code of the original game https://github.com/michalbe/Simple-game-with-HTML5-Canvas/
*/


/************
* VARIABLES *
*************/
// screen
var width = 600; // width of the canvas
var height = 500; // height of the canvas

// canvas
var c = document.getElementById("c"); // canvas itself
var ctx = c.getContext("2d"); // two-dimensional graphic context of the canvas
c.width = width;
c.height = height;
c.style.cursor = "none";

// game
var gLoop;
var currentHeight = 0;
var highscoreHeight = 0;
var heightChangeColor = 450; // change color to white at this height
var gameover = true; // game over?

// scores
var score = 0;
var highscore = 0;
var highscoreReached = true;
var hitBlueOrRed = 0; // hit blue/red in a row
var hitBlue = false; // jumped on blue in a combo
var hitRed = false; // jumped on red in a combo
var Combo = false; // red combo completed
var blueBonus = 20; // bonus points for blue combo --> blueBonus*2, blueBonus*3...
var redBonus = 50; // bonus points for red combo --> redBonus*2, redBonus*3...

// platforms
var numPlatforms = 7;
var platforms = [];
var platformWidth = 80;
var platformHeight = 26;
var weakJumpSpeed = 16;
var normalJumpSpeed = 20;
var heavyJumpSpeed = 60;
var extremeJumpSpeed = 100;

// circles
var numCircles = 18;
var circles = [];
var radius = 100;

// player movement
var right = false;
var left = false;
var sensitivity = 14;
var boostleft = 3; 
var boost = 1; // jump speed multiplier
var boostStrength = 2; // strength of the multiplier


/***********
* CONTROLS *
************/

// move player, set boost or start game
document.onkeydown = function(e) {
    if (gameover && e.keyCode == 32){ // game over and space pressed
        boostleft = 3;
        boost = 1;
        gameover = false;
        score = 0;
        hitBlueOrRed = 0;
        hitRed = false;
        hitBlue = false;
        Combo = false;
        currentHeight = 0;
        radius = 100;
        generateCircles();
        generatePlatforms();
        initPlayer();
        gameLoop();
    } else if (e.keyCode == 32 && boostleft > 0) { // space pressed
        boost = boostStrength;
        boostleft--;
    } else if (e.keyCode == 39) { // right arrow key pressed
        right = true;
    } else if (e.keyCode == 37) { // left arrow key pressed
        left = true;
    } else if (e.keyCode == 38 && boostleft > 0) { // up arrow key pressed
        boostleft--;
        player.instantJump();
    }
}

// stop moving player
document.onkeyup = function(e) {
    if (e.keyCode == 39) { // right arrow key released
        right = false;
    } else if (e.keyCode == 37) { // left arrow key released
        left = false;
    }
}


/*************
* BACKGROUND *
**************/

// set background
var clear = function() {
    ctx.fillStyle = "#b4d7ff"; // set active color
    if (currentHeight > 1000) {
        ctx.fillStyle = "#010811";
        radius = 2;
    } else if (currentHeight > 950) {
        ctx.fillStyle = "#021123";
        radius = 2;
    } else if (currentHeight > 900) {
        ctx.fillStyle = "#021831";
        radius = 2;
    } else if (currentHeight > 850) {
        ctx.fillStyle = "#022144";
        radius = 2;
    } else if (currentHeight > 800) {
        ctx.fillStyle = "#022d5e";
        radius = 2;
    } else if (currentHeight > 750) {
        ctx.fillStyle = "#0a3463";
        radius = 3;
    } else if (currentHeight > 700) {
        ctx.fillStyle = "#103864";
        radius = 4;
    } else if (currentHeight > 650) {
        ctx.fillStyle = "#1b416b";
        radius = 5;
    } else if (currentHeight > 600) {
        ctx.fillStyle = "#20436b";
        radius = 8;
    } else if (currentHeight > 550) {
        ctx.fillStyle = "#264f7c";
        radius = 10;
    } else if (currentHeight > 500) {
        ctx.fillStyle = "#2f5a8a";
        radius = 12;
    } else if (currentHeight > 450) {
        ctx.fillStyle = "#39679a";
        radius = 15;
    } else if (currentHeight > 400) {
        ctx.fillStyle = "#4171a6";
        radius = 20;
    } else if (currentHeight > 350) {
        ctx.fillStyle = "#5181b8";
        radius = 25;
    } else if (currentHeight > 300) {
        ctx.fillStyle = "#5f91c9";
        radius = 30;
    } else if (currentHeight > 250) {
        ctx.fillStyle = "#71a3db";
        radius = 35;
    } else if (currentHeight > 200) {
        ctx.fillStyle = "#83b0e3";
        radius = 40;
    } else if (currentHeight > 150) {
        ctx.fillStyle = "#90bbec";
        radius = 45;
    } else if (currentHeight > 100) {
        ctx.fillStyle = "#a0c7f3";
        radius = 50;
    }
    ctx.beginPath(); // start drawing
    ctx.rect(0, 0, width, height); // draw rectangle
    ctx.closePath(); // end drawing
    ctx.fill(); // fill rectangle
    ctx.font = "9pt Arial";
}


/**********
* CIRCLES *
***********/

var drawCircles = function() {
    // white color with transparency in rgba
    for (var i = 0; i < numCircles; i++) {
        ctx.fillStyle = "rgba(255,255,255," + circles[i][3] + ")";
        ctx.beginPath();

        // arc(x,y,radius,startAngle,endAngle,anticlockwise)
        // circle always has PI*2 end angle
        ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);

        ctx.closePath();
        ctx.fill();
    }
}

var moveCircles = function(deltaY) {
    for (var i = 0; i < numCircles; i++) {
        // if the circle isn't visible anymore, change information
        if (circles[i][1] - circles[i][2] > height) {
            circles[i][0] = Math.random() * width;
            circles[i][1] = 0 - circles[i][2];
            circles[i][2] = Math.random() * radius;
            circles[i][3] = Math.random() / 2;
        } else {
            circles[i][1] += deltaY; // move circle down
        }
    }
}

var generateCircles = function() {
    circles = [];
    // circle information: x, y, radius, transparency (0-1, 1 is no transparency)
    for (var i = 0; i < numCircles; i++) {
        circles.push([Math.random() * width, Math.random() * height, Math.random() * radius, Math.random() / 1.5]);
    }
}


/*********
* PLAYER *
**********/

var player = new (function() {
    var thisPlayer = this; // 'thisPlayer' is the new context

    // image
    thisPlayer.image = new Image();
    thisPlayer.image.src = "p.png";
    thisPlayer.image2 = new Image();
    thisPlayer.image2.src = "p2.png";

    thisPlayer.height = 48; // height of the frame
    thisPlayer.width = 24; // width of the frame

    // position
    thisPlayer.X = 0;
    thisPlayer.Y = 0;

    // state of the object
    thisPlayer.isJumping = false;
    thisPlayer.isFalling = false;
    thisPlayer.jumpSpeed = 0;
    thisPlayer.fallSpeed = 0;

    thisPlayer.setPosition = function(x,y) {
        thisPlayer.X = x;
        thisPlayer.Y = y;
    }

    thisPlayer.draw = function() {
        try {
            if (thisPlayer.isJumping) {
                ctx.drawImage(thisPlayer.image, thisPlayer.X, thisPlayer.Y);
            } else if (thisPlayer.isFalling) {
                ctx.drawImage(thisPlayer.image2, thisPlayer.X, thisPlayer.Y);
            }

        } catch(e) {
        }
    }

    thisPlayer.jump = function() {
        if (!thisPlayer.isJumping && !thisPlayer.isFalling) {
            thisPlayer.fallSpeed = 0;
            thisPlayer.isJumping = true;
            thisPlayer.jumpSpeed = normalJumpSpeed * boost; 
        }
    }

    thisPlayer.checkJump = function() {
        if (thisPlayer.Y > height * 0.4) { // move character instead of circles and platforms
            thisPlayer.setPosition(thisPlayer.X, thisPlayer.Y - thisPlayer.jumpSpeed);
        } else { // move circles and platforms instead of character
            if (thisPlayer.jumpSpeed > 95) {
                score += 4;
            } else if (thisPlayer.jumpSpeed > 55) {
                score += 2;
            } else if (thisPlayer.jumpSpeed > 10) {
                score += 1;
            }

            if (score >= highscore) {
                highscore = score;
                if (highscoreReached == false) {
                    highscoreReached = true;
                }
            }
            currentHeight = currentHeight + thisPlayer.jumpSpeed/100 // update current height
            moveCircles(thisPlayer.jumpSpeed * 0.35); // move circles
            movePlatforms();
        }

        thisPlayer.jumpSpeed--;
        
        if (thisPlayer.jumpSpeed == 0) {
            thisPlayer.isJumping = false;
            thisPlayer.isFalling = true;
            thisPlayer.fallSpeed = 1;
        }
    }

    thisPlayer.checkFall = function() {
        if (thisPlayer.Y < height - thisPlayer.height) {
            thisPlayer.setPosition(thisPlayer.X, thisPlayer.Y + thisPlayer.fallSpeed);
            if (thisPlayer.fallSpeed < platformHeight) thisPlayer.fallSpeed++;
        } else { // character hit ground
            if (score == 0) {
                thisPlayer.fallStop();
            } else {
                gameOver();
            }
        }
    }

    thisPlayer.fallStop = function() {
        thisPlayer.isFalling = false;
        thisPlayer.jump();
    }

    thisPlayer.instantJump = function() {
        thisPlayer.isFalling = false;
        thisPlayer.isJumping = true;
        thisPlayer.jumpSpeed += weakJumpSpeed;
    }

    thisPlayer.moveLeft = function() {
        if (thisPlayer.X + thisPlayer.width > 0) {
            thisPlayer.setPosition(thisPlayer.X - sensitivity, thisPlayer.Y);
        } else {
            thisPlayer.setPosition(width - thisPlayer.width/2, thisPlayer.Y);
        }
    }

    thisPlayer.moveRight = function() {
        if (thisPlayer.X < width) {
            thisPlayer.setPosition(thisPlayer.X + sensitivity, thisPlayer.Y);
        } else {
            thisPlayer.setPosition(0 - thisPlayer.width/2, thisPlayer.Y);
        }
    }

    thisPlayer.update = function() {
        if (right) thisPlayer.moveRight();
        if (left) thisPlayer.moveLeft();
        if (thisPlayer.isJumping) player.checkJump();
        if (thisPlayer.isFalling) player.checkFall();
        thisPlayer.draw();
    }
})();

var initPlayer = function() {
    // move character to center of screen, ~~ = Math.floor()
    player.setPosition(~~((width - player.width) / 2), ~~((height - player.height) / 2));
    player.jump();
}


/************
* PLATFORMS *
*************/

var Platform = function(x, y, type) {
    var thisPlatform = this;

    // black platform
    thisPlatform.firstColor = "Grey";
    thisPlatform.secondColor = "Black"

    thisPlatform.onCollide = function() {
        Combo = false; // no combo
        hitBlueOrRed = 0;
        hitBlue = false;
        hitRed = false;
        player.fallStop();
        boost = 1;
    };

    // blue platform
    if (type === 1) {
        thisPlatform.firstColor = "Blue";
        thisPlatform.secondColor = "Black";
        thisPlatform.onCollide = function() {
            hitBlueOrRed++; 
            hitBlue = true;
            hitRed = false;
            if (hitBlueOrRed >= 2) { // jumped on blue 2 times in a row
                Combo = true;
                score += blueBonus * hitBlueOrRed;
            }
            player.fallStop();
            player.jumpSpeed = heavyJumpSpeed * boost;
            boost = 1;
        };
    }

    // red platform
    if (type === 2) {
        thisPlatform.firstColor = "#ff0000";
        thisPlatform.secondColor = "#5e0000";
        thisPlatform.onCollide = function() {
            hitBlueOrRed++;
            hitBlue = false;
            hitRed = true;
            if (hitBlueOrRed >= 2) { // jumped on red 2 times in a row
                Combo = true;
                score += redBonus * hitBlueOrRed;
            }
            player.fallStop();
            player.jumpSpeed = extremeJumpSpeed * boost;
            boost = 1;
        };
    }

    // yellow platform
    if (type == 3) {
        if (currentHeight > 1000) { // no more refills
            // black platform
            thisPlatform.firstColor = "Grey";
            thisPlatform.secondColor = "Black"
            thisPlatform.onCollide = function() {
                Combo = false; // no combo
                hitBlueOrRed = 0; 
                hitBlue = false;
                hitRed = false;
                player.fallStop();
            };
        } else {
            thisPlatform.firstColor = "Silver";
            thisPlatform.secondColor = "White";
            thisPlatform.onCollide = function() {
                Combo = false; // no combo
                hitBlueOrRed = 0; 
                hitBlue = false;
                hitRed = false;
                player.fallStop();
                player.jumpSpeed = weakJumpSpeed;
                boost = 1;
                if (boostleft < 3)
                    boostleft++;
            }
        }
    }

    thisPlatform.x = ~~x; // ~~ = Math.floor()
    thisPlatform.y = y;
    thisPlatform.type = type;

    thisPlatform.isMoving = ~~(Math.random() * 2); // true (1) or false (0)
    thisPlatform.direction = ~~(Math.random() * 2) ? -1 : 1; // 1 or -1

    thisPlatform.draw = function(x, y, type) {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        var gradient = ctx.createRadialGradient(thisPlatform.x + (platformWidth/2), thisPlatform.y + (platformHeight/2), 5, thisPlatform.x + (platformWidth/2), thisPlatform.y + (platformHeight/2), 45); // create radial color gradient
        gradient.addColorStop(0, thisPlatform.firstColor);
        gradient.addColorStop(1, thisPlatform.secondColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(thisPlatform.x, thisPlatform.y, platformWidth, platformHeight);
    }

    return thisPlatform;
}

var generatePlatforms = function() {
    var position = 0;
    var type;

    for (var i = 0; i < numPlatforms; i++) {
        type = getPlatformType();
        platforms[i] = new Platform(Math.random()*(width-platformWidth), position, type);
        if (position < height - platformHeight) // platform would be still on screen
            position += ~~(height / numPlatforms); // get next position
    }
}

var movePlatforms = function() {
    platforms.forEach(function(platform, ind) {
        platform.y += player.jumpSpeed; // move platforms
        if (platform.y > height) { // platform isn't on screen anymore
            var type = getPlatformType();
            platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type); // create new platform
        }
    })
}

var checkCollision = function() {  
    platforms.forEach(function(e, ind) {  
        if ((player.isFalling) && // falling
        (player.X <= e.x + platformWidth) && // character is left of right platform side
        (player.X + player.width >= e.x) && // character is right of left platform side 
        (player.Y + player.height >= e.y) && // bottom line of character is under/on top edge of platform
        (player.Y + player.height <= e.y + platformHeight)) { // bottom line of character is over/on bottom edge of platform
            e.onCollide(); // collision
        }  
    })  
}  

var getPlatformType = function() {
    var tmp = ~~(Math.random() * 100); // [0, 100)
    if (tmp < 88) return 0; // 88% chance black platform
    else if (tmp < 96) return 1; // 8% chance blue platform
    else if (tmp < 98) return 2; // 2% chance red platform
    else return 3; // 2% chance red platform
}

var updatePlatforms = function() {
    platforms.forEach(function(platform, index) {
        if (platform.isMoving) {
            if (platform.x < 0) { // platform touches left side
                platform.direction = 1; // change direction
            } else if (platform.x > width - platformWidth) { // platform touches right side
                platform.direction = -1; // change direction
            }
            platform.x += platform.direction * (index / 2) * ~~(currentHeight / 100); // move platform (use index to get different speeds)
        }
        platform.draw();
    });

    platformWidth = 80;
    // reduce platform width
    if (currentHeight > 100)
        platformWidth = 74;
    if (currentHeight > 200)
        platformWidth = 70;
    if (currentHeight > 300)
        platformWidth = 64;
    if (currentHeight > 400)
        platformWidth = 60;
    if (currentHeight > 500)
        platformWidth = 54;
    if (currentHeight > 600)
        platformWidth = 50;
    if (currentHeight > 700)
        platformWidth = 44;
    if (currentHeight > 800)
        platformWidth = 40;
    if (currentHeight > 900)
        platformWidth = 34;
    if (currentHeight > 950)
        platformWidth = 20;
    if (currentHeight > 1000)
        platformWidth = 12;
}


/************
* INTERFACE *
*************/

var updateHUD = function() {
    if (currentHeight >= heightChangeColor)
        ctx.fillStyle = "White";
    else
        ctx.fillStyle = "Black";
    ctx.fillText("SCORE: " + score, 8, 15);
    ctx.fillText("HIGHSCORE: " + highscore, 8, 33);
    ctx.fillText("BOOST (space) / AIRJUMP (up): " + boostleft, width - ctx.measureText("BOOST (space) / AIRJUMP (up): " + boostleft).width - 8, 15);

    if (Combo) { // display combo message
        ctx.font = "bold 14pt Arial"
        if (hitBlue) {
            ctx.fillText("COMBO +" + blueBonus*hitBlueOrRed, width - ctx.measureText("COMBO +" + blueBonus*hitBlueOrRed).width - 8, 33);
            if (hitBlueOrRed == 2) {
                ctx.fillText("Good!", width - ctx.measureText("Good!").width - 8, 51);
            } else if (hitBlueOrRed == 3) {
                ctx.fillText("Excellent!", width - ctx.measureText("Excellent!").width - 8, 51);
            } else if (hitBlueOrRed == 4) {
                ctx.fillText("IMPRESSIVE!", width - ctx.measureText("IMPRESSIVE!").width - 8, 51);
            } else if (hitBlueOrRed >= 5) {
                ctx.fillText("PERFECT!", width - ctx.measureText("PERFECT!").width - 8, 51);
            }
        } else if (hitRed) {
            ctx.fillText("COMBO +" + redBonus*hitBlueOrRed, width - ctx.measureText("COMBO +" + redBonus*hitBlueOrRed).width - 8, 33);
            if (hitBlueOrRed == 2) {
                ctx.fillText("Good!", width - ctx.measureText("Good!").width - 8, 51);
            } else if (hitBlueOrRed == 3) {
                ctx.fillText("Excellent!", width - ctx.measureText("Excellent!").width - 8, 51);
            } else if (hitBlueOrRed == 4) {
                ctx.fillText("IMPRESSIVE!", width - ctx.measureText("IMPRESSIVE!").width - 8, 51);
            } else if (hitBlueOrRed >= 5) {
                ctx.fillText("PERFECT!", width - ctx.measureText("PERFECT!").width - 8, 51);
            }
        }
    }
}

var gameOver = function() {
    gameover = true;
    highscoreReached = false;
    clearTimeout(gLoop);

    if (score >= highscore) {
        highscore = score;
        highscoreHeight = currentHeight;
    }

    setTimeout(function() {
        clear();
        generateCircles();
        if (currentHeight >= heightChangeColor)
            ctx.fillStyle = "White";
        else
            ctx.fillStyle = "Black";
        ctx.font = "bold 16pt Arial";
        ctx.fillText("GAME OVER", (width/2) - (ctx.measureText("GAME OVER").width/2), height/2 - 70);
        ctx.fillText("YOUR SCORE " + score, (width/2) - (ctx.measureText("YOUR SCORE " + score).width/2), height/2 - 30);
        ctx.fillText("YOUR HEIGHT " + ~~currentHeight, (width/2) - (ctx.measureText("YOUR HEIGHT: " + ~~currentHeight).width/2), height/2);
        ctx.fillText("HIGH SCORE " + highscore + " (HEIGHT " + ~~highscoreHeight + ")", (width/2) - (ctx.measureText("HIGH SCORE " + highscore + " (HEIGHT " + ~~highscoreHeight + ")").width/2), height/2 + 40);
        ctx.fillText("Press space to play again.", (width/2) - (ctx.measureText("Press space to play again.").width/2), height/2 + 80);
    }, 100);
}

var startScreen = function() {
    gameover = true;
    clear();
    generateCircles();
    ctx.fillStyle = "Black";
    ctx.font = "bold 16pt Arial";
    ctx.fillText("Press space to start the game.", (width/2) - (ctx.measureText("Press SPACE to start the game.").width/2), height/2);
}


/***********
* GAMELOOP *
************/

var gameLoop = function() {
    clear(); // set background
    drawCircles(); // draw circles
    player.update(); // check jump (and move platforms and circles), check fall, draw player
    updatePlatforms(); // maybe move platform horizontally, maybe change width, draw platform
    checkCollision(); // check if character hit platform
    updateHUD(); // update the heads-up display
    if (!gameover) {
        gLoop = setTimeout(gameLoop, 1000/50);
    }
}

startScreen();
