import React from "react";

interface Props {
    width?: number;
    height?: number;
    showMiniCamera?: boolean;
    onCapture?: (video: HTMLVideoElement) => void;
    frequency?: number;
}

interface State {}

export class Camera extends React.Component<Props, State> {
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return (
            nextProps.width !== this.props.width ||
            nextProps.height !== this.props.height ||
            nextProps.onCapture !== this.props.onCapture ||
            nextProps.frequency !== this.props.frequency ||
            nextProps.showMiniCamera !== this.props.showMiniCamera
        );
    }

    async componentDidMount() {
        const constraints = {
            video: true,
        };
        const video = this.videoRef.current as HTMLVideoElement;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        video.srcObject = stream;
        video.addEventListener("loadeddata", this.onLoaded);
    }

    onLoaded = async () => {
        if (this.props.onCapture) {
            if (this.videoRef.current) {
                this.props.onCapture(this.videoRef.current);
            }
            if (!this.props.frequency) {
                window.requestAnimationFrame(this.onLoaded);
            } else {
                setTimeout(() => {
                    this.onLoaded();
                }, this.props.frequency);
            }
        }
    };

    render() {
        // console.log("R: Camera");
        return (
            <div>
                <video
                    id="webcam"
                    autoPlay
                    muted
                    width={this.props.width || 640}
                    height={this.props.height || 480}
                    ref={this.videoRef}
                    key={"webcam"}
                    style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        marginTop: "10px",
                    }}
                ></video>
                {this.props.showMiniCamera || (
                    <div
                        style={{
                            position: "relative",
                            left: "0px",
                            top: "0px",
                            // marginTop: "10px",
                            width: this.props.width || 640,
                            height: (this.props.height || 480) + 10,
                            // border: "1px solid white",
                            backgroundColor: "rgba(0, 0, 0, 0.99)",
                        }}
                    ></div>
                )}
            </div>
        );
    }
}
