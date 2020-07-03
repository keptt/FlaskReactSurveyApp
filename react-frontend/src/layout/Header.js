/*
    Header of each site page
*/
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import userService from '../userService'
import PropTypes from 'prop-types'


export default class Header extends Component {
    logoutWrap = (e) => {
        this.props.setIsLoggedIn(false);
        userService.logout();
    };


    render() {
        const logoutButton = (
            <Link to="/">
                <button type="button" className="btn btn-inverse btn-primary" onClick={this.logoutWrap}>Logout</button>
            </Link>
        );

        const aboutButton = (
            <Link to="/about">
                <button className="btn btn-inverse btn-primary" style={aboutLinkStyle}>About</button>
            </Link>
        );

        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                    <a className="navbar-brand" href="/">SurveyApp</a>
                    <ul className="navbar-nav mr-auto">
                    </ul>
                    { aboutButton }
                    { this.props.isLoggedIn ? logoutButton : null }
                </nav>
            </div>
        )
    }
}


Header.propTypes = {
    setIsLoggedIn: PropTypes.func.isRequired
    , isLoggedIn: PropTypes.bool.isRequired
};


const aboutLinkStyle = {
    color: 'white'
    , pointerEvents: 'none'
    , cursor: 'pointer'
};
