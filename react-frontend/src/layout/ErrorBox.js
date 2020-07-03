/*
    Common component to display error messages on any page. It resides beneath the header and is showed only if errorMsg prop has any non-empty value
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class ErrorBox extends Component {
    render() {
        return this.props.errorMsg ? (
            <div className="container">
                <div className="alert alert-dismissible alert-danger">
                    <button type="button" className="close" onClick={ (e) => this.props.setErrorMsg('') }>&times;</button>
                    <strong>Error!{' '}</strong>
                    { this.props.errorMsg }
                </div>
            </div>
        ) : ( null );
    }
}


ErrorBox.propTypes = {
    errorMsg:         PropTypes.string.isRequired
    , setErrorMsg:  PropTypes.func.isRequired
};
