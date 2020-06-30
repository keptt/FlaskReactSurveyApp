import React, { Component } from 'react'
import PropTypes from 'prop-types'


export default class SurveyBegin extends Component {
    render() {
        return (
            <div>
                <h1>Start the survey</h1>
                <button onClick={this.props.nextStep}>Start Survey</button>
            </div>
        )
    }
}


SurveyBegin.propTypes = {
    nextStep:       PropTypes.func.isRequired
}
