/*
    Showed if survey was submitted with no errors
*/
import React, { Component } from 'react';

export default class SurveySuccessfulSubmition extends Component {
    render() {
        return (
            <div class="container">
                <h1>Submitted successfully</h1>
                <h1><small>Thank you for participating in our survey!</small></h1>
            </div>
        )
    }
}
