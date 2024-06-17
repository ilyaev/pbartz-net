import { HandState } from "./hands";
import { Vector } from "vecti";

export interface DraggableCardState {
    dragging: boolean;
    x: number;
    y: number;
    label: string;
    handness: string;
    size: number;
    id: number;
    direction: number[];
    acceleration: number;
    velocity: number;
    active: boolean;
}

export class DraggableCards {
    _currentId = 0;

    cards: DraggableCardState[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        (i: number) => {
            return {
                dragging: false,
                x: 50 + i * 120,
                y: 50 + (i % 5) * 120,
                size: 100,
                label: "Card " + i.toString(),
                handness: "",
                direction: [0, 0],
                acceleration: 0,
                velocity: 0,
                id: i,
                active: true,
            };
        }
    );

    hands: { [s: string]: HandState } = {};

    onUpdate?: (cards: DraggableCardState[]) => void;
    onCollide?: (
        collisions: { [s: number]: number },
        cards: DraggableCardState[]
    ) => DraggableCardState[];

    constructor() {
        this._currentId = this.cards.length + 1;
        this.process();
        setTimeout(() => {
            this.sync();
        }, 0);
    }

    addCard(card: Partial<DraggableCardState>) {
        card.id = this._currentId++;
        card.active = true;
        this.cards.push(card as DraggableCardState);
        this.sync();
    }

    releaseHand(handness: string, trail: { x: number; y: number }[]) {
        this.cards = this.cards.map((card) => {
            if (card.handness === handness) {
                const v1 = new Vector(trail[0].x, trail[0].y);
                const v2 = new Vector(
                    trail[trail.length - 1].x,
                    trail[trail.length - 1].y
                );
                const v3 = v2.subtract(v1);
                const mag = v3.length();
                const direction = v3.normalize();
                return {
                    ...card,
                    dragging: false,
                    handness: "",
                    direction: [direction.x, direction.y],
                    acceleration: 0,
                    velocity: Math.min(250, mag) / 20,
                };
            }
            return card;
        });
        this.sync();
    }

    sync() {
        this.onUpdate && this.onUpdate(this.cards);
    }

    process() {
        let flag = false;
        const collisions: { [s: number]: number } = {};
        this.cards = this.cards.map((card) => {
            //collusion detection
            this.cards.forEach((c) => {
                if (c.id !== card.id) {
                    if (
                        Math.abs(c.x - card.x) < card.size &&
                        Math.abs(c.y - card.y) < card.size
                    ) {
                        if (!collisions[c.id]) {
                            collisions[card.id] = c.id;
                        }
                    }
                }
            });
            if (card.dragging) {
                const hand = this.hands[card.handness];
                const pinchPoint = hand.pinchPoint();
                const newCard = {
                    ...card,
                    x: pinchPoint.x - card.size / 2,
                    y: pinchPoint.y - card.size / 2,
                };
                flag = true;
                return newCard;
            } else {
                const newCard = { ...card };
                if (
                    newCard.velocity > 0 &&
                    newCard.direction[0] !== 0 &&
                    newCard.direction[1] !== 0
                ) {
                    newCard.velocity += newCard.acceleration;
                    newCard.x += newCard.direction[0] * newCard.velocity;
                    newCard.y += newCard.direction[1] * newCard.velocity;
                    newCard.velocity -= 0.2;
                    flag = true;
                    return newCard;
                }
            }
            return card;
        });
        if (Object.keys(collisions).length > 0) {
            if (this.onCollide) {
                this.cards = this.onCollide(collisions, this.cards);
            }
        }
        flag && this.sync();
        window.requestAnimationFrame(() => this.process());
    }

    updateCard(id: number, card: Partial<DraggableCardState>) {
        this.cards = this.cards.map((c) => {
            if (c.id === id) {
                return { ...c, ...card };
            }
            return c;
        });
    }

    nextId() {
        return this._currentId++;
    }
}
