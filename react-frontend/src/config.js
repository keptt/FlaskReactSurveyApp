/*
    Config files for storing generic settings used later by different components
 */

const createHeaders = () => {
    return {
        headers: {
            'access-token': localStorage.getItem('accessToken')
        }
    }
};


const config = {
    apiUrl: 'http://localhost:5000/api'
    , frontUrl: 'http://localhost:3000'
    , maxAnswerLenght: 2000
    , maxQuestionLenght: 2000
    , maxSurveyNameLength: 200
    , maxSurveyDescriptionLength: 2000
    , maxQuestionsQty: 200
    , qtyOfQuestionOnPage: 3
    , createHeaders
};


export default config;
