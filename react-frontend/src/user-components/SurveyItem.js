import React, { Component } from 'react'
import PropTypes from 'prop-types'


export default class SurveyItem extends Component {
    truncStr = (target, maxLen, endingSymb='') => {
        if (maxLen - endingSymb.length < 0) {
            return null;
        }
        return target.substring(0, maxLen - endingSymb.length) + endingSymb;
    }


    render() {
        return <div>
            <h3>{this.props.survey.name}</h3>
            <hr />
            <p>{this.truncStr(this.props.survey.desc, 200, '...')}</p>
        </div>;
    }
}


SurveyItem.propTypes = {
    survey: PropTypes.object.isRequired
}
