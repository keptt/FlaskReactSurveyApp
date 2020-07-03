import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class CopyToClipboard extends Component {

    copyField = (e) => {
        this.inputField.select();
        document.execCommand('copy');
        // e.target.focus();
      };


    render() {
        return (
            <div>
                <input className="form-control-md" ref={(input) => this.inputField = input} type="text" value={this.props.field} readOnly="readonly"></input>
                <button className="btn-secondary" onClick={this.copyField} data-placement="button" title="Copy to Clipboard" style={btnStyle}>Copy</button>
            </div>
        );
    }
}


const btnStyle = {
    border: 'none'
    , padding: '3.3px'
};


CopyToClipboard.propTypes = {
    field: PropTypes.string.isRequired
};



