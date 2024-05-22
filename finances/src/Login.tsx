import React, { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import App from "./App";

function Login() {
    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState([]);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            localStorage.setItem("access_token", codeResponse.access_token);
            setUser(codeResponse);
        },
        onError: (error) => console.log("Login Failed:", error),
    });

    useEffect(() => {
        if (user && user.access_token) {
            axios
                .get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: "application/json",
                        },
                    }
                )
                .then((res) => {
                    localStorage.setItem(
                        "email",
                        JSON.stringify(res.data.email)
                    );
                    setProfile(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    return localStorage.getItem("email") ? (
        <App />
    ) : (
        <>
            <div style={{ height: "40vh" }}></div>
            <div className="loginform">
                <h1>Spending Spree</h1>
                <button onClick={login}>Sign in with Google </button>
            </div>
        </>
    );
}
export default Login;
