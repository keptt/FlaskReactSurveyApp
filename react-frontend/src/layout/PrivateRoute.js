/*
    Component that encloses the route to a url and only shows it to logged in users (logged in users have access token and user object in local storage)
    It redirects to login page if user is not already logged in
*/
import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';


const PrivateRoute = ({ component: Component, props_: props_, ...rest }) => {
        return (<Route
            {...rest}
            render={ props =>
                localStorage.getItem('accessToken') && localStorage.getItem('loggedUser') ? (
                    <Component {...props} {...props_} />
                ) : (
                    <Redirect
                        to={{
                            pathname: '/login'
                            , state: { from: props.location }
                        }}
                        from='/'
                    />
                )
            }
        />)
    };


export default PrivateRoute;
