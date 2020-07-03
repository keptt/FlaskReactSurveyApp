/*
    Component showed when user is about to submit their response to a survey
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class SurveySubmit extends Component {
    submitAndContinue = (e) => {
        this.props.submitAnswers() && this.props.nextStep(e);
    }


    render() {
        return (
            <div class="container">
                <h1 style={{marginTop: '30px', marginBottom: '30px'}}>Submit the survey</h1>
                <p>You are about to submit the survey. You won't be abel
                    to change your answers afterwords. You can still make
                    amendmens to you answers. If you are ready to submit click
                    the button below:
                </p>
                <button className="btn btn-lg btn-success" type="button" style={btnStyle}  onClick={this.submitAndContinue}>Submit</button><br />
                <button className="btn btn-secondary" type="button" style={btnStyle}  onClick={this.props.prevStep}>Back</button>
            </div>
        )
    }
}


SurveySubmit.propTypes = {
    nextStep:        PropTypes.func.isRequired
    , prevStep:      PropTypes.func.isRequired
    , questions:     PropTypes.array.isRequired
    , submitAnswers: PropTypes.func.isRequired
};



const btnStyle= {
    marginBottom: '20px'
};
