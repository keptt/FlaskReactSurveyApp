/*
    Form to add general question data like name and description.
    Child of SurveyAddFrame
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class SurveyInfoAdd extends Component {
    onSubmit = (e) => {
        e.preventDefault();
        this.props.addSurvey();
    };


    render() {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <label>Name: </label><br />
                    <input className="form-control"
                            placeholder="Enter Survey Name..."
                            type="text"
                            name="surveyName"
                            value={this.props.surveyName}
                            onChange={this.props.handleChange}
                        /><br />
                    <label>Description: </label><br />
                    <textarea className="form-control"
                            placeholder="Enter Survey Description..."
                            name="surveyDescription"
                            value={this.props.surveyDescription}
                            onChange={this.props.handleChange}
                        />

                    <div>
                        <input className="btn btn-info btn-block"
                                type="submit"
                                name="addSurvey"
                                value="Confirm & Add Survey"
                                style={{marginTop: '20px', marginBottom: '20px'}}
                        />
                    </div>
                </form>
            </div>
        );
    }
}


SurveyInfoAdd.propTypes = {
    addSurvey:              PropTypes.func.isRequired
    , handleChange:         PropTypes.func.isRequired
    , surveyName:           PropTypes.string.isRequired
    , surveyDescription:    PropTypes.string.isRequired
};
