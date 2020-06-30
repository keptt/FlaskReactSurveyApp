import React, { Component } from 'react'
import SurveyItem from './SurveyItem'
// import PropTypes from 'prop-types'


export default class SurveyList extends Component {
    state = {
        surveys : [
            {
                obj_id: 1
                , name: 'survey1'
                , description: 'good survey'
                , date_created: '2020-06-30'
                , questions_qty: 1
            }
            , {
                obj_id: 2
                , name: 'survey2'
                , description: 'good survey'
                , date_created: '2020-06-30'
                , questions_qty: 1
            }
            , {
                obj_id: 3
                , name: 'survey3'
                , description: 'good survey'
                , date_created: '2020-06-30'
                , questions_qty: 1
            }, {
                obj_id: 4
                , name: 'survey4'
                , description: 'good survey'
                , date_created: '2020-06-30'
                , questions_qty: 1
            }
        ]
    }


    render() {
        return this.state.surveys.map(survey => (
                    <SurveyItem key={survey.obj_id} survey={survey} />
                ));
    }
}
