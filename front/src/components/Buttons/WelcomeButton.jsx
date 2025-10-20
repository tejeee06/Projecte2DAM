import React, { Children } from "react";
import "./WelcomeButton.css";

const WelcomeButton = ({children, onClick }) => {
    return(
        <button className="btn" onClick={onClick}>
            {children}
        </button>
    )
}

export default WelcomeButton;