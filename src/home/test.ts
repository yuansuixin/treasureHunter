const frames = {
    "frames": {
      "blob.png": {
        "frame": {
          "x": 55,
          "y": 2,
          "w": 32,
          "h": 24
        },
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {
          "x": 0,
          "y": 0,
          "w": 32,
          "h": 24
        },
        "sourceSize": {
          "w": 32,
          "h": 24
        },
        "pivot": {
          "x": 0.5,
          "y": 0.5
        }
      },
      "door.png": {
        "frame": {
          "x": 89,
          "y": 2,
          "w": 32,
          "h": 32
        },
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {
          "x": 0,
          "y": 0,
          "w": 32,
          "h": 32
        },
        "sourceSize": {
          "w": 32,
          "h": 32
        },
        "pivot": {
          "x": 0.5,
          "y": 0.5
        }
      },
      "dungeon.png": {
        "frame": {
          "x": 2,
          "y": 36,
          "w": 512,
          "h": 512
        },
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {
          "x": 0,
          "y": 0,
          "w": 512,
          "h": 512
        },
        "sourceSize": {
          "w": 512,
          "h": 512
        },
        "pivot": {
          "x": 0.5,
          "y": 0.5
        }
      },
      "explorer.png": {
        "frame": {
          "x": 2,
          "y": 2,
          "w": 21,
          "h": 32
        },
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {
          "x": 0,
          "y": 0,
          "w": 21,
          "h": 32
        },
        "sourceSize": {
          "w": 21,
          "h": 32
        },
        "pivot": {
          "x": 0.5,
          "y": 0.5
        }
      },
      "treasure.png": {
        "frame": {
          "x": 25,
          "y": 2,
          "w": 28,
          "h": 24
        },
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {
          "x": 0,
          "y": 0,
          "w": 28,
          "h": 24
        },
        "sourceSize": {
          "w": 28,
          "h": 24
        },
        "pivot": {
          "x": 0.5,
          "y": 0.5
        }
      }
    },
    "meta": {
      "app": "http://www.codeandweb.com/texturepacker",
      "version": "1.0",
      "image": "https://i.imgur.com/yxmphGW.png",
      "format": "RGBA8888",
      "size": {
        "w": 512,
        "h": 512
      },
      "antialias": true,
      "transparent": false,
      "backgroundColor": "0x000000",
      "scale": "1",
      "smartupdate": "$TexturePacker:SmartUpdate:51ede84c7a85e4d6aeb31a6020a20858:3923663e59fb40b578d66a492a2cda2d:9995f8b4db1ac3cb75651b1542df8ee2$"
    }
  }
  
  const app = new PIXI.Application({
    view: document.getElementById('main'),
    width: frames.meta.size.w,
    height: frames.meta.size.h,
    antialias: frames.meta.antialias,
    transparent: frames.meta.transparent,
    backgroundColor: frames.meta.backgroundColor,
  });
  
  
  const loader = new PIXI.Loader();
  loader
    .add('gameimg',frames.meta.image)
    .load((loader, resource)=> {
    init(resource);
  })
  
  const gameRun = new PIXI.Container();
  gameRun.visible = true;
  app.stage.addChild(gameRun);
  
  const gameStart = new PIXI.Container();
  gameStart.visible = false;
  app.stage.addChild(gameStart);
  
  const gameOver = new PIXI.Container();
  gameOver.visible = false;
  app.stage.addChild(gameOver);
  
  const hpContainer = new PIXI.Container();
  
  function gameSprite(item, resource) {
    const pixiRectangle = new PIXI.Rectangle(frames.frames[item].frame.x, frames.frames[item].frame.y, frames.frames[item].frame.w, frames.frames[item].frame.h);
    let newTex = new PIXI.Texture(resource.gameimg.texture, pixiRectangle);
    const sprite = new PIXI.Sprite(newTex);
    return sprite;
  }
  
  let dungeon, blob, treasure, door, explorer;
  let gameHP = 100;
  
  function init(resource) {
    // 載入地牢
    dungeon = gameSprite('dungeon.png', resource);
    gameStart.addChild(dungeon);
  
    // 載入怪物
    blob = gameSprite('blob.png', resource);
    blob.x = 350;
    blob.y = frames.meta.size.h / 2;
    blob.vx = 0;
    blob.vy = 0;
    gameStart.addChild(blob);
  
    // 寶箱
    treasure = gameSprite('treasure.png', resource);
    treasure.x = 400;
    treasure.y = frames.meta.size.h / 2;
    gameStart.addChild(treasure);
  
    // 逃出門
    door = gameSprite('door.png', resource);
    door.x = 50;
    door.y = 0;
    gameStart.addChild(door);
  
    // 玩家
    explorer = gameSprite('explorer.png', resource);
    explorer.x = 50;
    explorer.y = frames.meta.size.h / 2;
    explorer.vx = 0;
    explorer.vy = 0;
    gameStart.addChild(explorer);
  
  
  
    HPstatus();
  
    const run = messages('按下 Enter 開始遊戲');
    run.x = frames.meta.size.w / 2 - run.width /2;
    run.y = frames.meta.size.h / 2 - run.height /2;
    gameRun.addChild(run);
  
    const over = messages('Game Over');
    over.x = frames.meta.size.w / 2 - over.width /2;
    over.y = frames.meta.size.h / 2 - over.height /2;
    gameOver.addChild(over);
  
    // 重新開始按鈕繪畫
    const resetBtn = new PIXI.Container();
    gameOver.addChild(resetBtn);
  
    let gameGraphics = new PIXI.Graphics();
    gameGraphics.beginFill(0x33BBFF);
    gameGraphics.drawRoundedRect(0, 0, 120, 50, 25);
    gameGraphics.endFill();
    gameGraphics.x = frames.meta.size.w / 2 - gameGraphics.width / 2;
    gameGraphics.y = frames.meta.size.h / 2 - gameGraphics.height / 2 + 60;
    resetBtn.addChild(gameGraphics);
  
    const resetText = new PIXI.Text('重新開始', {  // 改用變數傳入
      fontFamily: 'Microsoft JhengHei',
      fontSize: 16,
      fill: [0xFFFFFF],
      align: 'center'
    });
    resetText.x = frames.meta.size.w / 2 - resetText.width / 2;
    resetText.y = frames.meta.size.h / 2 - resetText.height / 2 + 60;
    resetBtn.addChild(resetText);
    // 設置互動
    resetBtn.interactive = true;
    resetBtn.buttonMode = true;
    
    resetBtn.click = gameReset;
    
    app.ticker.add((delta) => {
      gameLoop(delta);
    });
  }
  
  function gameReset() {
    // HP 回復
    gameHP = 100;
    // 玩家回歸初始位置
    explorer.x = 50;
    explorer.y = frames.meta.size.h / 2;
    // 寶箱回歸初始位置
    treasure.x = 400;
    treasure.y = frames.meta.size.h / 2;
    // 重新設置 Container 顯示
    gameRun.visible = true;
    gameStart.visible = false;
    gameOver.visible = false;
  }
  
  function gameLoop() {
    if(gameHP === 0) {
      gameStart.visible = false;
      gameOver.visible = true;
    }
  
    contain(explorer, {x: 28, y: 10, width: 488, height: 480})
    contain(blob, {x: 28, y: 10, width: 488, height: 480})
  
    if(boxesIntersect(explorer, blob)) {
      // 碰撞後扣除血量
      gameHP -= 20;
      // 碰撞後往後退避免一直扣血
      explorer.x -= 10;
    }
    // 重新調整血量
    hpContainer.hpStatus.width = gameHP;
  }
  
  function HPstatus() {
    let border = new PIXI.Graphics();
    border.beginFill(0x000000);
    border.drawRect(0, 0, 100, 10, 10);
    border.endFill();
    hpContainer.addChild(border);
  
    let borderFill = new PIXI.Graphics();
    borderFill.beginFill(0xFF0000);
    borderFill.drawRect(0, 0, 100, 10, 10);
    borderFill.endFill();
    hpContainer.addChild(borderFill);
    hpContainer.hpStatus = borderFill;
  
    hpContainer.x = 340;
    hpContainer.y = 10;
  
  
    gameStart.addChild(hpContainer);
  }
  
  function messages(text) {
    const style = new PIXI.TextStyle({
      fontFamily: 'Microsoft JhengHei', // 風格
      fontSize: 24, // 字體大小
      fill: [0xEEEE00,0x00ff99], // 填滿，若是陣列則可以漸層效果
      align: 'center', // 對齊
      stroke: '#000000', // 外框顏色
    });
    const messages = new PIXI.Text(text, style);
    return messages;
  }
  
  const body = document.querySelector('body');
  
  body.addEventListener('keydown',(e) => {
    switch(e.keyCode) {
      case 38:
      case 87:
        explorer.y -= 5;
        break;
      case 40:
      case 83:
        explorer.y += 5;
        break;
      case 37:
      case 65:
        explorer.x -= 5;
        break;
      case 39:
      case 68:
        explorer.x += 5;
        break;
      case 13:  
        if(gameHP > 0) {
          gameRun.visible = false;
          gameStart.visible = true;
        }
        break;
      default:
        break;
    }
  })
  
  function contain(sprite, container) {
    let collision = undefined;
    //Left
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = "left";
    }
    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = "top";
    }
    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = "right";
    }
    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = "bottom";
    }
    //Return the `collision` value
    return collision;
  }
  
  function boxesIntersect(a, b){
    var ab = a.getBounds();
    var bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
  }
  
  
  