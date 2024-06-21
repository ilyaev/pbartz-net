import React from "react";

interface Props {
    score: number;
    finals: string[];
    loaded: boolean;
    handsCount: number;
}

interface State {}

export class HUD extends React.Component<Props, State> {
    render() {
        return (
            <div
                style={{
                    position: "absolute",
                    overflow: "hidden",
                    left: `0px`,
                    top: `0px`,
                    color: "white",
                    fontSize: "30px",
                    marginLeft: "10px",
                    width: "99%",
                    pointerEvents: "none",
                }}
            >
                {this.props.loaded ? (
                    <span>Score: {this.props.score.toFixed(0)}%</span>
                ) : (
                    <span>Loading hands model...</span>
                )}
                {this.props.finals.map((final, index) => {
                    return (
                        <div
                            style={{ fontSize: "20px", marginLeft: "0px" }}
                            key={`final-${index}`}
                        >
                            {final}
                        </div>
                    );
                })}
                {this.props.handsCount === 0 && !this.props.score && (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            alignContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: "20px",
                            color: "gray",
                        }}
                    >
                        <div
                            style={{
                                alignContent: "start",
                                alignItems: "center",
                                textAlign: "center",
                            }}
                        >
                            <div>
                                Hand Detection: The game will detect your hand
                                movements. Just hold your hand in front of the
                                camera.
                            </div>
                            <div>
                                To pick up a card: Make a "pinch" gesture with
                                your thumb and index finger, like you're holding
                                a small object.
                            </div>
                            <div>
                                To drag the card: Slowly move your hand, keeping
                                the pinch gesture, to where you want to drop the
                                card.
                            </div>
                            <div>
                                To drop the card: Open your fingers. Pick and
                                combine two cards to discover new elements
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
