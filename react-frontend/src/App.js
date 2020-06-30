import React from 'react';
import './App.css';
import Header from './layout/Header'
import ErrorBox from './layout/ErrorBox'
import Surveys from './user-components/SurveyList'
import SurveyFrame from './user-components/SurveyFrame'
import SurveyBrief from './user-components/SurveyFrame'

import SurveyAdd from './admin-components/SurveyAdd'

function App() {
  return (
    <div className="App">
      {/* <Header />
      <ErrorBox />
      <h1>Here we go</h1>
      <Surveys /> */}
      {/* <SurveyFrame /> */}
      <SurveyAdd />
    </div>
  );
}

export default App;
