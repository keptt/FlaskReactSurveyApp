/*
    About page
*/
import React from 'react';


export default function About() {
    return (
        <div className="container">
            <h3>About</h3>
            <p className="jumbotron">
                This is a survey service where responders can anonymously answer the surveys via links
                provided to them by administrators.
            </p>
            <p>
                If you encountered any issues while using our service, please don't hesitate to contact us.
            </p>
            <ul className="list-group">
                <input className="list-group-item form-control" value="Contact email: contact_support@surveysupport.com" readOnly />
                <input className="list-group-item form-control" value="Contact phone: 000-12-70-01" readOnly />
            </ul>
        </div>
    )
}
