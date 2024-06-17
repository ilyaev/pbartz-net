export enum DRAW_OBJECT_TYPE {
    Circle = "circle",
    Rectangle = "rectangle",
}

interface DrawObjectBase {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    startTime: number;
    size: number;
    startSize: number;
    endSize: number;
    lifetime: number;
    active: boolean;
    color: number[];
}

export interface DrawCircleState extends DrawObjectBase {
    type: DRAW_OBJECT_TYPE.Circle;
}

export interface DrawRectangleState extends DrawObjectBase {
    type: DRAW_OBJECT_TYPE.Rectangle;
}

export type DrawObjectState = DrawCircleState | DrawRectangleState;

export class CanvasDrawingState {
    objects: DrawObjectState[] = [];
    onUpdate?: (objects: DrawObjectState[]) => void;

    constructor() {
        this.objects = [];
        this.process();
    }

    init() {
        this.addRect(500, 500);
    }

    add(object: DrawObjectState) {
        this.objects.push(object);
    }

    addRect(x: number, y: number, params?: Partial<DrawObjectBase>) {
        console.log("addRect", x, y);
        this.add(
            Object.assign(
                {
                    centerX: x,
                    centerY: y,
                    x,
                    y,
                    startTime: Date.now(),
                    size: 20,
                    startSize: 20,
                    active: true,
                    lifetime: -1,
                    color: [255, 0, 0],
                    type: DRAW_OBJECT_TYPE.Circle,
                } as DrawCircleState,
                params || {}
            )
        );
    }

    addBlip(x: number, y: number, params?: Partial<DrawObjectBase>) {
        console.log("addBlip", x, y);
        this.add(
            Object.assign(
                {
                    centerX: x + Math.random() * 10 - 5,
                    centerY: y + Math.random() * 10 - 5,
                    x,
                    y,
                    startTime: Date.now(),
                    size: 20,
                    startSize: 20,
                    endSize: 300 + (Math.random() * 100 - 50),
                    active: true,
                    lifetime: 200 + (Math.random() * 500 - 250),
                    color: [255, 0, 0],
                    type: DRAW_OBJECT_TYPE.Circle,
                } as DrawCircleState,
                params || {}
            )
        );
    }

    process() {
        if (this.objects.length > 0) {
            let flag = false;
            this.objects = ([] as DrawObjectState[]).concat(
                this.objects
                    .map((object) => {
                        if (object.lifetime === -1 || !object.endSize) {
                            return object;
                        }
                        flag = true;
                        const r = Object.assign({}, object, {
                            size:
                                object.startSize +
                                ((object.endSize - object.startSize) *
                                    (Date.now() - object.startTime)) /
                                    object.lifetime,
                            active: object.size < object.endSize,
                        } as DrawObjectState);
                        r.x = r.centerX - r.size / 2;
                        r.y = r.centerY - r.size / 2;
                        return r;
                    })
                    .filter((object) => object.active)
            );
            if (flag && this.onUpdate) {
                this.onUpdate(this.objects);
            }
        }
        window.requestAnimationFrame(this.process.bind(this));
    }
}
