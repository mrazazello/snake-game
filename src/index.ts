import "./assets/main.css";

const gameMenu = document.getElementById("menu");
const score = document.getElementById("score");
const newGame = document.getElementById("newGame");
const canvas = <HTMLCanvasElement> document.getElementById("game");
const ctx = canvas.getContext("2d");

let fps = 5;
let fpsInterval = 1000 / fps;
let startFraime = Date.now();

type TStatus = "new" | "game" | "gameover"

interface IState extends Record<string, any> {
    status: TStatus
    score: number;
}

const initialState: IState = {
    status: "new",
    score: 0,
}

const stateHandler = {
    set(target: IState, prop: string, value: TStatus | number) {
        if (prop in target) {
            if (value === "game" && gameMenu) {
                gameMenu.style.display = "none";
            }
            if (prop === "score" && score) {
                score.innerHTML = value.toString();
            }
            target[prop] = value;
            return true;
        }
        return false
    },
    get(target: IState, prop: string) {
        if (prop in target) {
            return target[prop];
          } else {
            return 0;
          }
    }
};

let state = new Proxy<IState>(initialState, stateHandler);

const grid = 20;
const centerX = Math.floor((canvas.width / 2 / grid)) * grid - grid;
const centerY = Math.floor((canvas.height / 2 / grid)) * grid - grid;

const snake = {
    x: centerX,
    y: centerY,
    dx: grid,
    dy: 0,
    tail: [{ x: centerX, y: centerY }, { x: centerX - grid, y: centerY }],
}

console.log("snake: ", snake)

const getRandomFruit = () => {
    const apple = { 
        x: Math.floor((Math.random() * (canvas.width)/ grid)) * grid ,
        y: Math.floor((Math.random() * (canvas.height) / grid)) * grid,
    };
    return apple; 
}

let fruits = [
    getRandomFruit(),
]

export const gameInit = () => {
    console.log("game init");
}

const gameLoop = () => {
    let now = Date.now();
    let elapsed = now - startFraime;
    requestAnimationFrame(gameLoop);
    if (!ctx) return;
    
    if (elapsed > fpsInterval) {
        startFraime = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        fruits.forEach((item) => {
            ctx.fillRect(item.x, item.y, grid, grid);
        })
        
        ctx.fillStyle = "green";
        
        snake.x += snake.dx;
        if (snake.x > canvas.width) snake.x = 0;
        if (snake.x < 0) snake.x = canvas.width - grid;
        
        snake.y += snake.dy;
        if (snake.y > canvas.height) snake.y = 0;
        if (snake.y < 0) snake.y = canvas.height - grid;
        
        ctx.fillRect(snake.x, snake.y, grid, grid);
        snake.tail.forEach((item) => {
            ctx.fillRect(item.x, item.y, grid, grid)
        });
        snake.tail.unshift({ x: snake.x, y: snake.y });
        snake.tail.pop();

        if (fruits.some((item) => item.x === snake.x && item.y === snake.y)) {
            console.log("bam!");
            state.score = state.score + 1;
            snake.tail.unshift();
            fruits = [getRandomFruit()];
        }
    }
}

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "ArrowLeft":
           if (!snake.dx) snake.dx = - grid;
           snake.dy = 0;
        break;
        case "ArrowRight":
            if (!snake.dx) snake.dx = grid;
            snake.dy = 0;
        break;
        case "ArrowUp":
            if (!snake.dy) snake.dy = - grid;
            snake.dx = 0;
        break;
        case "ArrowDown":
            if (!snake.dy) snake.dy = grid;
            snake.dx = 0;
        break;
    }
});

export const startGame = () => {
    gameLoop();
    state.status = "game";
}

newGame?.addEventListener("mousedown", () => {
    startGame();
})
