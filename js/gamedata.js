const LoaderScreen = function(){

    BaseScreen.call(this, 'loader');

    var color = 'white';

    var count = 0;
    var total = 0;

    ImageManager.add([
        {name:'player', src: 'images/player.png'},
        {name:'bg', src: 'images/background_single.png'},
        {name:'enemy_1', src: 'images/enemy_1.png'},
    ]);

    ImageManager.load((c, t) => {
        count = c;
        total = t;
    });

    this.update = function(dt){

        if(count == total)
        {
            ScreenManager.change("play");
        }
    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("Cargando...", CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
        DisplayManager.fillText(`${count} of ${total}`, CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2 + 40, {color: color, align: 'center', size: 20});
    };
};

const IntroScreen = function(next){

    BaseScreen.call(this, 'intro');

    var color = 'white';
    var counter = new Counter(120);

    this.update = function(dt){

        counter.update();

        if(counter.ended())
        {
            ScreenManager.change(next);
        }
    };

    this.input = function(evt, code){

    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("**Intro**", CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
    };
};

const TestScreen = function(){

    BaseScreen.call(this, 'test');

    var color = Tools.randomColor();

    this.input = function(evt, code){
        if(evt == 'keydown')
        {
            if(code == 'Space')
            {
                color = Tools.randomColor();
            }

            if(code == 'KeyP')
            {
                console.log(this.name + ": KeyP!");
            }

            if(code == 'Escape')
            {
                ScreenManager.push('pause');
            }
        }
    };

    this.pause = function(){
        console.log("paused: " + this.name);
    };

    this.resume = function(){
        console.log("resume: " + this.name);
    };

    this.update = function(dt){
        color = Tools.randomColor();
    }

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("HOLA MUNDO!!!", 0, 0, {color: color, size: 20});
    };
};

const PauseScreen = function(){

    BaseScreen.call(this, 'pause');

    var color = 'yellow';

    this.input = function(evt, code){
        if(evt == 'keydown')
        {
            if(code == 'Escape')
            {
                ScreenManager.pop();
            }
        }
    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'rgba(10,10,10, 0.5)');
        DisplayManager.fillText("**PAUSEEEE**", CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
    };
};

const GameOverScreen = function(){

    BaseScreen.call(this, 'gameover');

    var color = 'red';

    this.input = function(evt, code){
        if(evt == 'keydown')
        {
            if(code == 'Enter')
            {
                ScreenManager.change("play");
            }
        }
    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'rgba(10,10,10, 0.5)');
        DisplayManager.fillText("**GAME OVER**", CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
    };
};

//things for PlayScreen

const GRAVITY = 1.5;
const FRICTION = 0.8;
const JUMP_FORCE = 25;

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 3;

const Objects = {};

const PlayerState = {
    Jumping: 'jumping',
    Falling: 'falling',
    Ground: 'ground',
};

const GameData = {
    score: 0
};

Objects.GameObject = function(){

    this.type = 'object';

    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;

    this.width = 32;
    this.height = 32;

    this.color = 'white';

    this.dead = false;

    this.right = function(){
        return this.x + this.width;
    };

    this.bottom = function(){
        return this.y + this.height;
    };

    this.centerX = function(){
        return this.x + (this.width / 2);
    };
    this.centerY = function(){
        return this.y + (this.height / 2);
    };

    this.input = function(evt, code){};
    this.update = function(dt){};
    this.render = function(){
        DisplayManager.fillRect(this.x, this.y, this.width, this.height, this.color);
    };
};

Objects.World = function(x, y, width, height){

    Objects.GameObject.call(this);

    this.type = 'world';

    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;
};

Objects.Player = function(world, x, y, width, height, sprite){

    Objects.GameObject.call(this);

    this.type = 'player';

    this.world = world;

    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.sprite = sprite;

    this.speed = PLAYER_SPEED;

    this.frameX = 0;
    this.frameY = 0;

    this.update = function(dt){

        fire_timer++;

        this.x += this.vx;
        this.y += this.vy;

        this.x = parseInt(this.x);
        this.y = parseInt(this.y);

        this.vx *= FRICTION;
        this.vy += GRAVITY;

        this.vx = Tools.toZero(this.vx, 0.001);

        Tools.keepInside(this.world, this);

        this.vy = Tools.clamp(this.vy, -JUMP_FORCE, 20);

        if(this.vy > 0)
        {
            this.state = PlayerState.Falling;
            this.color = 'orange';
        }

        if(this.bottom() == this.world.bottom())
        {
            this.state = PlayerState.Ground;
            this.vy = 0;
            this.color = 'green';
            this.frameY = 0;
        }

        this.sprite.update(dt);
    };

    this.render = function(){

        DisplayManager.fillText(this.state, this.centerX(), this.y - 20, {color: 'black', align: 'center', style: 'bold'});

        DisplayManager.strokeRect(this.x, this.y, this.width, this.height, 'white');
        
        if(this.sprite)
        {
            DisplayManager.drawImage(this.sprite.image, this.sprite.frameX * this.sprite.frameWidth, this.frameY * this.sprite.frameHeight, this.sprite.frameWidth, this.sprite.frameHeight, this.x, this.y, this.width, this.height);
        }
    };

    //custom
    this.state = PlayerState.Ground;

    this.jump = function(){

        if(this.state == PlayerState.Ground)
        {
            this.vy -= JUMP_FORCE;
            this.state = PlayerState.Jumping;
            this.color = 'blue';
            this.frameY = 1;
        }
    };

    let fire_timer = 0;
    let fire_rate = 50;

    this.fire = function(){

        if(fire_timer >= fire_rate)
        {
            var p = new Objects.Projectile(this.right(), this.centerY(), 20, 20, null, this);
            p.color = 'yellow';
            fire_timer = 0;
            return p;
        }
    };
};

Objects.Enemy = function(world, x, y, width, height, sprite){

    Objects.GameObject.call(this);

    this.type = 'enemy';

    this.world = world;

    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.sprite = sprite;

    this.speed = -ENEMY_SPEED;

    this.frameX = 0;
    this.frameY = 0;

    this.update = function(dt){
        
        this.vx = this.speed;
        
        this.x += this.vx;

        this.sprite.update(dt);

        if(this.right() < world.x)
        {
            this.dead = true;
        }
    };

    this.render = function(){

        DisplayManager.strokeRect(this.x, this.y, this.width, this.height, 'white');

        if(this.sprite)
        {
            DisplayManager.drawImage(this.sprite.image, this.sprite.frameX * this.sprite.frameWidth, this.frameY * this.sprite.frameHeight, this.sprite.frameWidth, this.sprite.frameHeight, this.x, this.y, this.width, this.height);
        }
    };

};

Objects.Background = function(x, y, width, height, image){

    Objects.GameObject.call(this);

    this.type = 'bg';

    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.width = width;
    this.height = height;

    this.image = image;

    this.speed = 2;

    this.update = function(){

        this.vx = this.speed;

        this.x += this.vx;

        if(this.x > this.image.width)
        {
            this.x = x;
        }
    };

    this.render = function(){

        if(this.image)
        {
            DisplayManager.drawImage(this.image, this.x, this.y, this.width, CONFIG.GAME_HEIGHT, this.x, this.y, this.width, this.height);

            DisplayManager.drawImage(this.image, this.x - this.image.width, this.y, this.width, CONFIG.GAME_HEIGHT, this.x, this.y, this.width, this.height);
        }
    };
};

Objects.Projectile = function(x, y, width, height, sprite, owner){
    
    Objects.GameObject.call(this);

    this.type = 'bg';

    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.width = width;
    this.height = height;

    this.sprite = sprite;

    this.owner = owner;

    this.speed = 20;

    this.update = function(dt){
        
        this.vx = this.speed;
        
        this.x += this.vx;

        this.sprite && this.sprite.update(dt);
    };

    this.render = function(){

        if(this.color)
        {
            DisplayManager.fillRect(this.x, this.y, this.width, this.height, this.color);
        }

        if(this.sprite)
        {
            DisplayManager.drawImage(this.sprite.image, this.sprite.frameX * this.sprite.frameWidth, this.frameY * this.sprite.frameHeight, this.sprite.frameWidth, this.sprite.frameHeight, this.x, this.y, this.width, this.height);
        }
    };
};

const PlayScreen = function(){

    BaseScreen.call(this, 'play');

    let world = null;
    let background = null;
    let player = null;

    let enemies = [];
    let projectiles = [];

    this.enter = function(){

        enemies = [];

        projectiles = [];

        GameData.score = 0;

        world = new Objects.World(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        background = new Objects.Background(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, ImageManager.get("bg"));

        let playerSprite = new Sprite(ImageManager.get("player"), 30, 200, 200);

        player = new Objects.Player(world, 0, 0, 96, 96, playerSprite);
    };

    this.input = function(evt, code){

        if(evt == 'keydown')
        {
            if(code == 'Escape')
            {
                ScreenManager.push('pause');
            }

            if(code == 'Space')
            {
                player.jump();
            }

            if(code == 'ArrowDown')
            {
                var p = player.fire();
                if(p)
                {
                    projectiles.push(p);
                }
            }
        }
    };

    this.update = function(dt){

        if(KeyboardManager.isDown("ArrowRight"))
        {
            player.vx = player.speed;
        }

        if(KeyboardManager.isDown("ArrowLeft"))
        {
            player.vx = -player.speed;
        }

        player.update(dt);

        background.update(dt);

        this.spawnEnemy();

        projectiles.forEach((p) => {
                
            //p.update(dt);
        });

        enemies.forEach((e) => {

            projectiles.forEach((p) => {

                if(Tools.collision(p, e))
                {
                    e.dead = true;
                    p.dead = true;
                }
            });

            e.update(dt);

            if(e.dead)
            {
                GameData.score++;
            }else{

                if(Tools.collision(e, player))
                {
                    ScreenManager.push("gameover");
                }
            }
        });

        enemies = enemies.filter((e) => { return !e.dead;});
        projectiles = projectiles.filter((e) => { return !e.dead;});
    };

    this.render = function(){

        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');

        background.render();

        player.render();

        enemies.forEach((e) => {
            e.render();
        });

        projectiles.forEach((p) => {
            p.render();
        });

        this.renderScore();
    };

    //CUSTOM

    var enemy_timer = 0;
    var enemy_rate = 100;

    this.spawnEnemy = function(){

        enemy_timer++;

        if(enemy_timer >= enemy_rate)
        {
            var enemy_width = 84;
            var enemy_height = 64;
            let enemy_sprite = new Sprite(ImageManager.get("enemy_1"), 30, 160, 119);
            let pos_y = Tools.getRandomInt(0, CONFIG.GAME_HEIGHT - enemy_height);
            var e = new Objects.Enemy(world, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT - enemy_height, enemy_width, enemy_height, enemy_sprite);

            enemies.push(e);

            enemy_timer = 0;
        }
    };

    this.renderScore = function(){
        DisplayManager.fillText("Score: " + GameData.score, 10, 10, {color: 'black', size: 20, style: 'bold'});
        DisplayManager.fillText("Score: " + GameData.score, 12, 12, {color: 'white', size: 20, style: 'bold'});
    };
}