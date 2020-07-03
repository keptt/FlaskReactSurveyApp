/*
    Display message agter successful survey creation plus the link to that survey.
    Child of SurveyFrame
*/
import React, { Component } from 'react';
import CopyToClipboard from '../layout/CopyToClipboard';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


export default class SurveyAddSuccess extends Component {
    render() {
        return (
            <div>
                <h1>Survey Submitted Successfully</h1>
                <hr />
                <div style={{marginBottom: '20px'}}>
                    <p>You can share this survey with the people you want using the following url:</p>
                </div>
                <CopyToClipboard field={this.props.surveyLink} />
                <button style={btnStyle} type="button" className="btn btn-outline-warning" onClick={this.props.prevStep}>
                    Add Another Survey
                </button>
                <Link to='/'>
                    <button className="btn btn-outline-success" type="button">
                        All Surveys
                    </button>
                </Link>
            </div>
        );
    }
}


SurveyAddSuccess.propTypes = {
    surveyLink: PropTypes.string.isRequired
    , prevStep:   PropTypes.func.isRequired
}


const btnStyle = {
    margin: '20px'
};
