import React from "react";
import "./App.css";
import { Camera } from "./Camera";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import * as tf from "@tensorflow/tfjs";
// import "@tensorflow/tfjs-backend-webgl";
import { Canvas } from "./Canvas";
import { HUD } from "./HUD";
import { Training, TrainingRecords } from "./Training";
import { calculateAngleBetweenLines, clickElementByCoordinates } from "./utils";
import { CustomHand } from "./hands";
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
}

interface Props {}
interface State {
    hands: CustomHand[];
    poses: string[];
    training?: boolean;
    records?: TrainingRecords;
    trainingInProgress?: boolean;
    samplingInProgress?: boolean;
    clicks: ClickState[];
}

class App extends React.Component<Props, State> {
    state = {
        hands: [],
        poses: [],
        training: false,
        records: {} as TrainingRecords,
        trainingInProgress: false,
        clicks: [] as ClickState[],
    } as State;
    model = handPoseDetection.SupportedModels.MediaPipeHands;
    detector?: handPoseDetection.HandDetector;

    poseModel?: tf.LayersModel;

    cameraWidth = 120;
    cameraHeight = 80;

    poseModelName = "hands";

    canvasWidth = document.body.offsetWidth;
    canvasHeight = document.body.offsetHeight;

    poses: string[] = [];

    poseBuffer: { [s: string]: string[] } = {
        Left: [],
        Right: [],
    };
    poseBufferLength = 10;

    constructor(props: Props) {
        super(props);
        this.cameraWidth = this.canvasWidth * 0.1;
        this.cameraHeight = this.canvasHeight * 0.1;
    }

    async loadPoseModel() {
        try {
            this.poseModel = await tf.loadLayersModel(
                `localstorage://${this.poseModelName}`
            );
        } catch (e) {
            this.poseModel = undefined;
        }
    }

    async componentDidMount() {
        await this.loadPoseModel();
        try {
            const records = this.getRecords();
            this.poses = Object.keys(records);
            this.setState({ poses: this.poses, records });
        } catch (e) {
            this.setState({ poses: [], records: {} });
            console.log(e);
        }
        this.detector = await handPoseDetection.createDetector(this.model, {
            runtime: "tfjs",
        });
        this.processing();
    }

    processing() {
        if (this.state.clicks.length > 0) {
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
        window.requestAnimationFrame(this.processing.bind(this));
    }

    render() {
        // console.log("R: App");
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
                                await this.loadPoseModel();
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
                {this.state.hands.length > 0 &&
                    !this.state.training &&
                    !this.state.trainingInProgress &&
                    this.renderHandsDebug()}
            </>
        );
    }

    renderHandsDebug() {
        return (
            <div
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    alignItems: "end",
                    backgroundColor: "rgba(0, 0, 0, 0.001)",
                    color: "white",
                    padding: "20px",
                }}
            >
                {this.state.hands.map((hand, i) => {
                    return (
                        <div
                            key={i}
                            style={{
                                width: "400px",
                                marginBottom: "10px",
                                pointerEvents: "none",
                            }}
                        >
                            <div>
                                <span>Hand: {hand.handedness}</span>
                            </div>
                            <div>
                                <span>
                                    Pose: {hand.pose} ({hand.score})
                                </span>
                            </div>
                            <div>
                                <span>
                                    Center: {hand.center.x.toFixed(2)},{" "}
                                    {hand.center.y.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span>
                                    Center 3D: {hand.center3d.x.toFixed(4)},{" "}
                                    {hand.center3d.y.toFixed(4)},{" "}
                                    {hand.center3d.z.toFixed(4)}
                                </span>
                            </div>
                            <div>
                                <span>
                                    Thumb length:{" "}
                                    {this.distanceToNode3d(hand, 5, 8).toFixed(
                                        4
                                    )}
                                </span>
                            </div>
                            <div>
                                <span>
                                    Pinch:{" "}
                                    {this.distanceToNode3d(hand, 4, 8).toFixed(
                                        4
                                    )}
                                </span>
                            </div>
                            <div>
                                <span>
                                    Pinch 2D:{" "}
                                    {this.distanceToNode(hand, 4, 8).toFixed(4)}
                                </span>
                            </div>
                            <div>
                                <span>
                                    t2center3d:{" "}
                                    {this.distanceToCenter3d(hand, 8).toFixed(
                                        4
                                    )}
                                </span>
                            </div>
                            <div>
                                <span>
                                    Angle: {this.handTipDirectionAngle(hand)}{" "}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    getRecords = () => {
        try {
            const records = JSON.parse(localStorage.getItem(`records`) || "{}");
            return records as TrainingRecords;
        } catch (e) {
            return {} as TrainingRecords;
        }
    };

    setRecords(records: TrainingRecords) {
        localStorage.setItem(`records`, JSON.stringify(records));
        this.poses = Object.keys(records);
        this.setState({ poses: this.poses, records });
    }

    onAddSample = (samples: CustomHand[], label: string) => {
        if (samples.length > 0) {
            const records = this.getRecords();
            records[label] = ([] as number[][])
                .concat(records[label] || [])
                .concat(samples.map(this.serializeHand));
            this.setRecords(records);
        }
        setTimeout(() => {
            this.setState({ samplingInProgress: false });
        }, 0);
    };

    onDeleteSample = (label: string) => {
        const records = this.getRecords();
        delete records[label];
        this.setRecords(records);
    };

    scanVideo = (video: HTMLVideoElement) => {
        this.detector
            ?.estimateHands(video, { flipHorizontal: true })
            .then((hands) => {
                if (hands.length === 0 && this.state.hands.length === 0) {
                    return;
                }
                this.setState({
                    hands: hands.map(this.scaleHand).map((hand) => {
                        const prediction = this.poseModel!.predict(
                            tf.tensor2d([this.serializeHand(hand)])
                        ) as tf.Tensor;
                        const predictionData = prediction.dataSync();
                        hand.pose = this.getPoseLabel(
                            predictionData as Float32Array,
                            this.poses
                        );
                        this.poseBuffer[hand.handedness] = this.poseBuffer[
                            hand.handedness
                        ]
                            .concat([hand.pose])
                            .slice(-this.poseBufferLength);
                        const poses = this.poseBuffer[hand.handedness].reduce(
                            (res, v) => {
                                res[v] = (res[v] || 0) + 1;
                                return res;
                            },
                            {} as { [s: string]: number }
                        );
                        const maxNumber = Math.max(...Object.values(poses));
                        const maxPose = Object.keys(poses).find((k) =>
                            poses[k] === maxNumber ? true : false
                        );
                        hand.pose = maxPose || hand.pose;
                        setTimeout(() => {
                            this.onHandPose(hand);
                        }, 0);
                        return hand;
                    }),
                });
            });
    };

    onHandPose = (hand: CustomHand) => {
        if (hand.pose === "pinch") {
            const tip = hand.keypoints3D![8];
            const thumb = hand.keypoints3D![4];
            // const knuckle = hand.keypoints3D![7];
            // const knuckle2 = hand.keypoints3D![3];

            // const fingerLength = this.distance3d(
            //     knuckle.x,
            //     knuckle.y,
            //     knuckle.z!,
            //     knuckle2.x,
            //     knuckle2.y,
            //     knuckle2.z!
            // );
            const pinchLength = this.distance3d(
                tip.x,
                tip.y,
                tip.z!,
                thumb.x,
                thumb.y,
                thumb.z!
            );

            // const fingerLength2d = this.distance(
            //     hand.keypoints[7].x,
            //     hand.keypoints[7].y,
            //     hand.keypoints[8].x,
            //     hand.keypoints[8].y
            // );
            // const pinchLength2d = this.distance(
            //     hand.keypoints[8].x,
            //     hand.keypoints[8].y,
            //     hand.keypoints[4].x,
            //     hand.keypoints[4].y
            // );

            // const pinch = (pinchLength / fingerLength) * 100;
            // const pinch2d = (pinchLength2d / fingerLength2d) * 100;

            // const tipAngle = this.handTipDirectionAngle(hand);

            // if (pinch < 80) {
            // if (pinch2d < 80) {
            if (pinchLength < 0.02) {
                const tip2d = hand.keypoints[8];
                const thumb2d = hand.keypoints[4];
                this.onPinch(
                    tip2d.x + (thumb2d.x - tip2d.x) / 2,
                    tip2d.y + (thumb2d.y - tip2d.y) / 2
                );
            }
        }
    };

    onPinch = (x: number, y: number) => {
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
        } as ClickState;

        setTimeout(() => {
            this.setState({
                clicks: ([] as ClickState[])
                    .concat(this.state.clicks)
                    .concat([newClick]),
            });
        }, 0);
    };

    handTipDirectionAngle = (hand: CustomHand) => {
        const angle = calculateAngleBetweenLines(
            0,
            0,
            0,
            1,
            0,
            0,
            hand.keypoints3D![5].x,
            hand.keypoints3D![5].y,
            hand.keypoints3D![5].z!,
            hand.keypoints3D![8].x,
            hand.keypoints3D![8].y,
            hand.keypoints3D![8].z!
        );
        return angle;
    };

    getPoseLabel = (predictionData: Float32Array, poses: string[]) => {
        const mv = Math.max(...predictionData);
        if (mv > 0.6) {
            return poses[predictionData.findIndex((v) => v === mv)];
        }
        {
            return "Unknown";
        }
    };

    scaleHand = (hand: handPoseDetection.Hand): CustomHand => {
        let allX = 0;
        let allY = 0;
        const res = {
            ...hand,
            keypoints: hand.keypoints.map((keypoint) => {
                allX += keypoint.x;
                allY += keypoint.y;
                return {
                    ...keypoint,
                    x: keypoint.x / 0.1,
                    y: keypoint.y / 0.1,
                };
            }),
        } as CustomHand;
        res.center = {
            x: allX / hand.keypoints.length / 0.1,
            y: allY / hand.keypoints.length / 0.1,
        };
        let all3dX = 0.0;
        let all3dY = 0.0;
        let all3dZ = 0.0;

        hand.keypoints3D?.forEach((keypoint) => {
            all3dX += keypoint.x;
            all3dY += keypoint.y;
            all3dZ += keypoint.z!;
        });

        res.center3d = {
            x: all3dX / hand.keypoints3D!.length,
            y: all3dY / hand.keypoints3D!.length,
            z: all3dZ / hand.keypoints3D!.length,
        };
        return res;
    };

    distance = (x1: number, y1: number, x2: number, y2: number) => {
        const xDiff = x2 - x1;
        const yDiff = y2 - y1;
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    };

    distance3d = (
        x1: number,
        y1: number,
        z1: number,
        x2: number,
        y2: number,
        z2: number
    ) => {
        const xDiff = x2 - x1;
        const yDiff = y2 - y1;
        const zDiff = z2 - z1;
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
    };

    distanceToNode3d = (hand: CustomHand, nodeFrom: number, nodeTo: number) => {
        hand.keypoints3D![4].z = hand.keypoints3D![8].z;

        return this.distance3d(
            hand.keypoints3D![nodeFrom].x,
            hand.keypoints3D![nodeFrom].y,
            hand.keypoints3D![nodeFrom].z!,
            hand.keypoints3D![nodeTo].x,
            hand.keypoints3D![nodeTo].y,
            hand.keypoints3D![nodeTo].z!
        );
    };

    distanceToCenter3d = (hand: CustomHand, nodeTo: number) => {
        return this.distance3d(
            hand.keypoints3D![nodeTo].x,
            hand.keypoints3D![nodeTo].y,
            hand.keypoints3D![nodeTo].z!,
            0,
            0,
            0
        );
    };

    distanceToNode = (hand: CustomHand, nodeFrom: number, nodeTo: number) => {
        return this.distance(
            hand.keypoints[nodeFrom].x,
            hand.keypoints[nodeFrom].y,
            hand.keypoints[nodeTo].x,
            hand.keypoints[nodeTo].y
        );
    };

    serializeHand = (hand: CustomHand) => {
        return this.serializeHand3D(hand);
        // const center = hand.center;
        // const distances = hand.keypoints.map((kp) => {
        //     return this.distance(kp.x, kp.y, center.x, center.y);
        // });
        // const maxDistance = Math.max(...distances);
        // const minDistance = Math.min(...distances);
        // const normalizedDistances = distances.map((d) => {
        //     return (d - minDistance) / (maxDistance - minDistance);
        // });
        // this.serializeHand3D(hand);
        // return normalizedDistances;
    };

    vectorSubtract = (a: number[], b: number[]) => {
        return a.map((v, i) => v - b[i]);
    };

    serializeHand3D = (hand: CustomHand) => {
        const center = hand.center3d;
        const vectors = hand.keypoints3D!.map((kp) => {
            return this.vectorSubtract(
                [kp.x, kp.y, kp.z!],
                [center.x, center.y, center.z]
            );
        });
        const vector = vectors.reduce((res, v) => {
            return res.concat(v);
        }, [] as number[]);
        const max = Math.max(...vector);
        const min = Math.min(...vector);
        const normalized = vector.map((v) => (v - min) / (max - min));
        return normalized;
    };
}

export default App;
