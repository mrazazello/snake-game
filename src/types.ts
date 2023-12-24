export type TStatus = "new" | "game" | "gameover";

export interface IState extends Record<string, any> {
    status: TStatus
    score: number;
}

export interface ICoords {
    x: number;
    y: number;
}

export interface ISnake {
    x: number;
    y: number;
    dx: number;
    dy: number;
    tail: ICoords[];
}