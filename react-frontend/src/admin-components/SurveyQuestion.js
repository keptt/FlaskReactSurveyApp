/*
    Display single question added to the survey. Component also issues a delete question signal to the perent
    Child of SurveyAddFrame.
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class SurveyQuesion extends Component {
    render() {
        return (
            <div>
                <div className="list-group-item" style={{border: "none"}}>
                    <button type="button" className="close" data-dismiss="alert" onClick={this.props.delQuestion.bind(this, this.props.questionId)}><span>&times;</span></button>
                    { this.props.question }
                </div>
            </div>
        )
    }
}


SurveyQuesion.propTypes = {
    question:       PropTypes.string.isRequired
    , delQuestion:  PropTypes.func.isRequired
};

