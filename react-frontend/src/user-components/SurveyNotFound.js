/*
    Component is showed if survey hash that user passes inside url does not exist
*/
import React, { Component } from 'react';


export default class PageNotFound extends Component {
    render() {
        return (
            <div>
                <h1>Oops..!</h1>
                <h2>Survey that you asked for does not exist</h2>
            </div>
        )
    }
}
