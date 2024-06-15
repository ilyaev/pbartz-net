import React from "react";
import { Button } from "semantic-ui-react";
import { DrawCircleState } from "./drawings";
import { HandState } from "./hands";

interface DraggableCardState {
    dragging: boolean;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
    label: string;
    handness: string;
    size: number;
}

interface Props {
    handsCount: number;
    poses: string[];
    onTrain: () => void;
    clicks: DrawCircleState[];
    loaded: boolean;
    training?: boolean;
    hands: HandState[];
}

interface State {
    randomX: number;
    randomY: number;
    cards: DraggableCardState[];
}

export class HUD extends React.Component<Props, State> {
    state = {
        randomX: Math.random() * window.innerWidth,
        randomY: Math.random() * window.innerHeight,
        cards: [
            {
                dragging: false,
                x: 500,
                y: 400,
                size: 100,
                currentX: 0,
                currentY: 0,
                label: "Card 1",
                handness: "Left",
            },
        ],
    };

    // static getDerivedStateFromProps(
    //     props: Readonly<Props>,
    //     state: Readonly<State>
    // ) {
    //     console.log({ props, state });
    // }

    componentDidMount(): void {
        this.processing();
    }

    getHands() {
        const hands = {
            Left: this.props.hands.find(
                (hand) => hand.handedness === "Left"
            ) as HandState,
            Right: this.props.hands.find(
                (hand) => hand.handedness === "Right"
            ) as HandState,
        };
        return hands;
    }

    getHand(handness: string) {
        return this.props.hands.find(
            (hand) => hand.handedness === handness
        ) as HandState;
    }

    processing() {
        this.setState({
            cards: this.state.cards.map((card) => {
                if (card.dragging) {
                    const hand = this.getHand(card.handness);
                    const pinchPoint = hand.pinchPoint();
                    const newCard = {
                        ...card,
                        x: pinchPoint.x - card.size / 2,
                        y: pinchPoint.y - card.size / 2,
                    };
                    return newCard;
                }
                return card;
            }),
        });
        window.requestAnimationFrame(this.processing.bind(this));
    }

    // shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    //     return (
    //         nextProps.handsCount !== this.props.handsCount ||
    //         nextProps.poses !== this.props.poses ||
    //         nextProps.clicks !== this.props.clicks
    //     );
    // }

    render() {
        // console.log("R: HUD");
        if (this.props.training) {
            return (
                <div
                    style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgb(0, 0, 0)",
                        color: "gray",
                    }}
                ></div>
            );
        }
        return (
            <div
                style={{
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgb(0, 0, 0)",
                    color: "gray",
                }}
            >
                {this.props.handsCount === 0 && (
                    <>
                        <h1>Hand Pose Detection</h1>
                        {this.props.loaded ? (
                            <p>Use your webcam to detect hand poses</p>
                        ) : (
                            <p>Loading...</p>
                        )}
                        <p>{this.props.poses.join(", ")}</p>
                        <button onClick={() => this.props.onTrain()}>
                            Train
                        </button>
                    </>
                )}
                {this.props.handsCount > 0 && this.renderPlayground()}
            </div>
        );
    }

    renderDiv(x: number, y: number, body: JSX.Element | string) {
        return (
            <div
                style={{
                    position: "absolute",
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                {body}
            </div>
        );
    }

    renderPlayground() {
        return (
            <>
                {this.renderDiv(
                    this.state.randomX,
                    this.state.randomY,
                    <Button
                        onClick={() => {
                            this.setState({
                                randomX: Math.min(
                                    window.innerWidth - 200,
                                    Math.max(
                                        200,
                                        Math.random() * window.innerWidth
                                    )
                                ),
                                randomY: Math.min(
                                    window.innerHeight - 200,
                                    Math.max(
                                        200,
                                        Math.random() * window.innerHeight
                                    )
                                ),
                            });
                            console.log("Button clicked");
                        }}
                    >
                        Pinch Me!
                    </Button>
                )}

                {this.state.cards.map((card, index) => {
                    return this.renderDiv(
                        card.x,
                        card.y,
                        <div
                            key={`card-${index}`}
                            onClick={(e) => {
                                const cardState = this.state.cards[index];
                                cardState.dragging = true;
                                cardState.handness =
                                    e.detail === 0 ? "Left" : "Right";

                                e.stopPropagation();
                                this.state.cards[index] = cardState;
                                console.log("Card clicked", cardState);
                                this.setState({ cards: this.state.cards });
                            }}
                            style={{
                                border: "1px solid white",
                                width: `${card.size}px`,
                                height: `${card.size}px`,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                padding: "10px",
                                backgroundColor: "0A0A0A",
                            }}
                        >
                            {card.label}
                        </div>
                    );
                })}

                {this.props.clicks.map((click, index) => {
                    return (
                        <div
                            key={`click-${index}`}
                            style={{
                                position: "absolute",
                                borderRadius: "50%",
                                backgroundColor: `rgba(${click.color.join(
                                    ", "
                                )}, ${Math.max(
                                    0.01,
                                    1 -
                                        Math.min(
                                            0.99,
                                            click.size / click.endSize
                                        )
                                )})`,
                                left: `${click.x}px`,
                                top: `${click.y}px`,
                                width: `${click.size}px`,
                                height: `${click.size}px`,
                            }}
                        ></div>
                    );
                })}
            </>
        );
    }
}
