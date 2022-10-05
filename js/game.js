var canvas = null;
var ctx = null;


const CONFIG = {
    GAME_WIDTH: 640,
    GAME_HEIGHT: 480,
};

const Game = function(props){

    props = props || {};
    
    this.run = function(){

        //init canvas
        canvas = document.querySelector("#game_canvas");
        canvas.width = CONFIG.GAME_WIDTH;
        canvas.height = CONFIG.GAME_HEIGHT;

        //context
        ctx = canvas.getContext("2d");

        //display
        DisplayManager.init(ctx);

        //keyboard
        KeyboardManager.init((evt, code) => {
            ScreenManager.input(evt, code);
        });

        //screens
        ScreenManager.add(new LoaderScreen());
        ScreenManager.add(new TestScreen());

        var engine = new Engine();

        engine.onTick((dt) => {
            ScreenManager.update(dt);
            ScreenManager.render();
        });

        engine.run();

        ScreenManager.change("loader");
    }
};