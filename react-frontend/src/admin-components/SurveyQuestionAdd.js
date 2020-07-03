/*
    Form for adding a question to the survey.
    Child of SurveyAddFrame.
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class SurveyQuestionAdd extends Component {


    onSubmit = (e) => {
        e.preventDefault();
        this.props.addQuestion();
    }


    render() {
        return (
            <React.Fragment>
                <label>Questions: </label><br />
                <form onSubmit={this.onSubmit} >
                    <div className="form-group">
                        <textarea className="form-control"
                                name="questionText"
                                placeholder="Add a question to Survey..."
                                value={this.props.questionText}
                                onChange={this.props.handleChange}
                                style={{flex: '10', padding: '5px'}}
                            />
                        <div className="text-right">
                            <input className="btn btn-primary"
                                type="submit"
                                name="addQuestion"
                                value="Add"
                                style={{marginTop: '10px'}}
                                />
                        </div>
                    </div>
                </form>
            </React.Fragment>
        )
    }
}


SurveyQuestionAdd.propTypes = {
    addQuestion:    PropTypes.func.isRequired
    , handleChange: PropTypes.func.isRequired
    , questionText: PropTypes.string.isRequired
};
