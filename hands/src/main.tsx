// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AppTest } from "./Test.tsx";
import "semantic-ui-css/semantic.min.css";
import "./index.css";

const isTest = document.location.hash.includes("test") ? true : false;

ReactDOM.createRoot(document.getElementById("root")!).render(
    //   <React.StrictMode>
    isTest ? <AppTest key={"APP"} /> : <App key={"APP"} />
    //   </React.StrictMode>,
);
