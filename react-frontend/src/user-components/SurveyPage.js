import React, { Component } from 'react'
import PropTypes from 'prop-types'


export default class SurveyPage extends Component {
    qtyOfQuestionsOnPage = 3;

    constructor(props) {
        super(props);
        const { step } = props;

        this.state = {
            answersPlaceholder : this.updateStateAnswers(step)
        }
    }


    updateStateAnswers = (step) => {
        const { questions } = this.props;
        let preparedAnswers = {};

        const firstQuestionIndex = this.qtyOfQuestionsOnPage * (step - 1);
        const lastQuestionIndex  = ((this.qtyOfQuestionsOnPage * step) - 1) > questions.length - 1 ? questions.length - 1 : ((this.qtyOfQuestionsOnPage * step) - 1);

        console.log('YOOO', firstQuestionIndex);

        for (let i = firstQuestionIndex; i <= lastQuestionIndex; ++i) {
            const questionId = questions[i].obj_id;
            preparedAnswers[questionId]  = {
                                    text: questions[i].answer   // answer will equal to answer to question from questions prop
                                };
        }

        return preparedAnswers;
    }


    continue = e => {
        e.preventDefault();
        this.props.mergeAnswers(this.state.answersPlaceholder);
        // console.log('prop changed:', this.props.step);
        this.setState({answersPlaceholder : this.updateStateAnswers(this.props.step + 1)});//this.props.step + 1
        this.props.nextStep();
    }


    back = e => {
        e.preventDefault();

        this.props.mergeAnswers(this.state.answersPlaceholder);
        this.props.prevStep();

        if (this.props.step <= 1) {
            return;
        }
        this.setState({answersPlaceholder : this.updateStateAnswers(this.props.step - 1)});//this.props.step + 1
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


    //Handle change in one of the answers
    handleAnswerChange = (question_id, e) => {
        // save e.target.value since setState is asyncronous
        const value = e.target.value;
        this.setState(prevState => {
            let answersPlaceholder = Object.assign({}, prevState.answersPlaceholder);  // creating copy of state variable answers
            answersPlaceholder[question_id] = {text: value};                            // assign a new value
            return { answersPlaceholder };                                              // return new object
          })
    }


    render() {
        const { questions, step } = this.props;

        const onPageQuestions = questions.filter(
            (question, i) => ((i + 1) <= this.qtyOfQuestionsOnPage * step && (i + 1) > this.qtyOfQuestionsOnPage * (step - 1))
        ).map(
            (question, i) => {
                return <li key={question.obj_id}>
                    <form>
                        <label name="question">{question.text}</label><br/>
                        <textarea name="answer" value={this.state.answersPlaceholder[question.obj_id].text} onChange={(e) => this.handleAnswerChange(question.obj_id, e)}/><br/>
                    </form>
                </li>;
            }
        );

        const questionsAnswered = this.countAnsweredQuestions(questions);
        const questionsSkipped  = questions.length - questionsAnswered;

        return (
            <React.Fragment>
                <h1>Hello from SurveyPage</h1>
                <ul>{onPageQuestions}</ul>
                <button onClick={this.back}>Back</button>
                <button onClick={this.continue}>Continue</button>

                <p>Answered {questionsAnswered}/{questions.length} (Unanswered {questionsSkipped})</p>
                <p>Page {step}/{Math.ceil(this.props.questions.length / 3)}</p>
            </React.Fragment>
        );
    }
}


SurveyPage.propTypes = {
    nextStep:       PropTypes.func.isRequired
    , prevStep:     PropTypes.func.isRequired
    , questions:    PropTypes.array.isRequired
    , step:         PropTypes.number.isRequired
    , mergeAnswers: PropTypes.func.isRequired
}

