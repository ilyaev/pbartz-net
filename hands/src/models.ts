import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import * as tf from "@tensorflow/tfjs";

export interface TrainingRecords {
    [s: string]: number[][];
}

export class HandModels {
    model = handPoseDetection.SupportedModels.MediaPipeHands;
    detector?: handPoseDetection.HandDetector;
    poseModel?: tf.LayersModel;
    poseModelName = "hands";
    poses: string[] = [];

    constructor() {}

    async init() {
        await this.loadPoseModel();
        const records = this.getRecords();
        this.poses = Object.keys(records);
        this.detector = await handPoseDetection.createDetector(this.model, {
            runtime: "tfjs",
        });
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
    }

    getPoseLabel = (predictionData: Float32Array) => {
        const mv = Math.max(...predictionData);
        if (mv > 0.6) {
            return this.poses[predictionData.findIndex((v) => v === mv)];
        }
        return "Unknown";
    };
}
