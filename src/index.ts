import "./assets/main.css";

import { TStatus, IState, ISnake, ICoords } from "./types";

const soundfile = require("./assets/snarl.mp3");
// import soundfile from "./assets/snarl.mp3";
// console.log("file: ", soundfile)


const gameMenu = document.getElementById("menu");
const score = document.getElementById("score");
const gameOver = document.getElementById("gameover");
const scary = document.getElementById("scary");
const canvas = <HTMLCanvasElement> document.getElementById("game");
const ctx = canvas.getContext("2d");

let fps = 5;
let fpsInterval = 1000 / fps;
let startFraime = Date.now();
let requestAnimate: number;

const grid = 20;
const centerX = Math.floor((canvas.width / 2 / grid)) * grid - grid;
const centerY = Math.floor((canvas.height / 2 / grid)) * grid - grid;

const initialState: IState = {
    status: "new",
    score: 0,
}

let fruits: ICoords[] = [];

const initialSnake: ISnake = {
    x: centerX,
    y: centerY,
    dx: grid,
    dy: 0,
    tail: [{ x: centerX, y: centerY }, { x: centerX - grid, y: centerY }],
}

let snake = { ...initialSnake };

const getRandomFruit = () => {
    const apple = { 
        x: Math.floor((Math.random() * (canvas.width)/ grid)) * grid ,
        y: Math.floor((Math.random() * (canvas.height) / grid)) * grid,
    };
    return apple; 
}


const showScary = () => {
    scary.style.opacity = "1";
    const scream = new Audio("snarl.mp3");
    scream.play();
    setTimeout(() => {
        scary.style.opacity = "0";
    }, 500)
}

const stateHandler = {
    set(target: IState, prop: string, value: TStatus | number) {
        if (prop in target) {
            if (value === "new") {
                gameOver.style.display = "none";
            }
            if (value === "game") {
                gameMenu.style.display = "none";
                gameOver.style.display = "none";
            }
            if (value === "gameover") {
                gameOver.style.display = "block";
                cancelAnimationFrame(requestAnimate);
                window.addEventListener("keydown", gameStartHandler);
            }
            if (prop === "score" && score) {
                score.innerHTML = value.toString();
                if (value === 3) {
                    showScary();
                }
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

    let state: IState = new Proxy<IState>(initialState, stateHandler);

    const gameLoop = () => {
        let now = Date.now();
        let elapsed = now - startFraime;
    requestAnimate = requestAnimationFrame(gameLoop);
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
        if (snake.x > canvas.width) state.status = "gameover";
        if (snake.x < 0) state.status = "gameover";
        
        snake.y += snake.dy;
        if (snake.y > canvas.height) state.status = "gameover";
        if (snake.y < 0) state.status = "gameover";
        
        if (snake.tail.some((item) => item.x === snake.x && item.y === snake.y)) {
            state.status = "gameover";
        }

        snake.tail.unshift({ x: snake.x, y: snake.y });
        snake.tail.pop();

        ctx.fillRect(snake.x, snake.y, grid, grid);
        snake.tail.forEach((item) => {
            ctx.fillRect(item.x, item.y, grid, grid)
        });

        if (fruits.some((item) => item.x === snake.x && item.y === snake.y)) {
            console.log("bam!");
            state.score = state.score + 1;
            snake.tail.unshift({x: snake.x, y: snake.y});
            fruits = [getRandomFruit()];
        }
    }
}

const gameControlKeysHandler = (e: KeyboardEvent) => {
    switch (e.code) {
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
}

const gameStartHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
        snake = { ...initialSnake };
        snake.tail = [ ...initialSnake.tail ];
        state.score = 0;
        state.status = "game";
        fruits = [getRandomFruit()];
        requestAnimate = requestAnimationFrame(gameLoop);
        console.log("game inited");
        window.removeEventListener("keydown", gameStartHandler);
        window.addEventListener("keydown", gameControlKeysHandler);
    }
}

window.addEventListener("keydown", gameStartHandler);
