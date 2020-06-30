import React, { Component } from 'react'
import SurveyQuestion from './SurveyQuestion'

export default class SurveyAdd extends Component {
    state = {
        name: ''
        , description: ''
        , questions: ['yo', 'so']
// {
//     "name" : "<survey_name>"
//     , "description" : "<survey_desc>"
//     , "questions" : ["<question_one_text>", "<question_two_text>"...]
// }
    }


    delQuestion = (id) => {
        console.log(id);

        this.setState({questions: questions.filter((question, i) => i !== id)});
    }


    render() {
        return (
            <div>
                <form>
                    <label>Name: </label>
                    <input type="text" name="name" /><br />
                    <label>Description: </label>
                    <textarea name="description" />
                </form>
                <form>
                    <label>Question: </label>
                    <textarea name="question" />
                    <input type="submit" name="submit" />
                </form>

                {this.state.questions.map((question, i) => (
                    <SurveyQuestion key={i} question={question}
                                    delQuestion={this.delQuestion}
                                    />))
                }
            </div>
        )
    }
}

