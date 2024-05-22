import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import Login from "./Login.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId="552662517962-8l975eoc5aqu4cjiopl8o2ukr1v6jd1o.apps.googleusercontent.com">
        <React.StrictMode>
            <Login />
        </React.StrictMode>
    </GoogleOAuthProvider>
);
