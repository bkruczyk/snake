var KEY = {
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFT: 37    
};

var collidesWith = function(block, blocks) {
    return blocks.some(function(element) {
        return block.x === element.x && block.y === element.y;
    });
};

var Inputter = function() {
    this.lastKey = KEY.RIGHT;
    
    self = this;
    
    window.onkeydown = function(e) {
        self.setLastKey(e.keyCode);
    };
};

Inputter.prototype = {
    setLastKey: function(key) {
        switch (key) {
        case KEY.UP:
            if (this.lastKey !== KEY.DOWN) {
                this.lastKey = KEY.UP;
            }
            break;
        case KEY.DOWN:
            if (this.lastKey !== KEY.UP) {
                this.lastKey = KEY.DOWN;
            }
            break;
        case KEY.RIGHT:
            if (this.lastKey !== KEY.LEFT) {
                this.lastKey = KEY.RIGHT;
            }
            break;
        case KEY.LEFT:
            if (this.lastKey !== KEY.RIGHT) {
                this.lastKey = KEY.LEFT;
            }
            break;
        }
    }
};

var Board = function(blockSize, width, height) {
    this.blockSize = blockSize;
    this.width = width / blockSize;
    this.height = height / blockSize;
};

var Snake = function(segments) {
    this.segments = segments;
    this.head = { x: segments[0].x, y: segments[0].y };
    this.color = "#000";
};

Snake.prototype = {
    move: function(direction) {
        var trimmed = this.segments.slice(0, -1);
        
        switch (direction) {
        case KEY.UP:
            return new Snake(
                [{ x: this.head.x, y: this.head.y - 1 }].concat(trimmed)
            );
        case KEY.DOWN:
            return new Snake(
                [{ x: this.head.x, y: this.head.y + 1 }].concat(trimmed)
            );
        case KEY.LEFT:
            return new Snake(
                [{ x: this.head.x - 1, y: this.head.y }].concat(trimmed)
            );
        case KEY.RIGHT:
            return new Snake(
                [{ x: this.head.x + 1, y: this.head.y }].concat(trimmed)
            );
        }

        return new Snake(this.segments);
    },
    eat: function(apple) {
        return new Snake([{ x: apple.x, y: apple.y }].concat(this.segments));
    },
    isOutOfBoard: function(board) {
        return this.head.x < 0
            || this.head.y < 0
            || this.head.x > board.width - 1
            || this.head.y > board.height - 1;
    },
    collidesWithItself: function() {
        return collidesWith(this.head, this.segments.slice(1));
    }
};

var Game = function(canvasId) {
    this.WIDTH = 200;
    this.HEIGHT = 200;
    this.BLOCK_SIZE = 10;
    this.MOVE_TIME = 10;

    this.timeToMove = this.MOVE_TIME;
    this.inputter = new Inputter();
    this.board = new Board(this.BLOCK_SIZE, this.WIDTH, this.HEIGHT);
    this.snake = new Snake([
        { x: this.board.width / 2, y: this.board.height / 2 },
        { x: this.board.width / 2 + 1, y: this.board.height / 2}
    ]);
    this.apple = this.placeApple(this.snake, this.board);
    
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

        this.timeToMove = this.MOVE_TIME;

        var moved = this.snake.move(this.inputter.lastKey);

        if (collidesWith(moved.head, [this.apple])) {
            var newSnake = this.snake.eat(this.apple);

            this.apple = this.placeApple(newSnake, this.board);
            this.snake = newSnake;
        } else if (moved.isOutOfBoard(this.board) || moved.collidesWithItself()) {
            this.snake.color = "#0000FF";
        } else {
            this.snake = moved;
        }
    },
    draw: function(drawingContext) {
        console.log("loop");

        drawingContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        var i;
        for (i = 0; i < this.snake.segments.length; i++) {
            this.drawBlock(drawingContext, this.snake.segments[i], this.snake.color);
        }

        this.drawBlock(drawingContext, this.apple, "#F00");
    },
    drawBlock: function(drawingContext, block, color) {
        drawingContext.fillStyle = color;
        drawingContext.fillRect(
            this.BLOCK_SIZE * block.x, this.BLOCK_SIZE * block.y,
            this.BLOCK_SIZE, this.BLOCK_SIZE
        );
    },
    placeApple: function(snake, board) {
        var apple;

        do {
            apple = {
                x: Math.floor(Math.random() * 10),
                y: Math.floor(Math.random() * 10)
            };
        } while (apple.x > board.width
                 || apple.y > board.height
                 || collidesWith(apple, snake.segments));

        return apple;
    }
};

window.onload = function() {
    new Game("canvas");
};
