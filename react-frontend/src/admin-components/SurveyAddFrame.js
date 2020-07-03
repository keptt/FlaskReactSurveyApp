/*
    Frame displays survey creation forms and holds its successful submit component
*/
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import SurveyQuestion from './SurveyQuestion';
import SurveyInfoAdd from './SurveyInfoAdd';
import SurveyQuestionAdd from './SurveyQuestionAdd';
import SurveyAddSuccess from './SurveyAddSuccess';
import LoadingScreen from '../layout/LoadingScreen';
import config from '../config';


export default class SurveyAddFrame extends Component {
    state = {
        surveyName: ''
        , surveyDescription: ''
        , questionText: ''
        , questions: []
        , step: 1
        , surveyHash: ''
        , isLoading: false
    }


    delQuestion = (id) => {
        this.setState({questions: this.state.questions.filter((question, i) => i !== id)});
    };


    addQuestion = () => {
        if (!this.state.questionText) {
            this.props.setErrorMsg('Question Text cannot be empty!');
            return;
        }
        else if (this.state.questionText.length > config.maxQuestionLenght) {
            this.props.setErrorMsg(`Question Text cannot exceed ${config.maxQuestionLenght} characters!`);
            return;
        }
        // push question to the beggining of questions list; user sees last added question first,
        // however the questions in the actual survey will be posted in the order of addition
        // First question that user added will be first question in the survey
        this.setState({ questions: [this.state.questionText, ...this.state.questions] });
        this.setState({questionText: ''});
    };


    handleChange = (e) => (
        this.setState({[e.target.name]: e.target.value})
    );


    prevStep = () => {
        this.setState({step: this.state.step - 1});
    };


    addSurvey = () => {
        // Conduct sanity checks before adding a survey
        if (!this.state.surveyName || !this.state.surveyDescription) {
            this.props.setErrorMsg('Survey Name and Description cannot be empty!');
            return;
        }
        else if (!this.state.surveyName.length > config.maxSurveyNameLength) {
            this.props.setErrorMsg(`Survey Name cannot exceed ${config.maxSurveyNameLength} characters!`);
            return;
        }
        else if (!this.state.surveyDescription.length > config.maxSurveyDescriptionLength) {
            this.props.setErrorMsg(`Survey Description cannot exceed ${config.maxSurveyDescriptionLength} characters!`);
            return;
        }
        else if (!this.state.questions.length) {
            this.props.setErrorMsg('Survey must have at least one question!');
            return;
        }
        else if (this.state.questions.length > config.maxQuestionsQty) {
            this.props.setErrorMsg(`Number of questions cannot exceed ${config.maxQuestionsQty}!`);
            return;
        }

        const isDuplicate = this.state.questions.some((question, i) => (this.state.questions.indexOf(question) !== i));
        if (isDuplicate) {
            this.props.setErrorMsg('All questions must be unique!');
            return;
        }

        // prepare survey object to send to the backend
        const surveyJsonObj = {
            name: this.state.surveyName
            , description: this.state.surveyDescription
            , questions: this.state.questions.reverse()     // reverse list to get the order in which items were added to the list of questions
        };

        this.props.setIsLoading(true);  // fire loading screen
        this.setState({isLoading: true});

        axios.post(`${config.apiUrl}/surveys`, surveyJsonObj, config.createHeaders())
            .then(res => {
                            this.setState({step: 2          // go to success page
                                            , isLoading: false
                                            , surveyHash: res.data.hash_key
                                });
                            this.props.setIsLoading(false);
            })
            .catch(error => {   // handle errors
                this.setState({isLoading: false});
                this.props.setIsLoading(false);

                console.log(error);
                console.log(error.response ? (error.response.data || error.message) : error.message);
                this.props.setErrorMsg(error.response ? (error.response.data || error.message) : error.message); // if we have more response object, then we get more meaningful message, output standart error msg otherwise
            });

        this.setState({questionText: ''
                    , surveyName: ''
                    , surveyDescription: ''
                    , questions: []
            });
    }


    render() {
        switch(this.state.step) {
        case 1:
            return this.state.isLoading ? ( <LoadingScreen /> ) : (
                <div className="container">
                    <div className="text-right">
                        <Link to="/">
                            <button className="btn btn-warning">All Surveys</button>
                        </Link>
                    </div>

                    <SurveyInfoAdd addSurvey={this.addSurvey}
                                    handleChange={this.handleChange}
                                    surveyName={this.state.surveyName}
                                    surveyDescription={this.state.surveyDescription}
                            />
                    <SurveyQuestionAdd addQuestion={this.addQuestion}
                                        questionText={this.state.questionText}
                                        handleChange={this.handleChange}
                                />

                    {this.state.questions.map((question, i) => (
                        <SurveyQuestion key={i} questionId={i}
                                        question={question}
                                        delQuestion={this.delQuestion}
                                        />))
                    }
                </div>
            );
        case 2:
            return (
                <SurveyAddSuccess prevStep={this.prevStep} surveyLink={`${config.frontUrl}/surveys/${this.state.surveyHash}`} />
            );
        }
    }
}


SurveyAddFrame.propTypes = {
    setErrorMsg:      PropTypes.func.isRequired
    , setIsLoading: PropTypes.func.isRequired
};
