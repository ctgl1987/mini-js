const LoaderScreen = BaseScreen.extends(function(){

    BaseScreen.call(this, 'loader');

    var color = 'white';
    var dots = '';
    var counter = new Counter(120);

    this.update = function(dt){

        counter.update();

        // if(counter.val() % 20 == 0)
        // {
        //     if(dots.length == 3)
        //     {
        //         dots = '';
        //     }
        //     dots +=  '.';
        // }

        if(counter.ended())
        {
            ScreenManager.change("test");
        }
    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("Cargando" + dots, CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, {color: color, align: 'center', valign: 'middle', size: 60});
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
        }
    };

    this.render = function(){
        DisplayManager.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'black');
        DisplayManager.fillText("HOLA MUNDO!!!", 0, 0, {color: 'white', size: 20});
    };
});