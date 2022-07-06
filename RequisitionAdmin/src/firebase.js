import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { sessionKeys, vapidKey } from './utilities/ConstantVariable';

var firebaseConfig = {
    apiKey: "AIzaSyCrfcTvm3rNZxQvgpZ-SJRDi2Oss_llPmI",
    authDomain: "requisition-application-64780.firebaseapp.com",
    projectId: "requisition-application-64780",
    storageBucket: "requisition-application-64780.appspot.com",
    messagingSenderId: "1011394486154",
    appId: "1:1011394486154:web:eae8300f6b4c461126b273",
    measurementId: "G-PHEE571J00"
};

initializeApp(firebaseConfig);

const messaging = getMessaging();

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export const requestForToken = async () => {
    return getToken(messaging, { vapidKey: vapidKey })
        .then((currentToken) => {
            if (currentToken) {
                sessionStorage.setItem(sessionKeys.deviceToken, currentToken);
            } else {
                // console.log('No registration token available. Request permission to generate one.');
            }
        })
        .catch((err) => {
            console.error('An error occurred while retrieving token. ', err);
        });
};

export const subscribeTokenToTopic = (token, topic) => {
    fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'key=' + vapidKey
        })
    }).then(response => {
        if (response.status < 200 || response.status >= 400) {
            throw 'Error subscribing to topic: ' + response.status + ' - ' + response.text();
        }
    }).catch(error => {
        console.error(error);
    })
}