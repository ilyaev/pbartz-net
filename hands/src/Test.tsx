import React from "react";
import { HandController } from "../../../npm-module/react-hand-controller/src/HandController";

export class AppTest extends React.Component {
    render() {
        return (
            <>
                <HandController
                    passThroughPinchAsClick={true}
                    showMiniCamera={false}
                    showFeedback={true}
                    handGizmoConfig={{
                        showCenter: false,
                    }}
                />
                <div
                    style={{
                        backgroundColor: "black",
                        margin: "150px",
                        width: "900px",
                        height: "600px",
                    }}
                >
                    <button
                        onClick={() => {
                            console.log("CLICK");
                        }}
                        style={{ marginTop: "300px", marginLeft: "300px" }}
                    >
                        Click Me
                    </button>
                </div>
            </>
        );
    }
}
