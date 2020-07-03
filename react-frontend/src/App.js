/*
    Main component of the frontend side, defines routes, passess errors between components and handles correct loading screen display
*/

import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import './bootstrap.min.css'
import './App.css';

import history from './history';
import userService from './userService';

import About from './layout/About';
import Header from './layout/Header';
import ErrorBox from './layout/ErrorBox';
import PrivateRoute from './layout/PrivateRoute';

import Login from './admin-components/Login';
import SurveyFrame from './user-components/SurveyFrame';
import SurveyAddFrame from './admin-components/SurveyAddFrame';
import SurveysDisplay from './admin-components/SurveysDisplay';
import SurveyResults from './admin-components/SurveyResults';


export default class App extends React.Component {
    state = {
        isLoggedIn: false   // needed to display logout button for logged in users
        , errorMsg: ''
        , isLoading: false  // added to be able to close the error box if loading screen fires
    }


    setIsLoggedIn = (val) => {
        this.setState({isLoggedIn: !!val});
    };


    setErrorMsg = (val) => {
        this.setState({errorMsg: val}); // set Error message. Is called in child components. errorMsg changes state and since it is passed as a prop to ErrorBox component,
                                        // ErrorBox will also update and rerender to display the error msg
    };


    setIsLoading = (val) => {
        if (val) {
            this.setState({errorMsg: ''}); // If we fire loading screen we do not want any error msgs to be shown
        }
        this.setState({isLoading: !!val})
    }


    componentDidMount() {
        this.setState({isLoggedIn: userService.checkLogin()});  // populate isLoggedIn right after component got created and mounted (but before rendering)

        history.listen(location => {                            // get history from created in history.js file to be able to keep track if user changes the page
                                                                // if user does that then we don't display errorMsg from the previous page
            this.setErrorMsg('');
          });
      }


    render() {
        return (
            <Router history={history}>
                <div className="App">
                    <Header isLoggedIn={ this.state.isLoggedIn } setIsLoggedIn={this.setIsLoggedIn} /> {/*general components to be displayed on each page */}
                    <ErrorBox setErrorMsg={ this.setErrorMsg } errorMsg={ this.state.errorMsg } />
                    <Switch>
                        <PrivateRoute exact path="/" props_={{setErrorMsg: this.setErrorMsg             /* since app is admin based, main page is for addmins only */
                                                                , setIsLoading: this.setIsLoading       /* since PrivateRoute is a custom component, props_ param is usered to handle any additional props */
                                                            }}
                                                    component={ SurveysDisplay }                       /* display the list of all created surveys */
                                                />

                        <PrivateRoute exact path="/survey/add" props_={{ setErrorMsg: this.setErrorMsg
                                                                        , setIsLoading: this.setIsLoading
                                                                    }}
                                                                component={ SurveyAddFrame }        /* add a new surveys */
                                                            />
                        <PrivateRoute exact path="/surveys/export/:hashkey" props_={{setErrorMsg: this.setErrorMsg
                                                                                    , setIsLoading: this.setIsLoading
                                                                                }}
                                                                            component={ SurveyResults } />      {/* get results for a particular survey defined by hashkey in url */}
                        <Route exact path='/surveys/:hashkey' render={(props) => <SurveyFrame {...props} setErrorMsg={this.setErrorMsg}
                                                                                                        setIsLoading={this.setIsLoading} />}
                                                                                                    />          {/* Display actual survey (defined by hasheky) for the responder to respond to, accessible to every user if they have a link */}
                        <Route exact path="/login" render={(props) => <Login {...props} setIsLoggedIn={this.setIsLoggedIn} />} />

                        <Route exact path="/about" component={About} />
                    </Switch>
                </div>
            </Router>
        );
    }
}
