import { AppRegistry, BackHandler } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionKeys } from './src/utilities/ConstVariables';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    BackHandler.exitApp();
});

function requestPermission() {
    messaging().requestPermission().then((value) => {
        if (value === messaging.AuthorizationStatus.AUTHORIZED || value === messaging.AuthorizationStatus.PROVISIONAL) {
            checkPermission(true);
        }
    });
}

function checkPermission(cond) {
    messaging().hasPermission().then(enabled => {
        if (enabled) {
            messaging().onTokenRefresh((token) => {
            })
            messaging().getToken().then((value) => {
                let token = value;
                if (null != token) {
                    AsyncStorage.getItem(sessionKeys.imeiNumber).then((value) => {
                        if (!(null != value && undefined != value && value.length > 0)) {
                            try {
                                AsyncStorage.setItem(sessionKeys.imeiNumber, token);
                            } catch (error) {
                                console.error("Error for Device ID ---> " + error);
                            }
                        } else {
                            if (value === token) {
                            } else {
                                AsyncStorage.clear();
                                AsyncStorage.setItem(sessionKeys.imeiNumber, token);
                            }
                        }
                    });
                } else {
                    BackHandler.exitApp();
                }
            })
        } else {
            // user doesn't have permission
            requestPermission();
        }
    });
}

checkPermission(false);

messaging().subscribeToTopic('requisitions').then(() => { });

AppRegistry.registerComponent(appName, () => App);