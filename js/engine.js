//PROTO THINGS
Object.prototype.extends = function(child){

    child.prototype = this.prototype;
    child.prototype.constructor = child.constructor;

    return child;
};

Object.prototype.parentFrom = function(parent){

    console.log([parent, this]);
    this.prototype = new parent();
    this.prototype.constructor = this;
};

const Tools = {
    randomColor: function(){
        let len = 6;
        let output = '';
        for (let i = 0; i < len; ++i) {
            output += (Math.floor(Math.random() * 16)).toString(16);
        }
        return '#' + output;
    },
    keepInside: function(area, target){
        //left
        if(target.x < area.x) target.x = area.x;
        //top
        if(target.y < area.y) target.y = area.y;
        //right
        if(target.right() > area.right())
        {
            target.x = area.right() - target.width;
        }
        //bottom
        if(target.bottom() > area.bottom()) target.y = area.bottom() - target.height;
    },
    clamp: function(num, min, max){
        return Math.min(Math.max(num, min), max);
    },
    toZero: function(num, limit){
        return Math.abs(num) < limit ? 0 : num;
    },
    getRandomInt: function(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    collision: function(rect1, rect2){
        return (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y);
    },
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
        },
        strokeRect: function(x, y, w, h, c){
            _ctx.strokeStyle = c || 'black';
            _ctx.strokeRect(x, y, w, h);
        },
        fillRect: function(x, y, w, h, c){
            _ctx.fillStyle = c || 'black';
            _ctx.fillRect(x, y, w, h);
        },
        fillText: function(text, x, y, opts){
            opts = opts || {};

            _ctx.fillStyle = opts.color || 'white';
            _ctx.font = (opts.style || 'normal') + " " + (opts.size || default_font_size)  + 'px ' + (opts.font || default_font_family);
            _ctx.textAlign = opts.align || 'left';
            _ctx.textBaseline = opts.valign || 'top';
            _ctx.fillText(text, x, y);
        },
        drawImage: function(img, sx, sy, sw, sh, dx, dy, dw, dh){
            _ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
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
        screens: function(){
            return _screens;
        },
    };
}());

const ImageManager = (function(){

    var _list = [];
    var images = {};
    var total = 0;
    var count = 0;

    var base_path = "";

    var _callback = null;

    function run()
    {
        total = _list.length;

        _callback && _callback(count, total);

        _list.forEach((i) => {

            let img = new Image();

            img.onload = function(){

                images[i.name] = img;
                count++;
                // console.log(i.name + " loaded");
                _callback && _callback(count, total);
            };

            img.src = base_path + i.src;
        });
    }

    return {
        path: function(p){
            base_path = p;
        },
        add: function(props){
            var temp = Array.isArray(props) ? props : [props];

            _list = [].concat(_list, temp);            
        },
        load: function(callback){
            _callback = callback;

            run();
        },
        get: function(name){
            return images[name] ? images[name] : null;
        },
    };
}());

//OBJECTS
function BaseScreen(name){

    this.name = name;

    this.enter = function(){};
    this.leave = function(){};

    this.pause = function(){};
    this.resume = function(){};

    this.input = function(evt, code){};
    this.update = function(dt){};
    this.render = function(){};
}

function Counter(max){
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
}

function Sprite(image, fps, frameWidth, frameHeight){

    var counter = 0;
    var maxFrameX = Math.round(image.width / frameWidth);

    this.image = image;

    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    this.frameX = 0;

    this.update = function(dt){

        counter += dt;

        if(counter >= fps)
        {
            counter = 0;

            this.frameX++;

            if(this.frameX >= maxFrameX)
            {
                this.frameX = 0;
            }
        }
    };
}