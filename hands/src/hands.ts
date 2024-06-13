import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import {
    calculateAngleBetweenLines,
    distance,
    distance3d,
    vectorSubtract,
} from "./utils";

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

    constructor() {}

    updateHand(hand: CustomHand) {
        this.hand = this.scaleHand(hand);
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
