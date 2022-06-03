let frames = 0

localStorage.setItem("ranking", JSON.stringify(
  {first: -1, second: -1, third: -1}
));

const sprites = new Image();
sprites.src = './sprites.png';

const hitSound = new Audio();
hitSound.src = './effects/hit.wav'

const jumpSound = new Audio();
jumpSound.src = './effects/jump.wav'

const fallSound = new Audio();
fallSound.src = './effects/fall.wav'

const addScoreSound = new Audio();
addScoreSound.src = './effects/addScore.wav'

const canvas = document.querySelector('#game-canvas')
const context = canvas.getContext('2d');

let flappyBird = {
  spritesY: [ 
    0, 26, 52, 26
  ],
  spriteX: 0,
  spriteY: 0,
  width: 34,
  height: 24,
  x: 60,
  y: 120,
  speed: 0,
  gravity: 0.2,
  jumpValue: 4.6,
  spriteIndex: 0,
  draw() {
    const spriteY = this.spritesY[this.spriteIndex]
    if (frames % 15 == 0) {
      this.spriteIndex = (this.spriteIndex + 1) % this.spritesY.length
    }
    if (this.speed > 6 && this.speed < 6.4) {
      fallSound.play();
      fallSound.volume = 0.2;
    }

    context.drawImage(
      sprites,
      this.spriteX, spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      this.x, this.y, //Posição
      this.width, this.height, 
    )
  },
  jump() {
    jumpSound.play()
    jumpSound.currentTime = 0
    flappyBird.speed = -flappyBird.jumpValue;
  },
  update() {
    if ((flappyBird.y + flappyBird.height) < ground.y) {
      this.speed = this.speed + this.gravity
      flappyBird.y = flappyBird.y + this.speed
    } else {
      hitSound.play();
      ground = Object.assign({}, backups.groundBackup)
      changeScreen(Screens.afterCollision);
    }
  }
}

const pipes = {
  under: {
    spriteX: 0,
    spriteY: 169,
  },
  over: {
    spriteX: 52,
    spriteY: 169,
  },
  width: 52,
  height: 400,

  draw() {
    this.pairs.forEach(pair => {
    const pipeLocation = pair.y;
    
    const pipeSpacing = 110;

    pair.underPipe = {
      x: pair.x,
      y: this.height + pipeLocation + pipeSpacing,
    }

    context.drawImage(
      sprites,
      this.under.spriteX, this.under.spriteY,
      this.width, this.height,
      pair.underPipe.x, pair.underPipe.y,
      this.width, this.height
    )

    pair.overPipe = {
      x: pair.x,
      y: pipeLocation,
    }


    context.drawImage(
      sprites,
      this.over.spriteX, this.over.spriteY,
      this.width, this.height,
      pair.overPipe.x, pair.overPipe.y,
      this.width, this.height      
    )

    });
  },

  pairs: [],

  update() {
    if (frames % 120 == 0 ) {
      this.pairs.push({
        x: canvas.width,
        y: Math.floor(Math.random() * (-150 + 300) + -300),
      })
    }

    this.pairs.forEach(pair => {
      pair.x = pair.x - 2;

      if (flappyBird.x + flappyBird.width >= pair.x && flappyBird.x <= pair.x + this.width && (flappyBird.y <= pair.overPipe.y + this.height || flappyBird.y + flappyBird.height >= pair.underPipe.y)) {
        hitSound.play();
        changeScreen(Screens.afterCollision);
      }

      if (pair.x + this.width <= 0) {
        this.pairs.shift()
      }
    })
  }
}

const getReady = {
  spriteX: 134,
  spriteY: 0,
  width: 174,
  height: 152,
  x: canvas.width / 2 - 174 / 2,
  y: 50,
  draw() {
    context.drawImage(
      sprites,
      this.spriteX, this.spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      this.x, this.y, //Posição inicial
      this.width, this.height, 
    )
  }
}

let scoreBoard = {
  score: 0,
  lastPipe: null,
  draw() {
    context.font = '25px "Press Start 2P"';
    context.textAlign = 'right'
    context.fillStyle = 'white'
    context.fillText(this.score, canvas.width - 10, 40)
  },
  update() {
    if (pipes.pairs.length>0 && flappyBird.x > pipes.pairs[0].x) {
      if (pipes.pairs[0] !== this.lastPipe) {
        addScoreSound.volume = 0.8
        addScoreSound.play()
        this.score = this.score + 1
        this.lastPipe = pipes.pairs[0]
      } 
    };
  }
};

const gameOver = {
  spriteX: 134,
  spriteY: 153,
  width: 226,
  height: 200,
  x: canvas.width / 2 - 226 / 2,
  y: 50,
  draw() {
    context.drawImage(
      sprites,
      this.spriteX, this.spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      this.x, this.y, //Posição inicial
      this.width, this.height, 
    )
  }
}

const medal = {
  sprites: {
    gold: {spriteX: 0, spriteY: 124},
    silver: {spriteX: 48, spriteY: 78},
    bronze: {spriteX: 48, spriteY: 124},
    default: {spriteX: 0, spriteY: 78},
  },
  spriteX: 0,
  spriteY: 78,
  width: 44,
  height: 44,
  x: canvas.width / 4 - 8,
  y: 138,
  draw() {
    context.drawImage(
      sprites,
      this.spriteX, this.spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      this.x, this.y, //Posição inicial
      this.width, this.height, 
    )
  }
}

const finalScore = {
  bestScore: 0,
  draw() {
    context.font = '15px "Press Start 2P"';
    context.textAlign = 'right'
    context.fillStyle = 'white'
    context.fillText(scoreBoard.score, canvas.width*3/4 + 12, 143)

    context.font = '15px "Press Start 2P"';
    context.textAlign = 'right'
    context.fillStyle = 'white'
    context.fillText(this.bestScore, canvas.width*3/4 + 12, 184)
  },

  setRanking() {
    let ranking = JSON.parse(localStorage.getItem('ranking'))
    if (scoreBoard.score > ranking.first) {
      ranking.first = scoreBoard.score
      medal.spriteX = medal.sprites.gold.spriteX
      medal.spriteY = medal.sprites.gold.spriteY
    } else if (scoreBoard.score > ranking.second) {
      ranking.second = scoreBoard.score
      medal.spriteX = medal.sprites.silver.spriteX
      medal.spriteY = medal.sprites.silver.spriteY
    } else if (scoreBoard.score > ranking.third) {
      ranking.third = scoreBoard.score
      medal.spriteX = medal.sprites.bronze.spriteX
      medal.spriteY = medal.sprites.bronze.spriteY
    } else {
      medal.spriteX = medal.sprites.default.spriteX
      medal.spriteY = medal.sprites.default.spriteY
    }
    this.bestScore = ranking.first
    localStorage.setItem('ranking', JSON.stringify(ranking))
  }
}

let ground = {
  spriteX: 0,
  spriteY: 610,
  width: 224,
  height: 112,
  x: 0,
  y: canvas.height - 112,
  draw() {
    context.drawImage(
      sprites,
      this.spriteX, this.spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      this.x, this.y, //Posição inicial
      canvas.width, this.height, 
    );
    context.drawImage(
      sprites,
      this.spriteX, this.spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      canvas.width + this.x, this.y, //Posição inicial
      canvas.width, this.height, 
    );
  },
  update() {
    this.x = (this.x - 1) % canvas.width
  }
}

const background = {
  spriteX: 390,
  spriteY: 0,
  width: 275,
  height: 204,
  x: 0,
  y: canvas.height - 204,
  draw() {
    context.fillStyle = '#71C5CF';
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.drawImage(
      sprites,
      this.spriteX, this.spriteY,  //Início X e Y
      this.width, this.height, // Se estica quanto (Tamanho do recorte)
      this.x, this.y, //Posição inicial
      canvas.width, this.height, 
    )
  }
}

const Screens = {
  start: {
    startProps() {
      flappyBird = Object.assign({}, backups.flappyBirdBackup);
      pipes.pairs = []
    },

    draw() {
      background.draw();
      ground.draw()
      getReady.draw();
      flappyBird.draw();
    },
    update() {
      ground.update();
    },

    click() {
      changeScreen(Screens.inGame)
    }
  },

  inGame: {
    startProps() {
      scoreBoard = Object.assign({}, backups.scoreBoardBackup)
    },

    draw() {
      background.draw();
      pipes.draw();
      ground.draw();
      scoreBoard.draw();
      flappyBird.draw();
    },
    update() {
      ground.update();
      flappyBird.update();
      scoreBoard.update();
      pipes.update();
    },
    click() {
      flappyBird.jump();
    }
  },

  afterCollision: {
    startProps() {
      finalScore.setRanking();
    },

    draw() {
      gameOver.draw();
      medal.draw();
      finalScore.draw();
    },
    update() {
      return
    },
    click() {
      changeScreen(Screens.start)
    }
  }
}

const backups = {
  flappyBirdBackup: Object.assign({}, flappyBird),
  groundBackup: Object.assign({}, ground),
  scoreBoardBackup: Object.assign({}, scoreBoard)
}

function changeScreen(newScreen) {
  activeScreen = newScreen

  if(activeScreen.startProps) {
    activeScreen.startProps()
  }
}

let activeScreen = Screens.start

function loop() {
  activeScreen.draw();
  activeScreen.update();
  requestAnimationFrame(loop);
  frames = frames + 1;
}

canvas.addEventListener('click',
  () => {
    if(activeScreen.click) {
      activeScreen.click()
    }
  }
)

loop()