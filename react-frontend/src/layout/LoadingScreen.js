/*
    Loading Screen to be displayed during calls to backend rest api
*/
import React from "react";
import ReactLoading from "react-loading";


export default class LoadingScreen extends React.Component {
    render() {
        return (
        <div style={centerOnPageStyle}>
            <ReactLoading type={"bars"} color={"#d3d3d3"} />
        </div>
        );
    }
}


const centerOnPageStyle = {
    position: 'absolute'
    , left: '50%'
    , top: '50%'
    , transform: 'translate(-50%, -50%)'
};


