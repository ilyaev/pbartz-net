import React from "react";
import "react-data-grid/lib/styles.css";

import DataGrid from "react-data-grid";
import { CustomHand, HandState } from "./hands";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import {
    Button,
    Form,
    FormField,
    Segment,
    SegmentGroup,
} from "semantic-ui-react";
import { TrainingRecords } from "./models";

export interface TrainConfig {
    epochs: number;
    neurons: number;
    layers: number;
}

interface DataRow {
    label: string;
    count: number;
    action: string;
}

interface Props {
    onClose: (reload?: boolean) => void;
    records: TrainingRecords;
    onAddSample: (samples: CustomHand[], label: string) => void;
    onDeleteSample: (label: string) => void;
    onTraining: (start?: boolean) => void;
    onSampling: (start?: boolean) => void;
    hands: HandState[];
}
interface State {
    label: string;
    frames: string;
    currentFrame: number;
    epoch: string;
    neurons: string;
    layers: string;
    training?: boolean;
}

export class Training extends React.Component<Props, State> {
    state = {
        label: "",
        frames: "100",
        currentFrame: 0,
        epoch: "100",
        neurons: "150",
        layers: "1",
        training: false,
    };

    timerId: number = 0;
    recordings: CustomHand[] = [];

    shouldComponentUpdate(
        nextProps: Readonly<Props>,
        nextState: Readonly<State>
    ): boolean {
        if (nextProps.records !== this.props.records) {
            return true;
        }
        if (
            this.state.currentFrame > 0 &&
            nextProps.hands !== this.props.hands
        ) {
            return true;
        }
        if (nextState !== this.state) {
            return true;
        }
        return false;
    }

    render() {
        if (this.state.training) {
            return null;
        }
        // console.log("R: TRAINING");
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
                    // backgroundColor: "rgb(0,0,0)",
                    alignItems: "end",
                }}
            >
                <div
                    style={{
                        border: "1px solid grey",
                        padding: "10px",
                        height: "100vh",
                        width: "50vw",
                        backgroundColor: `rgba(255,255,255,${
                            this.state.currentFrame > 0 ? 0.1 : 0.5
                        })`,
                    }}
                >
                    <div style={{ marginBottom: "10px" }}>
                        <Button secondary onClick={() => this.props.onClose()}>
                            Close
                        </Button>
                    </div>
                    {this.renderPoses()}
                </div>
            </div>
        );
    }

    formField(field: keyof State, label: string) {
        return (
            <FormField>
                <label>{label}</label>
                <input
                    value={this.state[field] + ""}
                    onChange={(e) =>
                        this.setState({
                            [field]: e.target.value,
                        } as any)
                    }
                ></input>
            </FormField>
        );
    }

    startSampling() {
        this.props.onSampling(true);
        this.recordings = [];
        const label = this.state.label.trim();
        const frames = parseInt(this.state.frames);
        if (!label || isNaN(frames)) {
            return;
        }
        this.setState({
            currentFrame: 0,
        });
        this.sampleCycle();
    }

    sampleCycle() {
        setTimeout(() => {
            const frame = this.state.currentFrame;
            this.setState({
                currentFrame: frame + 1,
            });
            if (frame < parseInt(this.state.frames)) {
                if (this.props.hands[0]) {
                    this.recordings.push(this.props.hands[0].hand);
                }
                this.sampleCycle();
            } else {
                this.setState({ currentFrame: 0 });
                this.props.onAddSample(this.recordings, this.state.label);
            }
        }, 50);
    }

    async trainModel(
        config: TrainConfig = { epochs: 100, neurons: 150, layers: 1 }
    ) {
        const model = tf.sequential();
        const data = [] as any[];

        Object.keys(this.props.records).forEach((title, index1) => {
            this.props.records[title].forEach((record) => {
                data.push({
                    input: record,
                    label: Object.keys(this.props.records).map((_r, index2) =>
                        index1 === index2 ? 1 : 0
                    ),
                });
            });
        });

        // Add Input Layer
        model.add(
            tf.layers.dense({
                inputShape: [data[0].input.length],
                units: 1,
                useBias: true,
            })
        );

        // Add hidden layer(s)
        for (let i = 0; i < config.layers; i++) {
            model.add(
                tf.layers.dense({
                    units: config.neurons,
                    activation: "relu",
                })
            );
        }

        // Add an output layer
        model.add(
            tf.layers.dense({
                units: Object.keys(this.props.records).length,
                // activation: "softmax",
                useBias: true,
            })
        );

        model.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.softmaxCrossEntropy,
            metrics: ["mse"],
        });

        const batchSize = 32;
        const epochs = config.epochs;

        tfvis.show.modelSummary({ name: "Model Summary" }, model);

        const convertTensors = (data: any) => {
            tf.util.shuffle(data);

            const inputTensor = tf.tensor2d(data.map((d: any) => d.input));
            const labelTensor = tf.tensor2d(data.map((d: any) => d.label));

            return { inputTensor, labelTensor };
        };

        const { inputTensor, labelTensor } = convertTensors(data);

        this.setState({
            training: true,
        });

        this.props.onTraining(true);

        tfvis.visor().open();

        await model.fit(inputTensor, labelTensor, {
            batchSize,
            epochs,
            shuffle: true,
            callbacks: tfvis.show.fitCallbacks(
                { name: "Training Performance" },
                ["loss"],
                { height: 200, callbacks: ["onEpochEnd"] }
            ),
        });

        await model.save("localstorage://hands");

        this.setState({
            training: false,
        });

        tfvis.visor().close();
        this.props.onClose(true);
        this.props.onTraining(false);
    }

    renderPoses() {
        const columns = [
            {
                key: "label",
                name: "Label",
            },
            {
                key: "count",
                name: "Samples",
            },
            {
                key: "action",
                name: "Action",
                renderCell: (props: { row: DataRow }) => {
                    return (
                        <div style={{ padding: "0px" }}>
                            <Button
                                secondary
                                onClick={() =>
                                    this.props.onDeleteSample(props.row.label)
                                }
                            >
                                Delete
                            </Button>
                        </div>
                    );
                },
            },
        ];

        const rows = Object.keys(this.props.records).map((key) => {
            return {
                label: key,
                count: this.props.records[key].length,
                action: "Delete",
            };
        });

        return (
            <SegmentGroup>
                <Segment>
                    <Form>
                        <SegmentGroup horizontal>
                            <Segment>
                                {this.formField("label", "Label")}
                            </Segment>
                            <Segment>
                                {this.formField("frames", "Frames")}
                            </Segment>
                            <Segment textAlign="center">
                                <div style={{ paddingTop: "12px" }}>
                                    <Button
                                        primary
                                        onClick={this.startSampling.bind(this)}
                                        disabled={
                                            this.state.currentFrame
                                                ? true
                                                : false
                                        }
                                    >
                                        {this.state.currentFrame
                                            ? `Sampling...${this.state.currentFrame}`
                                            : "Add Samples"}
                                    </Button>
                                </div>
                            </Segment>
                        </SegmentGroup>
                    </Form>
                </Segment>
                {this.state.currentFrame > 0 || (
                    <Segment>
                        <DataGrid
                            columns={columns}
                            rows={rows}
                            rowHeight={50}
                            className={"fill-grid rdg-light"}
                        />
                    </Segment>
                )}
                {this.state.currentFrame > 0 || (
                    <Segment>
                        <Form>
                            <SegmentGroup horizontal>
                                <Segment>
                                    {this.formField("neurons", "Neurons")}
                                </Segment>
                                <Segment>
                                    {this.formField("layers", "Layers")}
                                </Segment>
                                <Segment>
                                    {this.formField("epoch", "Epoch")}
                                </Segment>
                                <Segment textAlign="center">
                                    <div style={{ paddingTop: "12px" }}>
                                        <Button
                                            primary
                                            disabled={this.state.training}
                                            onClick={() =>
                                                this.trainModel({
                                                    epochs: parseInt(
                                                        this.state.epoch
                                                    ),
                                                    neurons: parseInt(
                                                        this.state.neurons
                                                    ),
                                                    layers: parseInt(
                                                        this.state.layers
                                                    ),
                                                })
                                            }
                                        >
                                            {this.state.training
                                                ? "Training..."
                                                : "Train Model"}
                                        </Button>
                                    </div>
                                </Segment>
                            </SegmentGroup>
                        </Form>
                    </Segment>
                )}
            </SegmentGroup>
        );
    }
}
