/*
    utility functions for user login handling
 */
import config from './config';
import axios from 'axios'


const userService = {
    login,
    logout,
    checkLogin
};

export default userService;


function login(username, password) {
    return axios.get(`${config.apiUrl}/login`, {
        auth: {
            username: username,
            password: password
          }
        })
        .then(res => {
            // login successful if there's a user and auth token in the response
            if (res.data.token && res.data.user) {
                // store user details and basic auth credentials in local storage
                // to keep user logged in between page refreshes
                localStorage.setItem('accessToken', res.data.token);
                localStorage.setItem('loggedUser', res.data.user);
            }

            return res;
        });
}


function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedUser');
}


function checkLogin() {
    return !!(localStorage.getItem('accessToken') && localStorage.getItem('loggedUser'));
}
