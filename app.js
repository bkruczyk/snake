var KEY = {
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFT: 37    
};

var Inputter = function() {
    this.lastKey = KEY.RIGHT;
    
    self = this;
    
    window.onkeydown = function(e) {
        self.lastKey = e.keyCode;
    };
};

var Board = function(blockSize, width, height) {
    this.blockSize = blockSize;
    this.width = width / blockSize;
    this.height = height / blockSize;
};

var Snake = function(segments) {
    this.segments = segments;
    this.color = "#000";
};

Snake.prototype = {
    move: function(direction) {
        var head = { x: this.segments[0].x, y: this.segments[0].y };
        var trimmed = this.segments.slice(0, -1);
        
        switch (direction) {
        case KEY.UP:
            return new Snake([{ x: head.x, y: head.y - 1 }].concat(trimmed));
        case KEY.DOWN:
            return new Snake([{ x: head.x, y: head.y + 1 }].concat(trimmed));
        case KEY.LEFT:
            return new Snake([{ x: head.x - 1, y: head.y }].concat(trimmed));
        case KEY.RIGHT:
            return new Snake([{ x: head.x + 1, y: head.y }].concat(trimmed));
        }

        return new Snake(this.segments);
    }
};

var Game = function(canvasId) {
    this.WIDTH = 200;
    this.HEIGHT = 200;
    this.BLOCK_SIZE = 10;
    this.MOVE_TIME = 50;

    this.inputter = new Inputter();
    this.board = new Board(this.BLOCK_SIZE, this.WIDTH, this.HEIGHT);
    this.snake = new Snake([{ x: this.board.width / 2, y: this.board.height / 2 }]);
    this.timeToMove = this.MOVE_TIME;
    
    var canvas = document.getElementById(canvasId);

    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    
    var drawingContext = canvas.getContext('2d');
    var self = this;

    this.start(function() {
        self.update();
        self.draw(drawingContext);
    });
};

Game.prototype = {
    start: function(fn) {
        var tick = function() {
            fn();
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    },
    update: function() {
        if (this.timeToMove > 0) {
            this.timeToMove--;
            return;
        }

        this.timeToMove = this.MOVE_TIME;;
        
        var moved = this.snake.move(this.inputter.lastKey);

        this.snake = moved;
    },
    draw: function(drawingContext) {
        console.log("loop");

        drawingContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        var i;
        for (i = 0; i < this.snake.segments.length; i++) {
            this.drawBlock(drawingContext, this.snake.segments[i], this.snake.color);
        }
    },
    drawBlock: function(drawingContext, block, color) {
        drawingContext.fillStyle = color;
        drawingContext.fillRect(
            this.BLOCK_SIZE * block.x, this.BLOCK_SIZE * block.y,
            this.BLOCK_SIZE, this.BLOCK_SIZE
        );
    }
};

window.onload = function() {
    new Game("canvas");
};
