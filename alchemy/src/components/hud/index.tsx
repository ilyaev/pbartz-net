import React from "react";

interface Props {
    score: number;
    finals: string[];
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
                }}
            >
                <span>Score: {this.props.score.toFixed(0)}%</span>
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
            </div>
        );
    }
}
