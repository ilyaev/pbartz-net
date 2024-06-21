// import { HandState } from "../../../../npm-module/react-hand-controller/src";
import { HandState } from "react-hand-controller";

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
    color: string;
    baseColor: string;
    delta?: { x: number; y: number };
    t?: number;
}

export class DraggableCards {
    _currentId = 0;

    needSync = true;

    timestamp = 0;

    cards: DraggableCardState[] = [];

    bounds: { x: number; y: number; width: number; height: number } = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    hands: { [s: string]: HandState } = {};

    onUpdate?: (cards: DraggableCardState[]) => void;
    onCollide?: (
        collisions: { [s: number]: number },
        cards: DraggableCardState[]
    ) => DraggableCardState[];

    constructor(defaultCards?: DraggableCardState[]) {
        if (defaultCards) {
            this.cards = defaultCards;
        }
        this._currentId = this.cards.length + 1;
        this.timestamp = Date.now();
        this.process();
        setTimeout(() => {
            this.needSync = true;
        }, 100);
    }

    addCard(card: Partial<DraggableCardState>) {
        card.id = this._currentId++;
        card.active = true;
        this.cards.push(card as DraggableCardState);
        this.needSync = true;
    }

    releaseHand(handness: string) {
        this.cards = this.cards.map((card) => {
            if (card.handness === handness) {
                this.needSync = true;
                return {
                    ...card,
                    dragging: false,
                    color: card.baseColor,
                    handness: "",
                };
            }
            return card;
        });
    }

    sync() {
        this.onUpdate && this.onUpdate(this.cards);
        this.needSync = false;
    }

    calculateDirection(card: DraggableCardState) {
        const force = { x: 0, y: 0 };
        let flag = 0;
        this.cards.forEach((c) => {
            if (c.id !== card.id) {
                if (
                    Math.abs(c.x - card.x) < card.size * 1.3 &&
                    Math.abs(c.y - card.y) < card.size * 1.3
                ) {
                    const direction = {
                        x: c.x - card.x,
                        y: c.y - card.y,
                    };
                    const distance = Math.sqrt(
                        direction.x * direction.x + direction.y * direction.y
                    );
                    const forceMagnitude = 1 / distance;
                    force.x += direction.x * forceMagnitude;
                    force.y += direction.y * forceMagnitude;
                    flag = 1 + (1 - 10 / distance);
                }
            }
        });
        return [force.x, force.y, flag];
    }

    boundCard(card: DraggableCardState) {
        if (card.y > this.bounds.height - card.size) {
            card.y = this.bounds.y + card.size / 4;
        }
        if (card.y < this.bounds.y) {
            card.y = this.bounds.height - card.size * 1.1;
        }
        if (card.x > this.bounds.width - card.size) {
            card.x = this.bounds.x + card.size / 4;
        }
        if (card.x < this.bounds.x) {
            card.x = this.bounds.width - card.size * 1.1;
        }
        return card;
    }

    process() {
        const delta = (Date.now() - this.timestamp) / 1000;
        let flag = false;
        const collisions: { [s: number]: number } = {};
        this.cards = this.cards.map((card) => {
            if (!card.dragging) {
                const force = this.calculateDirection(card);
                if (force[2]) {
                    card.direction = [force[0], force[1]];
                    card.velocity = force[2];
                    flag = true;
                } else {
                    card.direction = [0, 0];
                    card.velocity = 0;
                }
            } else {
                card.direction = [0, 0];
                card.velocity = 0;
            }

            //collusion detection
            this.cards.forEach((c) => {
                if (c.id !== card.id) {
                    if (
                        Math.abs(c.x - card.x) < card.size &&
                        Math.abs(c.y - card.y) < card.size
                    ) {
                        if (!collisions[c.id] && c.dragging && card.dragging) {
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
                newCard.y = Math.max(
                    Math.min(this.bounds.height - newCard.size, newCard.y),
                    this.bounds.y
                );
                newCard.x = Math.max(
                    Math.min(this.bounds.width - newCard.size * 1.2, newCard.x),
                    this.bounds.x
                );
                flag = true;
                return newCard;
            } else {
                const newCard = { ...card };
                if (
                    newCard.t ||
                    (newCard.velocity > 0 &&
                        (newCard.direction[0] !== 0 ||
                            newCard.direction[1] !== 0))
                ) {
                    if (newCard.t && newCard.delta) {
                        newCard.t = Math.max(0, newCard.t - delta);
                        newCard.x += newCard.delta.x * delta;
                        newCard.y += newCard.delta.y * delta;
                        if (newCard.t <= 0) {
                            console.log("Deactivating", newCard.label);
                            newCard.active = false;
                        }
                    } else {
                        newCard.velocity += newCard.acceleration;
                        newCard.x -= newCard.direction[0] * newCard.velocity;
                        newCard.y -= newCard.direction[1] * newCard.velocity;
                    }
                    // newCard.velocity -= 0.2;
                    flag = true;
                    return this.boundCard(newCard);
                }
            }

            return card;
        });
        if (Object.keys(collisions).length > 0) {
            if (this.onCollide) {
                this.cards = this.onCollide(collisions, this.cards);
            }
        }
        if (flag || this.needSync) {
            this.sync();
        }
        this.timestamp = Date.now();
        window.requestAnimationFrame(() => this.process());
    }

    getPlaceXY(i: number, maxNum?: number, _offset?: { x: number; y: number }) {
        const offset = _offset || {
            x: 0,
            y: 0,
        };
        const angleIncrement = (2 * Math.PI) / (maxNum || this.cards.length);
        const angle = i * angleIncrement;
        const spaceRadius = 100;
        const rectangleWidth = 100;
        const rectangleHeight = 100;
        const radius = spaceRadius - rectangleWidth / 2; // Adjust for rectangle's width

        // Calculate x and y coordinates based on polar coordinates
        const x = radius * Math.cos(angle) - rectangleWidth / 2;
        let y = radius * Math.sin(angle) - rectangleHeight / 2;

        // Adjust y for rectangle's height (place bottom-center on the circle)
        y -= rectangleHeight / 2;
        return { x: x + offset.x, y: y + offset.y };
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
        return (
            this.cards.reduce((acc, card) => {
                if (card.id > acc) {
                    return card.id;
                }
                return acc;
            }, 0) + 1
        );
    }
}
