import React, { Component } from 'react'
import SurveyPage from './SurveyPage'
import SurveySubmit from './SurveySubmit'
import SurveySuccessfulSubmition from './SurveySuccessfulSubmition'
import SurveyBegin from './SurveyBegin'


export default class SurveyFrame extends Component {
    qtyOfQuestionsOnPage = 3;

    state = {
        step: 0
        , questions: [
            {
                obj_id : 1
                , survey_id : 1
                , text : 'what?'
                , answer : ''
            }
            , {
                obj_id : 2
                , survey_id : 1
                , text : 'what2?'
                , answer : ''
            }, {
                obj_id : 3
                , survey_id : 1
                , text : 'what3?'
                , answer : ''
            }, {
                obj_id : 4
                , survey_id : 1
                , text : 'what4?'
                , answer : ''
            }, {
                obj_id : 5
                , survey_id : 1
                , text : 'what5?'
                , answer : ''
            }, {
                obj_id : 6
                , survey_id : 1
                , text : 'what6?'
                , answer : ''
            }, {
                obj_id : 7
                , survey_id : 1
                , text : 'what7?'
                , answer : ''
            }
        ]
    }


    // Go to next step
    nextStep = () => {
        const { step } = this.state;
        this.setState({
            step: step + 1
        })
    }


    // Go to next step
    prevStep = () => {
        const { step } = this.state;
        this.setState({
            step: step - 1
        })
    }


    //Handle change
    handleChange = input => e => {
        console.log(e);
        console.log(input);
        this.setState({[input] : e.target.value});
    }


    mergeAnswers = (answers) => {
        this.setState(prevState => {
            let questions = prevState.questions;
            questions.map((question) => {
                    // if answer has question id, it means it is answer to that question
                    if (answers[question.obj_id]) {
                        question.answer = answers[question.obj_id].text
                    }
                    return question;
                }
            )
            return { questions };
          })
    }


    render() {
        const { step } = this.state;
        const { questions } = this.state;


        // console.log('hello world');

        if (step <= 0) {
            return <SurveyBegin nextStep={this.nextStep} />
        }
        else if (step === Math.ceil(questions.length / 3) + 1) { // if step is equals then max length of pages with questions + 1 (thing that user sees after all questions answered)
            console.log('step bigger', step);
            return <SurveySubmit nextStep={this.nextStep}
                                prevStep={this.prevStep}
                                questions={this.state.questions}
                                />
        }
        else if (step > Math.ceil(questions.length / 3) + 1) { // if step is higher then max length of pages with questions + 1 (thing that user sees after submiting)
            console.log('step bigger', step);
            return <SurveySuccessfulSubmition />
        }
        else {
            return (
                <SurveyPage nextStep={this.nextStep}
                            prevStep={this.prevStep}
                            handleChange={this.handleChange}
                            questions={questions}
                            step={step}
                            mergeAnswers={this.mergeAnswers}
                />
            )
        }

    }
}
