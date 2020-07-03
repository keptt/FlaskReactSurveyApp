/*
    Component wraps around components needed to make up an interactive process of user responding to a Survey
*/
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'

import SurveyPage from './SurveyPage';
import SurveySubmit from './SurveySubmit';
import SurveySuccessfulSubmition from './SurveySuccessfulSubmition';
import SurveyBegin from './SurveyBegin';
import SurveyNotFound from './SurveyNotFound';
import LoadingScreen from '../layout/LoadingScreen';
import config from '../config';


export default class SurveyFrame extends Component {
    qtyOfQuestionsOnPage = 3;

    state = {
        step: 0
        , surveyName: ''
        , surveyDescription: ''
        , surveyId: null
        , questions: []
        , isLoading: false
    }


    // Go to next step. This func is passed to child components
    nextStep = () => {
        const { step } = this.state;
        this.setState({
            step: step + 1
        })
    }


    // Go to previous step. This func is passed to child components
    prevStep = () => {
        const { step } = this.state;
        this.setState({
            step: step - 1
        })
    }


    //Handle change
    handleChange = input => e => {
        this.setState({[input] : e.target.value});
    }


    mergeAnswers = (answers) => {
        this.setState(prevState => {
            let questions = prevState.questions;
            questions.map((question) => {
                    // if answer has question id, it means it is answer to that question
                    if (answers[question.obj_id]) {
                        question.answer = answers[question.obj_id].text;
                    }
                    return question;
                }
            )
            return { questions };
          })
    }


    submitAnswers = () => {
        const {questions} = this.state;

        const answers = {answers : {}};

        for (let i = 0; i < questions.length; ++i) {
            if (!questions[i].answer) { // if answer is empty
                this.props.setErrorMsg('Some of the answers are empty!');
                return 0;
            }

            if (questions[i].answer.length > config.maxAnswerLenght) {
                this.props.setErrorMsg(`Answer ${i + 1} contains more than ${config.maxAnswerLenght} characters!`);
                return 0;
            }

            answers.answers[questions[i].obj_id] = questions[i].answer;
        }

        this.setState({isLoading: true});
        this.props.setIsLoading(true);       // fire loading screen since request might take some time

        return axios.post(`${config.apiUrl}/answers/sr/${this.props.match.params.hashkey}`, answers)
        .then(res => {this.props.setIsLoading(false);
                    this.setState({isLoading: false});
            })
        .catch(error => {
            this.props.setIsLoading(false);
            this.setState({isLoading: false});

            console.log(error);
            console.log(error.response ? (error.response.data || error.message) : error.message);
            this.props.setErrorMsg(error.response ? (error.response.data || error.message) : error.message); // if we have more response object, then we get more meaningful message, output standart error msg otherwise
        });
    }


    componentDidMount() {
        this.props.setIsLoading(true);          // pass setIsLoading(true) to a parent component to indicate the need to flush any error msgs inside ErrorBox
        this.setState({isLoading: true});       // fire loading screen since request might take some time

        axios.get(`${config.apiUrl}/questions/sr/hsh/${this.props.match.params.hashkey}`)
        .then(res => {
            if (!res.data.questions) this.setState({step: -1});
            for (let i = 0; i < res.data.questions.length; ++i) { // add answer attribute to question list (for storing user answer later)
                res.data.questions[i].answer = '';
            }
            return res
        })
        .then(res =>
                this.setState({surveyId:   res.data.survey_id       // store data received from backend locally
                    , surveyName:          res.data.name
                    , surveyDescription:   res.data.description
                    , questions:           res.data.questions
                })
        )
        .then(res => {this.props.setIsLoading(false);
                        this.setState({isLoading: false});
            })
        .catch(error => {
            this.props.setIsLoading(false);
            this.setState({isLoading: false});

            console.log(error);
            console.log(error.response ? (error.response.data || error.message) : error.message);
            this.props.setErrorMsg(error.response ? (error.response.data || error.message) : error.message); // if we have response object, then we get more meaningful message, output standart error msg otherwise
        });
    }


    render() {
        const { step, isLoading, questions } = this.state;

        if (step < 0) {
            return (<SurveyNotFound />);
        }
        else if (step === 0) {
            return isLoading ? (<LoadingScreen />) : (<SurveyBegin nextStep={this.nextStep}
                                                                    surveyName={this.state.surveyName}
                                                                    surveyDescription={this.state.surveyDescription}
                                                                    qtyOfQuestions={this.state.questions.length}
                                                        />);
        }
        else if (step === Math.ceil(questions.length / 3) + 1) { // if step is equals then max length of pages with questions + 1 (thing that user sees after all questions answered)
            return isLoading ? (<LoadingScreen />) : (<SurveySubmit nextStep={this.nextStep}
                                                                    prevStep={this.prevStep}
                                                                    questions={this.state.questions}
                                                                    submitAnswers={this.submitAnswers}
                                                        />);
        }
        else if (step > Math.ceil(questions.length / 3) + 1) { // if step is higher then max length of pages with questions + 1 (thing that user sees after submiting)
            return (<SurveySuccessfulSubmition />);
        }
        else {                  // display the main component that holds question-answer forms
            return (
                <SurveyPage nextStep={this.nextStep}
                            prevStep={this.prevStep}
                            handleChange={this.handleChange}
                            questions={questions}
                            step={step}
                            mergeAnswers={this.mergeAnswers}
                />
            );
        }

    }
}


SurveyFrame.propTypes = {
    setErrorMsg:      PropTypes.func.isRequired
    , setIsLoading: PropTypes.func.isRequired
};
