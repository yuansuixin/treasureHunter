/** 寻宝猎人
 * 游戏需求： 使用键盘上的箭头键帮助探险家找到宝藏并将其带到出口

怪物在地牢壁之间向下移动，如果探险家触碰到怪物则变成半透明，并且右上角的生命值会减少
如果所有生命值都用光了，会显示 You Lost!
如果探险家带着宝藏到达出口，会显示 You Won!

pixi.js@7.1

 */
import { defineComponent, onMounted, ref, reactive } from "vue";
import { Application, Assets, Sprite, Text, TextStyle, Container, Graphics,Texture} from 'pixi.js';


export default defineComponent({

    setup(props, ctx) {
        let app: Application;
        // dom
        const canvasWrapRef = ref();
        // 游戏容器
        let gameScene: Container;
        let gameOverScene: any;  // 游戏结束容器
        let healthBar: any;  // 生命条
        let gameRun:any

        // 游戏需要的精灵
        const sprites: { [key: string]: Sprite } = {};

        // 可以移动的区域
        const gameContainer = {
            x: 28, // 墙体厚度
            y: 10,
            width: 488,
            height: 480,
        };
        const blood = 128;// 血条宽度

        let blobHeight = 0; // 一只怪物的高度
        let blobs: any = ref([])
        const numberOfBlobs = 8// 怪物的总数量

        let tip: Text;

        /**
         * @description: 生成随机整数
         * @param {*} min
         * @param {*} max
         * @return {*}
         */
        const randomInt = (min:number, max:number):number => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /**
         * @description: 初始化游戏
         * @return {*}
         */
        const initGame =async () => {
            await Assets.load('/src/assets/treasureHunter.json').then(res => {
                Object.keys(res.textures).forEach(key => {
                    const sprite = new Sprite(res.textures[key]);
                    // sprite.zIndex = 2;
                    sprites[key] = sprite;
                    gameScene.addChild(sprite);
                });
                sprites['dungeon.png'].zIndex = -1;
                sprites['explorer.png'].position.set(60, 100);

                blobHeight = sprites['blob.png'].height
                sprites['blob.png'].position.set(-128, 10);

                sprites['door.png'].position.set(30, 0);    // 门

                let x = randomInt(gameContainer.x, 480)
                let y = randomInt(200, 470)
                sprites['treasure.png'].position.set(x, y)
            });


            // 初始化多只怪物
            let spacing = 48, xOffset = 100;
            for (let i = 0; i < numberOfBlobs; i++) {
                // const blob = new Sprite(res.textures['blob.png']);
                const blob: any = Sprite.from('/src/assets/blob.png');
                let y = randomInt(gameContainer.y, app.stage.height - blobHeight - gameContainer.y);
                blob.x = spacing * i + xOffset;;
                blob.y = y;
                blob.vy = 3
                blobs.value.push(blob);
                gameScene.addChild(blob);
            }


            // 初始化生命条
            healthBar = new Container();
            // healthBar.value.position.set(app.stage.width - 170, 4);
            healthBar.position.set(350, 4);
            gameScene.addChild(healthBar);

            // 创建生命条背景矩形
            const innerBar = new Graphics();
            innerBar.beginFill(0x000000);
            innerBar.drawRoundedRect(0, 0, blood, 8, 0);
            innerBar.endFill();
            healthBar.addChild(innerBar);
            // 创建生命条血条
            const outerBar = new Graphics();
            outerBar.beginFill(0xff3300);
            outerBar.drawRoundedRect(0, 0, blood, 8, 0);
            outerBar.endFill();
            healthBar.addChild(outerBar);
            healthBar.outer = outerBar; // 将血条添加到容器上，方便操作

        }

        /**
         * @description: 游戏结束
         * @return {*}
         */
        const gameEnd = () => {
            gameScene.visible = false;
            // app!.renderer!.background = 0x000000;
            gameOverScene.visible = true;
        }

        /**
         * @description: 边界检测,以dungeon背景的大小为边界 减去自身的宽高减去背景图的边框厚度
         * @param {*} sprite
         * @param {*} container
         * @return {*}
         */
        const boundary = (sprite:Sprite, container:Container) => {

            let bound = ""; // 定义精灵抵达的边
            // 精灵抵达左边界
            if (sprite.x < container.x) {
                sprite.x = container.x;
                bound = "left";
            }
            // 精灵抵达右边界
            if (sprite.x + sprite.width > container.width) {
                sprite.x = container.width - sprite.width;
                bound = "right";
            }
            // 精灵抵达上边界
            if (sprite.y < container.y) {
                sprite.y = container.y;
                bound = "top";
            }
            // 精灵抵达下编辑
            if (sprite.y + sprite.height > container.height) {
                sprite.y = container.height - sprite.height;
                bound = "bottom";
            }

            return bound;
        }

        const keyState = new Map();
        const initEvent = () => {

            document.addEventListener('keydown', (e) => {
                keyState.set(e.code, true);
                e.preventDefault();
            });
            document.addEventListener('keyup', (e) => {
                // console.log('keyup', e);
                keyState.set(e.code, false);
                e.preventDefault();
            });
        }

        /**
         * @description: 检测碰撞
         * @param {*} moveSprite
         * @param {*} otherSprite
         * @return {*}
         */
        const hitTestRectangle = (moveSprite, otherSprite) => {
            // 定义所需变量
            let hit = false; // 是否碰撞
            // 寻找每个精灵的中心点
            moveSprite.centerX = moveSprite.x + moveSprite.width / 2; // 移动精灵水平中心点
            moveSprite.centerY = moveSprite.y + moveSprite.height / 2; // 移动精灵垂直中心点
            // (32,232)
            otherSprite.centerX = otherSprite.x + otherSprite.width / 2; // 矩形水平中心点
            otherSprite.centerY = otherSprite.y + otherSprite.height / 2; // 矩形垂直中心点
            // console.log(`(${otherSprite.rectangle.x},${otherSprite.rectangle.y})`);

            // 找出每个精灵的半高和半宽
            moveSprite.halfWidth = moveSprite.width / 2; // 移动精灵半宽
            moveSprite.halfHeight = moveSprite.height / 2; // 移动精灵半高
            otherSprite.halfWidth = otherSprite.width / 2; // 矩形半宽
            otherSprite.halfHeight = otherSprite.height / 2; // 矩形半高

            // 移动精灵和矩形之间的距离
            const gapX = moveSprite.centerX - otherSprite.centerX;
            const gapY = moveSprite.centerY - otherSprite.centerY;

            // 算出移动精灵和矩形半宽半高的总和
            const combineWidth = moveSprite.halfWidth + otherSprite.halfWidth;
            const combineHeight = moveSprite.halfHeight + otherSprite.halfHeight;
            // 检查x轴上是否有碰撞
            // 判断两个精灵中心点间的距离,是否小于精灵半宽和
            if (Math.abs(gapX) < combineWidth) {
                // 检查y轴是否有碰撞
                hit = Math.abs(gapY) < combineHeight;
            } else {
                hit = false;
            }
            return hit;
        }

        const loop = (delta:number) => {
            // if(healthBar.outer.width < 0) {
            //     gameScene.visible = false;
            //     gameOverScene.visible = true;
            //     return 
            //   }

            if (keyState.get('Enter')&&!gameScene.visible) {
                if(healthBar.outer.width > 0) {
                    gameRun.visible = false;
                    gameScene.visible = true;
                    return
                }
            }

            let moveSpeed = randomInt(1, 3);
            blobs.value.map(blob => {
                blob.y += moveSpeed
                // item.x = randomInt(0, app.stage.width -  blobHeight.value);
                let b = boundary(blob, gameContainer)
                if (b == 'bottom'|| b == 'top') {
                    blob.y = blobHeight
                    // item.y = item.y-moveSpeed-blobHeight.value
                    // moveSpeed = -3
                }

                // 检测猎人是否碰到了怪物
                const isHit = hitTestRectangle(sprites['explorer.png'], blob);
                if (isHit) {
                    // 假如碰撞到怪物，猎人呈半透明，并且血条降低
                    sprites['explorer.png'].alpha = 0.5;
                    healthBar.outer.width -= 1;
                } else {
                    setTimeout(() => {
                        // 猎人离开后，半透明
                        sprites['explorer.png'].alpha = 1;
                    }, 200);
                }

                   // 如果生命条已经为空,则游戏失败
                if (healthBar.outer.width < 0) {
                    gameEnd(); // 游戏结束
                    tip.text = "You Lose!"; // 修改提示文案
                    healthBar.outer.width = 0; // 让血条停在0

                    // setTimeout(() => {
                    //     app.ticker.stop(); // 1秒后停止运行游戏
                    // }, 500);
                }

                // 判断探索者是否已经接触到宝盒
                const isTouch = hitTestRectangle(sprites['explorer.png'], sprites['treasure.png']);
                if (isTouch) {
                    // 让宝盒跟着探索者一同移动
                    sprites['treasure.png'].x = sprites['explorer.png'].x + 8;
                    sprites['treasure.png'].y = sprites['explorer.png'].y + 8;
                }


                // 判断宝盒子是否抵达了出口
                const isOut = hitTestRectangle(sprites['explorer.png'], sprites['door.png']);
                if (isOut&&isTouch) {
                    gameEnd();
                    tip.text = "You Win!!!";
                    // setTimeout(() => {
                    //     app.ticker.stop(); // 1秒后停止运行游戏
                    // }, 500);
                }

            })


            // 键盘按下 移动
            if (keyState.get('ArrowUp')) {
                boundary(sprites['explorer.png'], gameContainer)
                sprites['explorer.png'].position.y -= moveSpeed;
            }
            if (keyState.get('ArrowDown')) {
                boundary(sprites['explorer.png'], gameContainer)
                sprites['explorer.png'].position.y += moveSpeed;
            }
            if (keyState.get('ArrowLeft')) {
                boundary(sprites['explorer.png'], gameContainer)
                sprites['explorer.png'].position.x -= moveSpeed;
            }
            if (keyState.get('ArrowRight')) {
                boundary(sprites['explorer.png'], gameContainer)
                sprites['explorer.png'].position.x += moveSpeed;
            }
        }


        const init = async () => {
            app = new Application({
                width: window.innerWidth,
                height: window.innerHeight,
                antialias: true,
                // resolution: window.devicePixelRatio,       // default: 1      分辨率
                // forceCanvas: true,
                // backgroundColor: 0xaaaaaa,
                hello: true
            });

            // canvasWrapRef.value.appendChild(app.view);
            document?.getElementById('home')?.appendChild(app.view);


            // 游戏容器
            gameScene = new Container();
            gameScene.width = gameContainer.width;
            gameScene.height = gameContainer.height;

            app.stage.sortableChildren = true;  // 可以让zIndex生效
            gameScene.sortableChildren = true;

            app.stage.addChild(gameScene);

            gameRun = new Container();
            gameRun.visible = false;
            gameRun.width =  window.innerWidth
            gameRun.height = window.innerHeight
            app.stage.addChild(gameRun);

            const tipStyle: TextStyle = new TextStyle({
                fontFamily: "Futura",
                fontSize: 64,
                fill: "white",
            });

            const run = new Text('按下 Enter 開始遊戲',{
                fontFamily: "Futura",
                fontSize: 30,
                fill: "white",
            });
            run.x = 120;
            run.y = 150;
            gameRun.addChild(run);

            // const gameOver = new Container();
            // gameOver.visible = false;
            // app.stage.addChild(gameOver);

            // const over = new Text('Game Over',tipStyle);
            // over.x = 250;
            // over.y = 250;
            // gameOver.addChild(over);

              // 初始化游戏结束场景
              gameOverScene = new Container(); // 游戏结束场景容器
              gameOverScene.position.set(30, 250);
              app.stage.addChild(gameOverScene);
  
              tip = new Text("The End!", tipStyle);
              tip.x = 60;
              // tip.y = app.stage.height / 2 - 32;
              gameOverScene.visible = false; // 在游戏开始时，gameOverScene不应该被显示出来
              gameOverScene.addChild(tip);

            //   gameScene.visible = false


                // 重新開始按鈕繪畫
                const resetBtn = new Container();
                gameOverScene.addChild(resetBtn);
            
                let gameGraphics = new Graphics();
                gameGraphics.beginFill(0x33BBFF);
                gameGraphics.drawRoundedRect(0, 0, 120, 50, 25);
                gameGraphics.endFill();
                gameGraphics.x = 100;
                gameGraphics.y = 160;
                resetBtn.addChild(gameGraphics);
                resetBtn.zIndex = 5
            
                const resetText = new Text('重新開始', {  // 改用變數傳入
                    fontFamily: 'Microsoft JhengHei',
                    fontSize: 16,
                    fill: [0xFFFFFF],
                    align: 'center'
                });
                resetText.x = 120;
                resetText.y = 170;
                resetBtn.addChild(resetText);
                // 設置互動
                resetBtn.interactive = true;
                // resetBtn.buttonMode = true;
                
                resetBtn.on('click',gameReset); 

        }

        const gameReset = ()=>{            
            // 宝箱和人回到初始位置
            sprites['explorer.png'].position.set(60, 100);
            let x = randomInt(gameContainer.x, 480)
            let y = randomInt(200, 470)
            sprites['treasure.png'].position.set(x, y)
            // 血条恢复
            healthBar.outer.width = blood

            gameRun.visible = true;
            gameScene.visible = false;
            gameOverScene.visible = false;
        }
          

        onMounted(async () => {
            await init()
            await initGame()
            initEvent();
            // loop()
            app.ticker.add(loop);            
        })

        return {}
    }
})
