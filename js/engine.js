Object.prototype.extends = function(child){
    child.prototype = parent.prototype;

    return child;
};

const Tools = {
    randomColor: function(){
        let len = 6;
        let output = '';
        for (let i = 0; i < len; ++i) {
            output += (Math.floor(Math.random() * 16)).toString(16);
        }
        return '#' + output;
    }
};

//ENGINE
const Engine = function(){

    var ticks = [];

    this.onTick = function(callback){
        ticks.push(callback);
    };

    var last = 0;

    var fps = 0;

    function loop(t){

        var now = 0;

        if(last != 0)
        {
            now = t - last;

            fps = (1000 / now).toFixed(2);
        }
        
        requestAnimationFrame(loop);

        ticks.forEach((cb) => {
            cb(now);
        });

        last = t;
    }

    this.fps = function(){
        return fps;
    };

    this.run = function(){
        requestAnimationFrame(loop);
    };
};


//MANAGERS
const KeyboardManager = (function(){

    var _keys = {};

    return {
        init: function(handler){
            document.addEventListener("keydown", function(e){
                if(!e.repeat)
                {
                    _keys[e.code] = true;
                    handler && handler(e.type, e.code);
                }
            });

            document.addEventListener("keyup", function(e){
                delete _keys[e.code];

                handler && handler(e.type, e.code);
            });
        },
        isDown: function(code){
            return _keys[code] ? true: false;
        },
    };
    
}());

const DisplayManager = (function(){

    var _ctx = null;

    var default_font_family = 'sans-serif';
    var default_font_size = 14;

    return {
        init: function(ctx){
            _ctx = ctx;
            // _ctx.textBaseline = 'top';
            // _ctx.font = default_font_size + 'px ' + default_font_family;
        },
        fillRect: function(x, y, w, h, c){
            _ctx.fillStyle = c || 'black';
            _ctx.fillRect(x, y, w, h);
        },
        fillText: function(text, x, y, opts){
            opts = opts || {};

            _ctx.fillStyle = opts.color || 'white';
            _ctx.font = (opts.size || default_font_size)  + 'px ' + (opts.font || default_font_family);
            _ctx.textAlign = opts.align || 'left';
            _ctx.textBaseline = opts.valign || 'top';
            _ctx.fillText(text, x, y);

        },
    };

}());

const ScreenManager = (function(){

    var stack = [];

    var _screens = [];

    return {
        add: function(screen){

            _screens[screen.name] = screen;

        },
        /**
         * Replace all screens into Stack
         * 
         * @param {String} name 
         * @returns 
         */
        change: function(name){
            if(!_screens[name])
            {
                console.error("no scene " + name);
                return;
            }

            stack.forEach((s) => {
                s.leave();
            });

            var next = _screens[name];

            next.enter();

            stack = [next];
        },
        /**
         * Append new Screen to Stack
         * 
         * @param {String} name 
         * @returns 
         */
        push: function(name){
            
            if(!_screens[name])
            {
                console.error("no scene " + name);
                return;
            }

            this.current().pause();

            var next = _screens[name];

            next.enter();

            stack.unshift(next);
        },
        pop: function(){
            if(stack.length < 2)
            {
                console.error("can't pop!");
                return;
            }

            var prev = stack.shift();
            console.log(prev, stack);

            prev.leave();

            this.current().resume();
        },
        input: function(evt, code){
            this.current() && this.current().input(evt, code);
        },
        update: function(dt){
            this.current() && this.current().update(dt);
        },
        render: function(){
            var tempStack = stack.slice().reverse();
            tempStack.forEach((s) => {
                s.render();
            });
        },
        current: function(){
            return stack[0];
        },
        all: function(){
            return stack;
        },
    };
}());

//OBJECTS
const BaseScreen = function(name){

    this.name = name;

    this.enter = function(){};
    this.leave = function(){};

    this.pause = function(){};
    this.resume = function(){};

    this.input = function(evt, code){};
    this.update = function(dt){};
    this.render = function(){};

    
};

const Counter = function(max){
    var v = max;

    this.val = function(){
        return v;
    };
    
    this.update = function(){
        v--;
    };

    this.ended = function(){
        return v <= 0;
    };

    this.reset = function(){
        v = max;
    };
};