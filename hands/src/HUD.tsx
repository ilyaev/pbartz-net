import React from "react";
import { Button } from "semantic-ui-react";
import { DrawCircleState } from "./drawings";
import { HandState } from "./hands";
import { DraggableCardState } from "./cards";

interface Props {
    handsCount: number;
    poses: string[];
    onTrain: () => void;
    clicks: DrawCircleState[];
    loaded: boolean;
    training?: boolean;
    hands: HandState[];
    cards: DraggableCardState[];
    onCardClick: (id: number, e: React.MouseEvent) => void;
}

interface State {
    randomX: number;
    randomY: number;
}

export class HUD extends React.Component<Props, State> {
    state = {
        randomX: Math.random() * window.innerWidth,
        randomY: Math.random() * window.innerHeight,
    };

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

                {this.props.cards.map((card, index) => {
                    return this.renderDiv(
                        card.x,
                        card.y,
                        <div
                            key={`card-${index}`}
                            onClick={(e) => {
                                this.props.onCardClick(card.id, e);
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
                                backgroundColor:
                                    card.id % 2 === 0 ? "#0A0A0A" : "#2A2A2A",
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
