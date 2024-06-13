import React from "react";
import { ClickState } from "./App";
import { Button } from "semantic-ui-react";

interface Props {
    handsCount: number;
    poses: string[];
    onTrain: () => void;
    clicks: ClickState[];
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

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return (
            nextProps.handsCount !== this.props.handsCount ||
            nextProps.poses !== this.props.poses ||
            nextProps.clicks !== this.props.clicks
        );
    }

    render() {
        // console.log("R: HUD");
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
                        <p>Use your webcam to detect hand poses</p>
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

    renderPlayground() {
        return (
            <>
                <div
                    style={{
                        position: "absolute",
                        left: `${this.state.randomX}px`,
                        top: `${this.state.randomY}px`,
                    }}
                >
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
                </div>
                {this.props.clicks.map((click, index) => {
                    return (
                        <div
                            key={`click-${index}`}
                            style={{
                                position: "absolute",
                                borderRadius: "50%",
                                backgroundColor: `rgba(255, 0, 0, ${Math.max(
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
