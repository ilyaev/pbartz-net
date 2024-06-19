import React from "react";
import { connect } from "react-redux";
import { RootState, AppDispatch, DATA_TYPE } from "../../store";
import {
    // addCard,
    deleteCard,
    // updateCard,
} from "../../store/cards";
import { DraggableCardState } from "../../systems/cards";
import { CARD_COLOR } from "../../store/game";

interface Props {
    cards: DraggableCardState[];
    updateCard: (card: Partial<DraggableCardState>) => void;
}

interface State {}

const mapStateToProps = (state: RootState) => {
    return {
        reduxcards: state.cards.items,
    };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
    return {
        // addCard: (card: DraggableCardState) => dispatch(addCard(card)),
        deleteCard: (id: number) => dispatch(deleteCard(id)),
        // updateCard: (card: Partial<DraggableCardState>) =>
        //     dispatch(updateCard(card)),
    };
};

type CombinedProps = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps> &
    Props;

export class AlchemyCards extends React.Component<CombinedProps, State> {
    render() {
        return (
            <div
                style={{
                    backgroundColor: "black",
                    width: "100vw",
                    height: "100vh",
                }}
            >
                {this.props.cards.map((card, index) => {
                    return card.active ? (
                        <div
                            key={`card-${index}`}
                            onClick={(e) => {
                                if (e.detail === 0 || e.detail === 1) {
                                    e.stopPropagation();
                                    this.props.updateCard({
                                        id: card.id,
                                        dragging: true,
                                        color: CARD_COLOR.dragging,
                                        handness:
                                            e.detail === 0 ? "Left" : "Right",
                                    });
                                }
                            }}
                            data-type={DATA_TYPE.CARD}
                            data-id={card.id}
                            style={{
                                position: "absolute",
                                left: `${card.x}px`,
                                top: `${card.y}px`,
                                border: "1px solid white",
                                width: `${card.size}px`,
                                height: `${card.size}px`,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                padding: "10px",
                                backgroundColor: card.color,
                            }}
                        >
                            {card.label}
                        </div>
                    ) : null;
                })}
            </div>
        );
    }

    renderDiv(x: number, y: number, body: JSX.Element | string) {
        return (
            <div
                style={{
                    position: "absolute",
                    overflow: "hidden",
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                {body}
            </div>
        );
    }
}

const connected = connect(mapStateToProps, mapDispatchToProps)(AlchemyCards);

export default connected;
