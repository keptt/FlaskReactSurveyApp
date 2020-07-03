/*
    Main page of the app with the general info for all surveys in the db (and links to them + survey results)
*/
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types'
import CopyToClipboard from '../layout/CopyToClipboard';
import LoadingScreen from '../layout/LoadingScreen';
import config from '../config';


export default class SurveysDisplay extends Component {
    state = {
        surveys: []
        , isLoading: false
    };


    componentDidMount() {
        this.setState({isLoading: true});
        this.props.setIsLoading(true);

        // get general survey data from the backend
        axios.get(`${config.apiUrl}/surveys`, config.createHeaders())
        .then(res => {
                res.data = res.data.map(survey => {
                    survey.date_created = new Date(survey.date_created);
                    return survey
                });

                this.setState({surveys: res.data.sort((a, b) => b.date_created - a.date_created)})                      // sort data by date desc
            }
        )
        .then(res => {this.setState({isLoading: false});
                    this.props.setIsLoading(false);
            })
        .catch(error => {
            this.setState({isLoading: false});
            this.props.setIsLoading(false);

            console.log(error);
            console.log(error.response ? (error.response.data || error.message) : error.message);
            this.props.setErrorMsg(error.response ? (error.response.data || error.message) : error.message); // if we have more response object, then we get more meaningful message, output standart error msg otherwise
        });
    }


    render() {
        const onPageSurveys = this.state.surveys.map(
            (survey) => (
                <div className="jumbotron" key={survey.obj_id}>
                    <h2>{survey.name}</h2>
                    <div className="text-right">
                        <small className="text-muted">{survey.date_created.toString().slice(0, 24)}</small>
                    </div>
                    <hr />
                    <p className="lead">{survey.description}</p>
                    <CopyToClipboard field={`${config.frontUrl}/surveys/${survey.hash_key}`} />
                    <Link to={`/surveys/export/${survey.hash_key}`}>
                        <button type="button" className="btn btn-outline-primary" style={{marginTop: '10px'}}>
                            View Results
                        </button>
                    </Link>
                </div>
            )
        );


        return this.state.isLoading ? (<LoadingScreen />) : (
            <React.Fragment>
                <div className="text-right" style={{marginRight: '20px', marginBottom: '20px'}}>
                    <Link to={`/survey/add`}>
                        <button className="btn btn-warning" type="button">
                            Add Survey
                        </button>
                    </Link>
                </div>
                <div className="container">
                    {onPageSurveys.length ? onPageSurveys : <h1>No surveys added yet</h1>}
                </div>
            </React.Fragment>
        )
    }
}


SurveysDisplay.propTypes = {
    setErrorMsg:      PropTypes.func.isRequired
    , setIsLoading: PropTypes.func.isRequired
};
