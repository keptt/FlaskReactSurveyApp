/*
    Display result of a particular survey in the form of the html table or JSON
*/
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import config from '../config';
import LoadingScreen from '../layout/LoadingScreen';


export default class SurveyResults extends Component {
    state = {
        nextPage: false
        , answers: []
        , isLoading: false
    };


    componentDidMount() {
        this.setState({isLoading: true});
        this.props.setIsLoading(true);

        axios.get(`${config.apiUrl}/answers/sr/${this.props.match.params.hashkey}`, config.createHeaders())
        .then(res => this.setState({answers: res.data}))
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


    changeState = () => {
        this.setState({nextPage: !this.state.nextPage});
    };


    render() {
        const { nextPage, answers, isLoading } = this.state;

        const answersAsTable = (
            answers.map( answer =>
                <tr key={answer.response_id.toString() + answer.question_id.toString()}>
                    <td>{answer.response_id}    </td>
                    <td>{answer.question_id}    </td>
                    <td>{answer.survey_id}      </td>
                    <td>{answer.text}           </td>
                    <td>{answer.answer}         </td>
                    <td>{answer.date_responded} </td>
                </tr>
            )
        );

        switch(nextPage) {
        case false:
            return isLoading ? (<LoadingScreen />) : (
                <React.Fragment>
                    <div className="text-right">
                        <button type="button" className="btn btn-success" onClick={this.changeState} style={buttonStyle}>JSON</button>
                    </div>
                    <div style={centerOnPageStyle}>
                        <table style={{width: '80%'}} className="table table-striped table-bordered table-hover table-condensed">
                            <tbody>
                                <tr className="table-dark" >
                                    <th>Response id     </th>
                                    <th>Question id     </th>
                                    <th>Survey id       </th>
                                    <th>Question Text   </th>
                                    <th>Answer          </th>
                                    <th>Date Responded  </th>
                                </tr>
                                { answersAsTable }
                            </tbody>
                        </table>
                    </div>
                </React.Fragment>
            );
        case true:
            return (
                    <React.Fragment>
                        <div class="text-right">
                            <button type="button" class="btn btn-success" onClick={this.changeState} style={buttonStyle}>Table</button>
                        </div>
                        <pre style={{textAlign: 'left'}}>{JSON.stringify(answers, null, '\t') }</pre>
                    </React.Fragment>
                );
        }
    }
}


const centerOnPageStyle = {
    display: 'flex'
    , textAlign: 'center'
    , justifyContent: 'center'
};


const buttonStyle = {
    margin: '20px'
};


SurveyResults.propTypes = {
    setErrorMsg:      PropTypes.func.isRequired
    , setIsLoading: PropTypes.func.isRequired
};
