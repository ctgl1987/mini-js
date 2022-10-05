const LoaderScreen = BaseScreen.extends(function(){

    BaseScreen.call(this, 'loader');

    var color = 'white';
    var counter = new Counter(120);

    this.update = function(dt){

        counter.update();

        if(counter.ended())
        {
            ScreenManager.change("intro");
        }
    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("Cargando...", CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
    };
});
const IntroScreen = BaseScreen.extends(function(){

    BaseScreen.call(this, 'intro');

    var color = 'white';
    var counter = new Counter(120);

    this.update = function(dt){

        counter.update();

        if(counter.ended())
        {
            ScreenManager.change("test");
        }
    };

    this.input = function(evt, code){

    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("**Intro**", CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
    };
});

const TestScreen = BaseScreen.extends(function(){

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
});

const PauseScreen = BaseScreen.extends(function(){

    BaseScreen.call(this, 'pause');

    var color = Tools.randomColor();

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
});