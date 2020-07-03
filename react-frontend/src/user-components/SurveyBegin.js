/*
    Component with survey details which is the first one to be showed when user is about to respond to a survey
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class SurveyBegin extends Component {
    render() {
        return (
            <div className="container">
                <h1>Start the survey</h1>
                <h1><small>{ this.props.surveyName }</small></h1>
                <hr />
                <p>{ this.props.surveyDescription }</p>
                <p className="list-group-item list-group-item-success" style={listItemStyle}>Number of questions in this survey: <b>{ this.props.qtyOfQuestions }</b></p>
                <button className="btn btn-primary" onClick={this.props.nextStep}>Start Survey</button>
            </div>
        )
    }
}


SurveyBegin.propTypes = {
    nextStep:               PropTypes.func.isRequired
    , surveyName:           PropTypes.string.isRequired
    , surveyDescription:    PropTypes.string.isRequired
    , qtyOfQuestions:       PropTypes.number.isRequired
};


const listItemStyle = {
    backgroundColor: '#e8f4f8'
    , color: '#3590ae'
};
