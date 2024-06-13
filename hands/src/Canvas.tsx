import React from "react";
import { CustomHand } from "./hands";

interface Props {
    hands: CustomHand[];
    width?: number;
    height?: number;
}
interface State {}

export class Canvas extends React.Component<Props, State> {
    canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return nextProps.hands.length === 0 ? false : true;
    }

    draw = () => {
        const canvas = this.canvasRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.01)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.props.hands.forEach((hand) => {
            hand.keypoints.forEach((keypoint) => {
                ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
                ctx.fillRect(keypoint.x, keypoint.y, 10, 10);
            });

            ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
            ctx.fillRect(hand.center.x, hand.center.y, 20, 20);

            ctx.font = "30px Arial";
            ctx.fillStyle = "white";

            ctx.fillText(hand.pose, hand.center.x + 22, hand.center.y + 20);
        });
    };

    render() {
        // console.log("R: Canvas");
        return (
            <canvas
                ref={this.canvasRef}
                width={this.props.width || 640}
                height={this.props.height || 480}
                style={{
                    position: "absolute",
                    left: "0px",
                    pointerEvents: "none",
                    top: "0px",
                    margin: "0px",
                }}
            ></canvas>
        );
    }
}
