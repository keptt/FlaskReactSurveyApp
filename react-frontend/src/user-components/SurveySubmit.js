import React, { Component } from 'react'
import PropTypes from 'prop-types'


export default class SurveySubmit extends Component {
    submitAndContinue = (e) => {
        // check if all questions are answered
        // POST to BACKEND this.props.questions
        this.props.nextStep(e);
    }


    render() {
        return (
            <div>
                <h1>Submit the survey</h1>
                <h2>You are about to submit the survey. You won't be abel
                    to change your answers afterwords. You can still make
                    amendmens to you answers. If you are ready to submit click
                    the button below:
                </h2>
                <button onClick={this.submitAndContinue}>Submit</button><br />
                <button onClick={this.props.prevStep}>Back</button>
            </div>
        )
    }
}


SurveySubmit.propTypes = {
    nextStep:       PropTypes.func.isRequired
    , prevStep:     PropTypes.func.isRequired
    , questions:    PropTypes.array.isRequired
}
