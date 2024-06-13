import React from "react";
import "./App.css";
import { Camera } from "./Camera";
// import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import * as tf from "@tensorflow/tfjs";
// import "@tensorflow/tfjs-backend-webgl";
import { Canvas } from "./Canvas";
import { HUD } from "./HUD";
import { Training } from "./Training";
import { clickElementByCoordinates } from "./utils";
import { CustomHand, HandState } from "./hands";
import { HandModels, TrainingRecords } from "./models";
// import * as tfvis from "@tensorflow/tfjs-vis";

export interface ClickState {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    startTime: number;
    size: number;
    startSize: number;
    endSize: number;
    lifetime: number;
    active: boolean;
    color: number[];
}

interface Props {}

interface State {
    hands: HandState[];
    poses: string[];
    training?: boolean;
    records?: TrainingRecords;
    trainingInProgress?: boolean;
    samplingInProgress?: boolean;
    clicks: ClickState[];
}

class App2 extends React.Component<Props, State> {
    state = {
        hands: [],
        poses: [],
        training: false,
        records: {} as TrainingRecords,
        trainingInProgress: false,
        clicks: [] as ClickState[],
    } as State;

    cameraWidth = 120;
    cameraHeight = 80;
    canvasWidth = document.body.offsetWidth;
    canvasHeight = document.body.offsetHeight;

    models: HandModels = new HandModels();

    hands: { [s: string]: HandState } = {
        Left: new HandState(),
        Right: new HandState(),
    };

    constructor(props: Props) {
        super(props);
        this.cameraWidth = this.canvasWidth * 0.1;
        this.cameraHeight = this.canvasHeight * 0.1;

        [this.hands.Left, this.hands.Right].forEach((hand) => {
            hand.onPoseChange = this.onHandPoseChange;
            hand.onPinch = this.onPinch;
            hand.onDragStart = this.onDragStart;
            hand.onDrag = this.onDrag;
            hand.onDrop = this.onDrop;
        });
    }

    async componentDidMount() {
        try {
            await this.models.init();
            this.setState({
                poses: this.models.poses,
                records: this.models.getRecords(),
            });
        } catch (e) {
            this.setState({ poses: [], records: {} });
        }
        this.clicksProcessing();
    }

    render() {
        return (
            <>
                {this.state.trainingInProgress && (
                    <div style={{ padding: "20px", fontSize: "40px" }}>
                        Training in progress...
                    </div>
                )}
                {this.state.training ? (
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
                ) : (
                    <HUD
                        handsCount={this.state.hands.length}
                        poses={this.state.poses}
                        key={"HUD"}
                        onTrain={() => this.setState({ training: true })}
                        clicks={this.state.clicks}
                    />
                )}
                {this.state.trainingInProgress
                    ? undefined
                    : this.state.hands.length === 0 || (
                          <Canvas
                              key={"CANVAS"}
                              hands={this.state.hands}
                              width={this.canvasWidth}
                              height={this.canvasHeight}
                          />
                      )}

                {this.state.trainingInProgress || (
                    <Camera
                        onCapture={this.scanVideo}
                        frequency={50}
                        key={"CAMERA"}
                        width={this.cameraWidth}
                        // showMiniCamera={true}
                        height={this.cameraHeight}
                    />
                )}
                {this.state.training && (
                    <Training
                        onClose={async (reload) => {
                            this.setState({ training: false });
                            if (reload) {
                                await this.models.loadPoseModel();
                            }
                        }}
                        onSampling={(start) => {
                            this.setState({ samplingInProgress: start });
                        }}
                        onTraining={(start) => {
                            this.setState({ trainingInProgress: start });
                        }}
                        hands={
                            this.state.samplingInProgress
                                ? this.state.hands
                                : []
                        }
                        onAddSample={this.onAddSample.bind(this)}
                        onDeleteSample={this.onDeleteSample.bind(this)}
                        records={this.state.records || {}}
                    />
                )}
            </>
        );
    }

    setRecords(records: TrainingRecords) {
        this.models.setRecords(records);
        this.setState({ poses: this.models.poses, records });
    }

    serializeHand(hand: CustomHand) {
        return this.hands.Left.serializeHand(hand);
    }

    onAddSample = (samples: CustomHand[], label: string) => {
        if (samples.length > 0) {
            const records = this.models.getRecords();
            records[label] = ([] as number[][])
                .concat(records[label] || [])
                .concat(samples.map((sample) => this.serializeHand(sample)));
            this.setRecords(records);
        }
        setTimeout(() => {
            this.setState({ samplingInProgress: false });
        }, 0);
    };

    onDeleteSample = (label: string) => {
        const records = this.models.getRecords();
        delete records[label];
        this.setRecords(records);
    };

    scanVideo = (video: HTMLVideoElement) => {
        // detect hands
        this.models.detector
            ?.estimateHands(video, { flipHorizontal: true })
            .then((hands) => {
                // clear pose for invisible hands
                const visibleHands = hands.map(
                    (hand) => hand.handedness
                ) as string[];
                Object.keys(this.hands).forEach((hand) => {
                    if (!visibleHands.includes(hand)) {
                        this.hands[hand].setPose("");
                    }
                });

                if (hands.length === 0 && this.state.hands.length === 0) {
                    return;
                }
                this.setState({
                    hands: hands
                        .map((hand) => {
                            const handState = this.hands[hand.handedness];
                            handState.updateHand(hand as CustomHand);
                            return handState;
                        })
                        .map((hand) => {
                            // detect hand pose
                            const prediction = this.models.poseModel!.predict(
                                tf.tensor2d([hand.serializeHand()])
                            ) as tf.Tensor;

                            hand.setPose(
                                this.models.getPoseLabel(
                                    prediction.dataSync() as Float32Array
                                )
                            );
                            return hand;
                        }),
                });
            });
    };

    onDragStart = (_hand: HandState, x: number, y: number) => {
        console.log("On drag start", [x, y]);
        const newClick = {
            centerX: x + Math.random() * 10 - 5,
            centerY: y + Math.random() * 10 - 5,
            x,
            y,
            startTime: Date.now(),
            size: 20,
            startSize: 20,
            endSize: 300 + (Math.random() * 100 - 50),
            active: true,
            lifetime: 1000 + (Math.random() * 500 - 250),
            color: [0, 0, 255],
        } as ClickState;

        setTimeout(() => {
            this.setState({
                clicks: ([] as ClickState[])
                    .concat(this.state.clicks)
                    .concat([newClick]),
            });
        }, 0);
    };

    onDrag = (_hand: HandState, x: number, y: number) => {
        console.log("On drag", [x, y]);
        const newClick = {
            centerX: x + Math.random() * 10 - 5,
            centerY: y + Math.random() * 10 - 5,
            x,
            y,
            startTime: Date.now(),
            size: 20,
            startSize: 20,
            endSize: 150 + (Math.random() * 100 - 50),
            active: true,
            lifetime: 3000 + (Math.random() * 500 - 250),
            color: [0, 255, 0],
        } as ClickState;

        setTimeout(() => {
            this.setState({
                clicks: ([] as ClickState[])
                    .concat(this.state.clicks)
                    .concat([newClick]),
            });
        }, 0);
    };

    onDrop = (_hand: HandState, x: number, y: number) => {
        console.log("On drag end", [x, y]);
    };

    onPinch = (hand: HandState, x: number, y: number) => {
        console.log("On pinch", hand);
        clickElementByCoordinates(x, y);

        const newClick = {
            centerX: x + Math.random() * 10 - 5,
            centerY: y + Math.random() * 10 - 5,
            x,
            y,
            startTime: Date.now(),
            size: 20,
            startSize: 20,
            endSize: 300 + (Math.random() * 100 - 50),
            active: true,
            lifetime: 1000 + (Math.random() * 500 - 250),
            color: [255, 0, 0],
        } as ClickState;

        setTimeout(() => {
            this.setState({
                clicks: ([] as ClickState[])
                    .concat(this.state.clicks)
                    .concat([newClick]),
            });
        }, 0);
    };

    onHandPoseChange = (pose: string) => {
        console.log("Hand pose:", pose);
    };

    clicksProcessing() {
        if (this.state.clicks.length > 0) {
            console.log(this.state.clicks.length);
            const clicks = this.state.clicks
                .map((click) => {
                    const r = Object.assign({}, click, {
                        size:
                            click.startSize +
                            ((click.endSize - click.startSize) *
                                (Date.now() - click.startTime)) /
                                (200 + (Math.random() * 50 - 25)),
                        active: click.size < click.endSize,
                    } as ClickState);
                    r.x = r.centerX - r.size / 2;
                    r.y = r.centerY - r.size / 2;
                    return r;
                })
                .filter((click) => click.active);
            this.setState({ clicks });
        }
        window.requestAnimationFrame(this.clicksProcessing.bind(this));
    }
}

export default App2;
