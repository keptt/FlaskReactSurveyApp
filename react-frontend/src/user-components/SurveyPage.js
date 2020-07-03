import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from '../config';


export default class SurveyPage extends Component {
    qtyOfQuestionsOnPage = config.qtyOfQuestionOnPage; // define the number of questions to be present on a single page/step

    constructor(props) {
        super(props);
        const { step } = props;

        this.state = {
            answersPlaceholder: this.updateStateAnswers(step)   // answersPlaceholder holds all the answers for the questions on the current page/step
                                                                // After a person leaves current step (goes to the next step but still is inside SurveyFrame component)
                                                                // this placeholder is passed to the parent component and perent updates its own state accordingly
        }
                                                                // answerPlaceholder has the following structure {"<question_id>" : "<answer_id>",..}
    }


    updateStateAnswers = (step) => { // save user answers before moving to the next page
        const { questions } = this.props;
        let preparedAnswers = {};

        // determine what range of question from the qeustions prop is to be rendered on the current page/step
        const firstQuestionIndex = this.qtyOfQuestionsOnPage * (step - 1);          // find the index of the first question to be displayed on the current page (index of an array of questons from the respective prop)
        const lastQuestionIndex  = ((this.qtyOfQuestionsOnPage * step) - 1) > questions.length - 1 ? questions.length - 1 : ((this.qtyOfQuestionsOnPage * step) - 1);   // find the index of the last question to be displayed on the current page

        for (let i = firstQuestionIndex; i <= lastQuestionIndex; ++i) {
            const questionId = questions[i].obj_id;             // get questin ids of all questions from the current step
            preparedAnswers[questionId]  = {
                                    text: questions[i].answer   // store answer to question from questions prop
                                };
        }
        // cherrypicked answers have are structured inside an object like: {"<question_id>" : "<answer_id>",...}

        return preparedAnswers;
    }


    // go to next step
    continue = e => {
        e.preventDefault();
        this.props.mergeAnswers(this.state.answersPlaceholder);
        this.setState({answersPlaceholder : this.updateStateAnswers(this.props.step + 1)}); // call update State
        this.props.nextStep();
    }


    // go to previous step
    back = e => {
        e.preventDefault();

        this.props.mergeAnswers(this.state.answersPlaceholder);
        this.props.prevStep();

        if (this.props.step <= 1) {
            return;
        }
        this.setState({answersPlaceholder : this.updateStateAnswers(this.props.step - 1)});
    }


    countAnsweredQuestions = (questions) => {
        let counter = 0;

        for (const question of questions) {
            if (question.answer) {
                counter++;
            }
        }

        return counter;
    }


    //Handle change in one of the answers by unpdating the respective answer param inanswersPlaceholder object
    handleAnswerChange = (question_id, e) => {
        // save e.target.value since setState is asyncronous
        const value = e.target.value;
        this.setState(prevState => {
            let answersPlaceholder = Object.assign({}, prevState.answersPlaceholder);  // creating copy of state variable answers
            answersPlaceholder[question_id] = {text: value};                            // assign a new value
            return { answersPlaceholder };                                              // return new object
          })
    }


    percentOfNumberFromAnotherNumber = (number, percentFrom) => {
        return (Math.round(number / ((percentFrom / 100) ? (percentFrom / 100) : 1)) * 100) / 100 // get the percentage of numer from percentFrom, round it and return;
                                                                                                 // also account for the case when we have percentFrom = 0 (division by zero)
    };


    render() {
        const { questions, step } = this.props;

        const onPageQuestions = questions.filter(
            (question, i) => ((i + 1) <= this.qtyOfQuestionsOnPage * step && (i + 1) > this.qtyOfQuestionsOnPage * (step - 1))      // filter out questings that are not shown on the curr step
        ).map(                                                                                                                      // render and display the rest
            (question, i) => {
                return <div key={question.obj_id}>
                    <form>
                        <label className="text-primary" name="question">{question.text}</label><br/>
                        <textarea className="form-control"
                                name="answer"
                                value={this.state.answersPlaceholder[question.obj_id].text}
                                onChange={(e) => this.handleAnswerChange(question.obj_id, e)}
                                rows="5"
                                style={{height: '100%'}}
                            /><br/>
                    </form>
                </div>;
            }
        );

        const questionsAnswered = this.countAnsweredQuestions(questions);
        const questionsSkipped  = questions.length - questionsAnswered;

        let backButton = (<button className="btn btn-secondary" onClick={this.back} style={btnStyle}>Back</button>);

        if (step === 1) { // don't show back button when on the first step
            backButton = null;
        }

        return (
            <div className="container">
                <div style={{margin: '20px'}}>
                    <small>Please answer all of the questions below:</small>
                </div>
                { onPageQuestions }
                { backButton }
                <button className="btn btn-outline-success" onClick={this.continue} style={btnStyle}>Continue</button>

                {/* section that holds detils of the user's progress on answering the questions */}
                <p>Answered {questionsAnswered}/{questions.length} (Unanswered {questionsSkipped})</p>

                <div className="progress" style={{marginBottom: '20px', marginTop: '20px'}}>
                    <div className="progress-bar progress-bar-success progress-bar-striped active"
                        style={{width: (this.percentOfNumberFromAnotherNumber(questionsAnswered, questions.length)).toString() + '%'}}
                    >
                        { this.percentOfNumberFromAnotherNumber(questionsAnswered, questions.length).toString() + '%' }
                    </div>
                </div>
                <p>Page {step}/{Math.ceil(this.props.questions.length / 3)}</p>
            </div>
        );
    }
}


SurveyPage.propTypes = {
    nextStep:       PropTypes.func.isRequired
    , prevStep:     PropTypes.func.isRequired
    , questions:    PropTypes.array.isRequired
    , step:         PropTypes.number.isRequired
    , mergeAnswers: PropTypes.func.isRequired
};


const btnStyle = {
    margin: '10px'
};
