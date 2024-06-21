import React from "react";
import { DraggableCards, DraggableCardState } from "../../systems/cards";
import { CARD_COLOR, GAME_CONFIG } from "../../store/game";
import AlchemyCards from "../cards";

interface Props {
    // define your props here
}

interface State {
    cards: DraggableCardState[];
}

export class SandBox extends React.Component<Props, State> {
    state = {
        cards: [] as DraggableCardState[],
    };

    cards: DraggableCards = new DraggableCards();

    constructor(props: Props) {
        super(props);

        this.cards.cards = GAME_CONFIG.cards
            .filter((card) => card.ingredients.length === 0)
            .map((card, index) => {
                const xy = this.cards.getPlaceXY(index, 4);
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
                    baseColor: card.color || CARD_COLOR.default,
                    color: CARD_COLOR.default,
                };
            });

        this.cards.onUpdate = (cards) => {
            setTimeout(() => {
                this.setState({ cards });
            }, 0);
        };
        // this.cards.onCollide = this.onCardsCollide.bind(this);
    }

    render() {
        return (
            <AlchemyCards
                cards={this.state.cards}
                updateCard={(card) => {
                    this.cards.updateCard(card.id!, card);
                }}
            />
        );
    }
}
