import React from "react";
import "./App.css";
import { Camera } from "./Camera";
import * as tf from "@tensorflow/tfjs";
import { Canvas } from "./Canvas";
import { HUD } from "./HUD";
import { Training } from "./Training";
import { clickElementByCoordinates } from "./utils";
import { CustomHand, HandState } from "./hands";
import { HandModels, TrainingRecords } from "./models";
import {
    CanvasDrawingState,
    DRAW_OBJECT_TYPE,
    DrawCircleState,
    DrawObjectState,
} from "./drawings";
import { DraggableCardState, DraggableCards } from "./cards";

interface Props {}

interface State {
    hands: HandState[];
    poses: string[];
    training?: boolean;
    records?: TrainingRecords;
    trainingInProgress?: boolean;
    samplingInProgress?: boolean;
    canvasObjects: DrawObjectState[];
    cards: DraggableCardState[];
    loaded: boolean;
}

class App2 extends React.Component<Props, State> {
    state = {
        hands: [],
        poses: [],
        training: false,
        records: {} as TrainingRecords,
        trainingInProgress: false,
        canvasObjects: [] as DrawObjectState[],
        loaded: false,
        cards: [],
    } as State;

    cameraWidth = 120;
    cameraHeight = 80;
    canvasWidth = document.body.offsetWidth;
    canvasHeight = document.body.offsetHeight;

    models: HandModels = new HandModels();
    cards: DraggableCards = new DraggableCards();

    hands: { [s: string]: HandState } = {
        Left: new HandState(),
        Right: new HandState(),
    };

    drawings: CanvasDrawingState = new CanvasDrawingState();

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

        this.cards.hands = this.hands;

        this.drawings.onUpdate = (objects) => {
            this.setState({ canvasObjects: objects });
        };
        this.cards.onUpdate = (cards) => {
            this.setState({ cards });
        };
        this.cards.onCollide = this.onCardsCollide;
    }

    async componentDidMount() {
        try {
            await this.models.init();
            await this.drawings.init();
            this.setState({
                poses: this.models.poses,
                loaded: true,
                records: this.models.getRecords(),
            });
        } catch (e) {
            this.setState({ poses: [], records: {}, loaded: true });
        }
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
                <HUD
                    handsCount={this.state.hands.length}
                    hands={this.state.hands}
                    poses={this.state.poses}
                    cards={this.state.cards}
                    training={this.state.training}
                    key={"HUD"}
                    loaded={this.state.loaded}
                    onTrain={() => this.setState({ training: true })}
                    onCardClick={this.onCardClick.bind(this)}
                    clicks={
                        this.state.canvasObjects.filter(
                            (o) => o.type === DRAW_OBJECT_TYPE.Circle
                        ) as DrawCircleState[]
                    }
                />
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
            this.setState({
                samplingInProgress: false,
                poses: this.models.poses,
            });
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
        this.drawings.addBlip(x, y, { color: [0, 0, 255], lifetime: 200 });
    };

    onDrag = (_hand: HandState, x: number, y: number) => {
        this.drawings.addBlip(x, y, {
            color: [0, 255 - Math.random() * 60, 0],
            lifetime: 1000,
        });
    };

    onDrop = (_hand: HandState, x: number, y: number) => {
        this.drawings.addBlip(x, y, { color: [0, 0, 255], lifetime: 200 });
    };

    onPinch = (
        hand: HandState,
        x: number,
        y: number,
        isPinched: boolean = true
    ) => {
        clickElementByCoordinates(x, y, hand.handedness === "Left" ? 0 : 1);
        this.drawings.addBlip(x, y, {
            lifetime: 200,
        });
        if (!isPinched) {
            console.log(hand.pinchTrail);
            this.cards.releaseHand(hand.handedness, hand.pinchTrail);
        }
    };

    onHandPoseChange = (pose: string) => {
        console.log("Hand pose:", pose);
    };

    onCardClick = (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        const handness = event.detail === 0 ? "Left" : "Right";
        this.cards.updateCard(id, {
            handness,
            dragging: true,
        });
        console.log("Card clicked:", id, event);
    };

    onCardsCollide = (
        collisions: { [s: number]: number },
        cards: DraggableCardState[]
    ) => {
        let updatedCards = cards;
        Object.keys(collisions).forEach((id) => {
            const srcId = parseInt(id);
            const targetId = collisions[srcId];
            const srcCard = cards.find((c) => c.id === srcId);
            const targetCard = cards.find((c) => c.id === targetId);
            let flag = false;
            updatedCards = cards.map((card) => {
                if (
                    (card.id === srcId || card.id === targetId) &&
                    srcId % 2 === targetId % 2
                ) {
                    flag = true;
                    return {
                        ...card,
                        dragging: false,
                        active: false,
                    } as DraggableCardState;
                } else {
                    return card;
                }
            });
            if (flag) {
                const nextId = this.cards.nextId();
                updatedCards = updatedCards.concat({
                    id: nextId,
                    x: targetCard!.x + (srcCard!.x - targetCard!.x) / 2,
                    y: targetCard!.y + (srcCard!.y - targetCard!.y) / 2,
                    size: 100,
                    velocity: 0,
                    direction: [0, 0],
                    acceleration: 0,
                    dragging: false,
                    active: true,
                    handness: "",
                    label: `Card ${nextId}`,
                } as DraggableCardState);
            }
        });
        return updatedCards.filter((card) => card.active);
    };
}

export default App2;
