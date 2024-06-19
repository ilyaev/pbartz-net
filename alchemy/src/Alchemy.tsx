import React from "react";
import { connect } from "react-redux";
import { HandController } from "../../../npm-module/react-hand-controller/src/HandController";
import { RootState, AppDispatch } from "./store";
import { addCard, deleteCard, processCards, updateCard } from "./store/cards";
import AlchemyCards from "./components/cards";
import { HandState } from "../../../npm-module/react-hand-controller/src/HandController/hands";
import { DraggableCards, DraggableCardState } from "./systems/cards";
import { CARD_COLOR, ELEMENTS_MAP, GAME_CONFIG } from "./store/game";
import { HUD } from "./components/hud";

interface Props {}

interface State {
    cards: DraggableCardState[];
    score: number;
    finals: string[];
}

const mapStateToProps = (state: RootState) => {
    return {
        cards: state.cards,
    };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
    return {
        addCard: (card: DraggableCardState) => dispatch(addCard(card)),
        deleteCard: (id: number) => dispatch(deleteCard(id)),
        processCards: () => dispatch(processCards()),
        updateCard: (card: Partial<DraggableCardState>) =>
            dispatch(updateCard(card)),
    };
};

type CombinedProps = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps> &
    Props;

export class AlchemyApp extends React.Component<CombinedProps, State> {
    state = {
        cards: [] as DraggableCardState[],
        score: 0,
        finals: [] as string[],
    };
    hands: HandState[] = [] as HandState[];
    cards: DraggableCards = new DraggableCards();

    constructor(props: CombinedProps) {
        super(props);
        this.setupCards();
    }

    render() {
        return (
            <>
                <AlchemyCards
                    cards={this.state.cards}
                    updateCard={(card) => {
                        this.cards.updateCard(card.id!, card);
                    }}
                />
                <HandController
                    passThroughPinchAsClick={true}
                    showMiniCamera={false}
                    showFeedback={true}
                    handGizmoConfig={{
                        showCenter: false,
                        showPose: false,
                    }}
                    onHandUpdate={this.onHandsUpdate.bind(this)}
                    onPinch={this.onPinch.bind(this)}
                />
                <HUD score={this.state.score} finals={this.state.finals} />
            </>
        );
    }

    onCardsCollide(
        collisions: { [s: number]: number },
        cards: DraggableCardState[]
    ): DraggableCardState[] {
        for (const sourceId in collisions) {
            const targetId = collisions[sourceId];
            const source = cards.find((card) => card.id === parseInt(sourceId));
            const target = cards.find((card) => card.id === targetId);
            if (source && target) {
                const newElements = GAME_CONFIG.cards.filter(
                    (card) =>
                        card.ingredients.length === 2 &&
                        card.ingredients.includes(source.label) &&
                        card.ingredients.includes(target.label)
                );
                source.dragging = false;
                source.handness = "";
                target.dragging = false;
                target.handness = "";
                source.color = source.baseColor;
                target.color = target.baseColor;
                newElements.forEach((newElement) => {
                    if (
                        newElement &&
                        cards.find((card) => card.label === newElement.name) ===
                            undefined
                    ) {
                        cards.push({
                            dragging: false,
                            x:
                                source.x -
                                (source.x - target.x) / 2 +
                                (Math.random() * 50 - 25),
                            y:
                                source.y -
                                (source.y - target.y) / 2 +
                                (Math.random() * 50 - 25),
                            label: newElement.name,
                            handness: "",
                            size: 100,
                            direction: [0, 0],
                            acceleration: 0,
                            velocity: 0,
                            active: true,
                            id: this.cards.nextId(),
                            baseColor: newElement.color || CARD_COLOR.default,
                            color: newElement.color || CARD_COLOR.default,
                        } as DraggableCardState);
                    }
                });
                if (newElements.length > 0) {
                    cards = this.calculateScore(cards);
                }
            }
        }
        return cards;
    }

    calculateScore(cards: DraggableCardState[]) {
        const existing = cards.map((card) => card.label);
        const elements = GAME_CONFIG.cards
            .filter((card) => (existing.includes(card.name) ? false : true))
            .map((card) => card.name);
        const total = GAME_CONFIG.cards.length;

        const result = cards.map((card) => {
            let flag = true;
            elements.forEach((element) => {
                const parents = ELEMENTS_MAP[element].parents || [];
                if (parents.includes(card.label)) {
                    flag = false;
                }
            });
            if (flag) {
                card.active = false;
                console.log("deactivating", card.label);
            }
            return card;
        });
        setTimeout(() => {
            this.setState({
                score: (existing.length / total) * 100,
                finals: result
                    .filter((card) => !card.active)
                    .map((card) => card.label),
            });
        }, 0);
        return result;
    }

    onHandsUpdate(hands: HandState[]) {
        this.hands = hands;
        if (!this.cards.hands.Left) {
            this.cards.hands.Left = this.hands.find(
                (h) => h.handedness === "Left"
            ) as any;
        }
        if (!this.cards.hands.Right) {
            this.cards.hands.Right = this.hands.find(
                (h) => h.handedness === "Right"
            ) as any;
        }
    }

    onPinch(
        _hand: HandState,
        _x: number,
        _y: number,
        isPinched?: boolean
        // element?: Element | null
    ): void {
        // const dataType = element?.getAttribute("data-type");
        // const dataId = element?.getAttribute("data-id");
        if (!isPinched) {
            this.cards.releaseHand(_hand.handedness);
        }
    }

    setupCards() {
        this.cards.bounds = {
            x: 10,
            y: 10,
            width: document.body.offsetWidth - 30,
            height: document.body.offsetHeight - 30,
        };
        this.cards.cards = GAME_CONFIG.cards
            .filter((card) => card.ingredients.length === 0)
            .map((card, index) => {
                const xy = this.cards.getPlaceXY(index, 4, {
                    x: document.body.offsetWidth / 2 - 50,
                    y: document.body.offsetHeight / 2,
                });
                return {
                    dragging: false,
                    x: xy.x,
                    y: xy.y,
                    label: card.name,
                    handness: "",
                    size: 100,
                    id: index + 1,
                    direction: [0, 0],
                    acceleration: 0,
                    velocity: 0,
                    active: true,
                    color: card.color || CARD_COLOR.default,
                    baseColor: card.color || CARD_COLOR.default,
                };
            });

        this.cards.onUpdate = (cards) => {
            setTimeout(() => {
                this.setState({ cards });
            }, 0);
        };
        this.cards.onCollide = this.onCardsCollide.bind(this);
    }
}

const connected = connect(mapStateToProps, mapDispatchToProps)(AlchemyApp);

export default connected;
