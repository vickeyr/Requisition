import { Dimensions } from "react-native"
import Toast from "react-native-simple-toast";

export const bgColorCode = "#000996";
export const textColorCode = "#fff";
export const partialPaidRequisitionColorCode = "#90ee90";
export const fullPaidRequisitionColorCode = "#6ecc6e";

export const images = {
    commonBackgroundImage: require("../../assets/images/bg2.jpg")
}

export const sessionKeys = {
    isLoggedIn: "IS_LOGGED_IN",
    loginUserId: "LOGIN_USERID",
    loginUserMobileNumber: "LOGIN_MOBILE_NUMBER",
    loginUserObj: "LOGIN_USEROBJ",
    loginUserRoleList: "LOGIN_USER_ROLE_LIST",
    authToken: "AUTH_TOKEN",
    imeiNumber: "IMEI_NUMBER",
    selectedCompanyIndex: "SELECTED_COMPANY_INDEX",
    selectedRoleIndex: "SELECTED_ROLES_INDEX"
};

export const useLocalURL = false;
export const APIURL = useLocalURL ? "http://192.168.0.101:8090/requisitionws/" : "http://15.184.94.83:8080/requisitionws/"
export const width = Dimensions.get("window").width;
export const height = Dimensions.get("window").height;

export const ApiHelper = async (suffixURL, data, methodType, authToken, showUrl, showReqObj, showRespObj, useLocalService) => {
    try {
        let url = "";
        if (useLocalService) {
            url = "http://192.168.0.101:8090/requisitionws/" + suffixURL;
        } else {
            url = APIURL + suffixURL;
        }


        if (showUrl) {
            console.log("Api URL ---> " + url);
            // Toast.show('Result---> ' + (url), Toast.LONG, Toast.BOTTOM);
        }
        if (showReqObj) {
            console.log("Request Object ---> " + JSON.stringify(data));
            // Toast.show('Result---> ' + JSON.stringify(data), Toast.LONG, Toast.BOTTOM);
        }

        let response = await fetch(url, {
            method: methodType,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', authToken: authToken },
            body: JSON.stringify(data)
        })
        let json = await response.json();
        if (showRespObj) {
            console.log("Api Response ---> " + JSON.stringify(json));
            // Toast.show('Result---> ' + JSON.stringify(json), Toast.LONG, Toast.BOTTOM);
        }
        return json;
    } catch (error) {
        console.error(error);
        return { result: [], status: "Error: " + error };
    }
};
