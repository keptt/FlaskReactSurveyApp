import React, { Component } from 'react'
import PropTypes from 'prop-types'


export default class SurveyQuesion extends Component {
    render() {
        return (
            <div>
                <p>
                    { this.props.question }
                    <button style={btnStyle} onClick={this.props.delQuestion.bind(this, this.key)}>x</button>
                </p>
            </div>
        )
    }
}


SurveyQuesion.propTypes = {
    question: PropTypes.string.isRequired
}


const btnStyle = {
    background:     '#ff0000'
    , color:        '#fff'
    , border:       'none'
    , padding:      '5px 8px'
    , borderRadius: '50%'
    , cursor:       'pointer'
    , float:        'right'
}


