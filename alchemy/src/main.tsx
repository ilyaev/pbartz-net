// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Alchemy.tsx";
import { store } from "./store";
import { Provider } from "react-redux";
import "./index.css";
import { SandBox } from "./components/sandbox";

ReactDOM.createRoot(document.getElementById("root")!).render(
    //   <React.StrictMode>
    <Provider store={store}>
        {document.location.hash.indexOf("sandbox") === -1 ? (
            <App />
        ) : (
            <SandBox />
        )}
    </Provider>
    //   </React.StrictMode>,
);
