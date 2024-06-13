import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import {
    calculateAngleBetweenLines,
    distance,
    distance3d,
    vectorSubtract,
} from "./utils";

export enum HAND_POSE {
    Pinch = "pinch",
    Hold = "hold",
    Five = "five",
}

export interface CustomHand extends handPoseDetection.Hand {
    center: {
        x: number;
        y: number;
    };
    center3d: {
        x: number;
        y: number;
        z: number;
    };
    pose: string;
}

export class HandState {
    hand: CustomHand = {} as CustomHand;
    pose: string = "";
    prevPose: string = "";
    handedness: string = "";
    poseBuffer: string[] = [];
    poseBufferLength = 10;
    onPoseChange?: (pose: string, hand?: HandState) => void;
    onPinch?: (hand: HandState, x: number, y: number) => void;
    onDragStart?: (hand: HandState, x: number, y: number) => void;
    onDrag?: (hand: HandState, x: number, y: number) => void;
    onDrop?: (hand: HandState, x: number, y: number) => void;
    isPinching: boolean = false;
    isHolding: boolean = false;

    constructor() {}

    updateHand(hand: CustomHand) {
        this.hand = this.scaleHand(hand);
        this.handedness = hand.handedness;
    }

    setPose(pose: string) {
        if (!pose) {
            this.poseBuffer = [];
            this.pose = "";
            this.hand.pose = "";
            this.prevPose = "";
            return;
        }
        this.poseBuffer = this.poseBuffer
            .concat([pose])
            .slice(-this.poseBufferLength);
        const poses = this.poseBuffer.reduce((res, v) => {
            res[v] = (res[v] || 0) + 1;
            return res;
        }, {} as { [s: string]: number });

        const maxNumber = Math.max(...Object.values(poses));
        const maxPose = Object.keys(poses).find((k) =>
            poses[k] === maxNumber ? true : false
        );

        const newPose = maxPose || pose;
        this.pose = newPose;
        this.hand.pose = newPose;

        if (newPose !== this.prevPose) {
            if (this.onPoseChange) {
                this.onPoseChange(newPose, this);
            }
        }

        switch (newPose) {
            case HAND_POSE.Pinch:
                if (this.distanceToNode3d(8, 4) < 0.02) {
                    if (!this.isPinching) {
                        this.isPinching = true;
                        if (this.onPinch) {
                            const tip2d = this.hand.keypoints[8];
                            const thumb2d = this.hand.keypoints[4];
                            const x = tip2d.x + (thumb2d.x - tip2d.x) / 2;
                            const y = tip2d.y + (thumb2d.y - tip2d.y) / 2;
                            this.onPinch(this, x, y);
                        }
                    }
                } else {
                    if (this.isPinching) {
                        this.isPinching = false;
                    }
                }
                break;
            case HAND_POSE.Hold:
                if (!this.isHolding && this.prevPose === HAND_POSE.Five) {
                    this.isHolding = true;
                    if (this.onDragStart) {
                        this.onDragStart(
                            this,
                            this.hand.center.x,
                            this.hand.center.y
                        );
                    }
                }
                break;
            default:
                break;
        }

        if (this.isPinching && newPose !== HAND_POSE.Pinch) {
            this.isPinching = false;
        }

        if (this.isHolding && newPose !== HAND_POSE.Hold) {
            this.isHolding = false;
            if (this.onDrop) {
                this.onDrop(this, this.hand.center.x, this.hand.center.y);
            }
        }

        if (this.isHolding && this.onDrag) {
            this.onDrag(this, this.hand.center.x, this.hand.center.y);
        }

        this.prevPose = newPose;
    }

    scaleHand = (hand: CustomHand): CustomHand => {
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

    serializeHand = (hand?: CustomHand) => {
        return this.serializeHand3D(hand || this.hand);
    };

    serializeHand3D = (hand: CustomHand) => {
        const center = hand.center3d;
        const vectors = hand.keypoints3D!.map((kp) => {
            return vectorSubtract(
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

    distanceToNode3d = (nodeFrom: number, nodeTo: number) => {
        const hand = this.hand;
        hand.keypoints3D![4].z = hand.keypoints3D![8].z;

        return distance3d(
            hand.keypoints3D![nodeFrom].x,
            hand.keypoints3D![nodeFrom].y,
            hand.keypoints3D![nodeFrom].z!,
            hand.keypoints3D![nodeTo].x,
            hand.keypoints3D![nodeTo].y,
            hand.keypoints3D![nodeTo].z!
        );
    };

    distanceToCenter3d = (nodeTo: number) => {
        const hand = this.hand;
        return distance3d(
            hand.keypoints3D![nodeTo].x,
            hand.keypoints3D![nodeTo].y,
            hand.keypoints3D![nodeTo].z!,
            0,
            0,
            0
        );
    };

    distanceToNode = (nodeFrom: number, nodeTo: number) => {
        const hand = this.hand;
        return distance(
            hand.keypoints[nodeFrom].x,
            hand.keypoints[nodeFrom].y,
            hand.keypoints[nodeTo].x,
            hand.keypoints[nodeTo].y
        );
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
}
