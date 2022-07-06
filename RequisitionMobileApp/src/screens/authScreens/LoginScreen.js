import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { SafeAreaView, StatusBar, View, Text, ImageBackground, TouchableOpacity, TextInput, BackHandler, StyleSheet, Modal } from 'react-native';
import Toast from 'react-native-simple-toast';
import { images, width, height, bgColorCode, sessionKeys, ApiHelper } from "../../utilities/ConstVariables";
import Loader from '../../utilities/Loader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import messaging from '@react-native-firebase/messaging';

export default class LoginScreen extends React.Component {

  state = {
    isLoading: false,
    isMobileNumberSatisfied: false,
    mobileNumberError: false,
    mobileNumberErrorMsg: "",
    isPasswordSatisfied: false,
    passwordError: false,
    passwordErrorMsg: "",
    showpassword: false,
    isNewPasswordSatisfied: false,
    newPasswordError: false,
    newPasswordErrorMsg: "",
    showNewPassword: false,
    newPassword: "",
    loginRequestObj: {
      mobileNumber: null,
      password: null
    },
    showPasswordModal: false,
    data: null
  }

  constructor(props) {
    super(props);
    this.checkLogin();
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
    this.checkLogin();
  }

  checkLogin() {
    AsyncStorage.getItem(sessionKeys.isLoggedIn).then((value) => {
      if (null != value && undefined != value && value.length > 0 && value.startsWith("true")) {
        AsyncStorage.getItem(sessionKeys.loginUserObj).then((loginUserObj) => {
          if (null != loginUserObj && undefined != loginUserObj && loginUserObj.length > 0) {
            switch (JSON.parse(loginUserObj).roleObj.roleName) {
              case "Super Admin":
                this.props.navigation.reset({ index: 0, routes: [{ name: "ApproveRequisition" }] });
                break;
              case "Approver":
                this.props.navigation.reset({ index: 0, routes: [{ name: "ApproveRequisition" }] });
                break;
              case "Requisition User":
                this.props.navigation.reset({ index: 0, routes: [{ name: "Requisition" }] });
                break;
              // case "Finance Dept.":
              //   this.setState({ initialRouteName: "SettleRequisition" });
              //   break;
              default:
                AsyncStorage.clear();
                this.props.navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
                break;
            }
            setTimeout(() => {
              this.setState({ isLoading: false });
            }, 500);
          } else {
            this.setState({ isLoading: false });
          }
        });
      } else {
        this.setState({ isLoading: false });
      }
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    AsyncStorage.getItem(sessionKeys.isLoggedIn);
  }

  backAction = () => { return true; };

  handleMobileNumber(isFromUI, text) {
    // const re = /^[0-9]+$/;
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let conditionalText = text;
    if (conditionalText !== '' && re.test(conditionalText)) {
      // if ((conditionalText + "").length === 8) {
      //   let loginRequestObj = this.state.loginRequestObj;
      //   loginRequestObj.mobileNumber = conditionalText;
      //   this.setState({ loginRequestObj: loginRequestObj, mobileNumberError: false, mobileNumberErrorMsg: "", isMobileNumberSatisfied: true });
      //   if (!isFromUI) {
      //     return true;
      //   }
      // } else if ((conditionalText + "").length <= 8) {
      //   let loginRequestObj = this.state.loginRequestObj;
      //   loginRequestObj.mobileNumber = conditionalText;
      //   this.setState({ loginRequestObj: loginRequestObj, mobileNumberError: true, mobileNumberErrorMsg: "Mobile Number should be 10 digits only", isMobileNumberSatisfied: false });
      //   if (!isFromUI) {
      //     return false;
      //   }
      // } else {
      //   let loginRequestObj = this.state.loginRequestObj;
      //   loginRequestObj.mobileNumber = (conditionalText + "").substring(0, 7);
      //   this.setState({ loginRequestObj: loginRequestObj, mobileNumberError: false, mobileNumberErrorMsg: "", isMobileNumberSatisfied: true });
      //   if (!isFromUI) {
      //     return true;
      //   }
      // }
      let loginRequestObj = this.state.loginRequestObj;
      loginRequestObj.mobileNumber = (conditionalText + "").toLowerCase().trim();
      this.setState({ loginRequestObj: loginRequestObj, mobileNumberError: false, mobileNumberErrorMsg: "", isMobileNumberSatisfied: true });
      if (!isFromUI) {
        return true;
      }
    } else {
      let loginRequestObj = this.state.loginRequestObj;
      loginRequestObj.mobileNumber = conditionalText;
      this.setState({ loginRequestObj: loginRequestObj, mobileNumberError: true, mobileNumberErrorMsg: "Enter valid Email ID", isMobileNumberSatisfied: false });
      if (!isFromUI) {
        return false;
      }
    }
  }

  onMobileNumberInputChange(e) {
    const re = /^[0-9]+$/;
    if (e.target.value !== '' && re.test(e.target.value)) {
      e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 8)
    } else {
      e.target.value = (e.target.value + "").substring(0, (e.target.value + "").length - 1);
    }
  }

  handlePassword(isFromUI, text) {
    // const re = /^([a-zA-Z0-9_-]){8,15}$/;
    // const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    const re = /^[ A-Za-z0-9_@./#&+-]*$/
    let conditionalText = text;
    if (conditionalText !== '') {
      if (re.test(conditionalText)) {
        let loginRequestObj = this.state.loginRequestObj;
        loginRequestObj.password = conditionalText;
        this.setState({ loginRequestObj: loginRequestObj, passwordError: false, passwordErrorMsg: "", isPasswordSatisfied: true });
        if (!isFromUI) {
          return true;
        }
      } else {
        let loginRequestObj = this.state.loginRequestObj;
        loginRequestObj.password = conditionalText;
        this.setState({ loginRequestObj: loginRequestObj, passwordError: true, passwordErrorMsg: "Password could be alphanumeric only and 8 to 15 characters long", isPasswordSatisfied: false });
        if (!isFromUI) {
          return true;
        }
      }
    } else {
      let loginRequestObj = this.state.loginRequestObj;
      loginRequestObj.password = conditionalText;
      this.setState({ loginRequestObj: loginRequestObj, passwordError: true, passwordErrorMsg: "Enter Valid Password", isPasswordSatisfied: false });
      if (!isFromUI) {
        return false;
      }
    }
  }

  onPasswordInputChange(e) {
    // const re = /^([a-zA-Z0-9_-]){8,15}$/;
    // const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    const re = /^[ A-Za-z0-9_@./#&+-]*$/
    if (e.target.value !== '' && re.test(e.target.value)) {
      e.target.value = (e.target.value + "").length > 15 ? (e.target.value + "").substring(0, 15) : e.target.value;
    } else {
      e.target.value = (e.target.value + "").substring(0, (e.target.value + "").length - 1);
    }
  }

  handleNewPassword(isFromUI, text) {
    // const re = /^([a-zA-Z0-9_-]){8,15}$/;
    // const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    const re = /^[ A-Za-z0-9_@./#&+-]*$/
    let conditionalText = text;
    if (conditionalText !== '') {
      if (re.test(conditionalText)) {
        this.setState({ newPassword: conditionalText, passwordError: false, passwordErrorMsg: "", isPasswordSatisfied: true });
        if (!isFromUI) {
          return true;
        }
      } else {
        this.setState({ newPassword: conditionalText, passwordError: true, passwordErrorMsg: "Password could be alphanumeric only and 8 to 15 characters long", isPasswordSatisfied: false });
        if (!isFromUI) {
          return true;
        }
      }
    } else {
      this.setState({ newPassword: conditionalText, passwordError: true, passwordErrorMsg: "Enter Valid Password", isPasswordSatisfied: false });
      if (!isFromUI) {
        return false;
      }
    }
  }

  onNewPasswordInputChange(e) {
    // const re = /^([a-zA-Z0-9_-]){8,15}$/;
    // const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    const re = /^[ A-Za-z0-9_@./#&+-]*$/
    if (e.target.value !== '' && re.test(e.target.value)) {
      e.target.value = (e.target.value + "").length > 15 ? (e.target.value + "").substring(0, 15) : e.target.value;
    } else {
      e.target.value = (e.target.value + "").substring(0, (e.target.value + "").length - 1);
    }
  }

  validateInputs() {
    if (this.handleMobileNumber(false, this.state.loginRequestObj.mobileNumber)) {
      if (this.handlePassword(false, this.state.loginRequestObj.password)) {
        // this.initaiteLoginApiCall("");
        messaging().getToken().then((value) => {
          let token = value;
          if (null != token) {
            AsyncStorage.getItem(sessionKeys.imeiNumber).then((value) => {
              if (!(null != value && undefined != value && value.length > 0)) {
                try {
                  AsyncStorage.setItem(sessionKeys.imeiNumber, token);
                  this.initaiteLoginApiCall(token);
                } catch (error) {
                  console.error("Error for Device ID ---> " + error);
                  Toast.show('Please Try Again Later.', Toast.LONG, Toast.BOTTOM);
                }
              } else {
                if (value === token) {
                  // DeviceId Exist in session
                  this.initaiteLoginApiCall(token);
                } else {
                  // DeviceID is not same as in session
                  AsyncStorage.clear();
                  AsyncStorage.setItem(sessionKeys.imeiNumber, token);
                  this.initaiteLoginApiCall(token);
                }
              }
            });
          } else {
            // Unable Token is null
            // BackHandler.exitApp();
            Toast.show('Issue while geting Device Token.', Toast.LONG, Toast.BOTTOM);
            Toast.show('Continuing wihout Device Registration.' + error, Toast.LONG, Toast.BOTTOM);
            Toast.show('Notification will only receive on email, You wont get Device Notification.' + error, Toast.LONG, Toast.BOTTOM);
            setTimeout(() => {
              this.initaiteLoginApiCall("");
            }, 2000);
          }
        }).catch((error) => {
          console.log("Error ---> " + error);
          Toast.show('Issue while geting Device Token. ' + error, Toast.LONG, Toast.BOTTOM);
          Toast.show('Continuing wihout Device Registration. ' + error, Toast.LONG, Toast.BOTTOM);
          Toast.show('Notification will only receive on email, You wont get Device Notification.' + error, Toast.LONG, Toast.BOTTOM);
          setTimeout(() => {
            this.initaiteLoginApiCall("");
          }, 2000);
        });
      } else { }
    } else { }
  }

  initaiteLoginApiCall(deviceToken) {
    let loginRequestObj = {
      reqObject: {
        username: this.state.loginRequestObj.mobileNumber,
        password: this.state.loginRequestObj.password,
        deviceToken: deviceToken
      },
      extraVariable: "Mobile"
    }
    this.validateLogin(loginRequestObj);
  }

  validateLogin(loginRequestObj) {
    this.setState({ isLoading: true });
    ApiHelper("validatelogin", loginRequestObj, "POST", null, false, false, false, false).then(data => {
      this.setState({ isLoading: false });
      // Toast.show('Handled Response---> ' + JSON.stringify(data), Toast.LONG, Toast.BOTTOM);
      switch (data.statusCode) {
        case 0:
          this.setState({ data: data }, () => this.commonMethod(data));
          break;
        case 150:
          this.setState({ isLoading: false, data: data }, () => this.setState({ showPasswordModal: true }));
          Toast.show('Set Your Password.', Toast.LONG, Toast.BOTTOM);
          break;
        case 1:
          this.setState({ isLoading: false });
          Toast.show('Invalid Login Credintials.', Toast.LONG, Toast.BOTTOM);
          break;
        case 2:
          this.setState({ isLoading: false });
          Toast.show('Input Error, please check all the missing feilds.', Toast.LONG, Toast.BOTTOM);
          break;
        default:
          this.setState({ isLoading: false });
          Toast.show('Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
          break;
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false });
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    });
  }

  commonMethod(data) {
    if (undefined !== data.authToken && null !== data.authToken
      && undefined !== data.respObject && null !== data.respObject) {
      this.setState({ isLoading: false });
      switch (data.respList[0].roleName) {
        // case "Super Admin":
        //   if (data.respList.length > 1) {
        //     let newRolesList = [];
        //     for (let i = 0; i < data.respList.length; i++) {
        //       if (i > 0) {
        //         newRolesList.push(data.respList[i]);
        //       }
        //     }
        //     // newRolesList.push(data.respList[0]);
        //     data.respList = newRolesList;
        //     this.navigateFurther("ApproveRequisition", data);
        //   } else {
        //     this.setState({ isLoading: false }, () => Toast.show('Super Admin Not Authorised to login.', Toast.LONG, Toast.BOTTOM));
        //     AsyncStorage.clear();
        //     // this.navigateFurther("ApproveRequisition", data);
        //   }
        //   break;
        case "Approver":
          this.navigateFurther("ApproveRequisition", data);
          break;
        case "Requisition User":
          this.navigateFurther("Requisition", data);
          break;
        // case "Finance Dept.":
        // this.navigateFurther("SettleRequisition");
        // break;
        default:
          AsyncStorage.clear();
          break;
      }
    } else {
      this.setState({ isLoading: false });
      Toast.show('Something went wrong.', Toast.LONG, Toast.BOTTOM);
    }
  }

  navigateFurther(screenName, data) {
    console.log("screenName ---> " + screenName)
    AsyncStorage.setItem(sessionKeys.isLoggedIn, "true");
    AsyncStorage.setItem(sessionKeys.authToken, data.authToken);
    AsyncStorage.setItem(sessionKeys.loginUserId, data.respObject.id);
    AsyncStorage.setItem(sessionKeys.loginUserMobileNumber, data.respObject.mobileNumber);
    AsyncStorage.setItem(sessionKeys.loginUserObj, JSON.stringify(data.respObject));
    AsyncStorage.setItem(sessionKeys.loginUserRoleList, JSON.stringify(data.respList));
    AsyncStorage.setItem(sessionKeys.selectedCompanyIndex, JSON.stringify(0));
    AsyncStorage.setItem(sessionKeys.selectedRoleIndex, JSON.stringify(0));
    Toast.show('Login Success.', Toast.LONG, Toast.BOTTOM);
    this.props.navigation.reset({ index: 0, routes: [{ name: screenName }] });
    // this.props.navigation.navigate(screenName)
  }

  validatePasswordInput() {
    if (this.handleNewPassword(false, this.state.newPassword)) {
      let userObj = this.state.data.respObject;
      userObj["password"] = this.state.newPassword;
      this.updatePassword(userObj);
    } else { }
  }

  updatePassword(userObj) {
    this.setState({ isLoading: true });
    let requestObject = {
      userId: this.state.data.respObject.mobileNumber,
      reqObject: userObj
    }
    ApiHelper("updateuserpassword", requestObject, "POST", this.state.data.authToken, false, false, false, false).then(data => {
      this.setState({ isLoading: false, showPasswordModal: false });
      switch (data.statusCode) {
        case 0:
          this.commonMethod(this.state.data);
          break;
        case 1:
          this.setState({ isLoading: false, showPasswordModal: false });
          Toast.show('Invalid Login Credintials.', Toast.LONG, Toast.BOTTOM);
          break;
        case 2:
          this.setState({ isLoading: false, showPasswordModal: true });
          Toast.show('Input Error, please check all the missing feilds.', Toast.LONG, Toast.BOTTOM);
          break;
        default:
          this.setState({ isLoading: false, showPasswordModal: true });
          Toast.show('Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
          break;
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, showPasswordModal: true });
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar hidden={true} />
        <Loader isVisible={this.state.isLoading} />
        <ImageBackground source={images.commonBackgroundImage} style={{ flex: 1, width: width, height: height }}>
          <View style={{ width: width, height: height, flex: 1, padding: 30, alignItems: "center", justifyContent: "center" }}>
            {/* <Icon size={32} name={'chevron-circle-left'} color={bgColorCode} style={{ marginBottom: 15 }} onPress={() => this.props.navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })} /> */}
            <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 28, color: "black", marginBottom: 20 }}>Login</Text>
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black" }}>Email ID *</Text>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <TextInput
                  ref={(input) => { this.mobileRef = input; }}
                  onFocus={() => { this.setState({ mobileNumberError: !this.state.isMobileNumberSatisfied, mobileNumberErrorMsg: this.state.isMobileNumberSatisfied ? "" : this.state.mobileNumberErrorMsg.length > 0 ? this.state.mobileNumberErrorMsg : this.state.selectedPosition >= 0 ? "" : "Enter Email ID" }) }}
                  keyboardType="email-address"
                  defaultValue={this.state.loginRequestObj.mobileNumber}
                  value={this.state.loginRequestObj.mobileNumber}
                  onChangeText={(text) => this.handleMobileNumber(true, text)}
                  onTextInput={(e) => this.onMobileNumberInputChange(e)}
                  placeholder="Enter Email ID"
                  placeholderTextColor="grey"
                  style={{ borderBottomWidth: 1, width: "100%", color: "black" }}
                  onSubmitEditing={(event) => this.passwordRef.focus()}
                  returnKeyType="go" />
              </View>
              <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "red", display: this.state.mobileNumberError ? "flex" : "none" }}>{this.state.mobileNumberErrorMsg}</Text>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black" }}>Password *</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  ref={(input) => { this.passwordRef = input; }}
                  onFocus={() => { this.setState({ passwordError: !this.state.isPasswordSatisfied, passwordErrorMsg: this.state.isPasswordSatisfied ? "" : this.state.passwordErrorMsg.length > 0 ? "Enter Password" : "" }) }}
                  keyboardType="default"
                  secureTextEntry={!this.state.showpassword}
                  defaultValue={this.state.loginRequestObj.password}
                  value={this.state.loginRequestObj.password}
                  onChangeText={(text) => this.handlePassword(true, text)}
                  onTextInput={(e) => this.onPasswordInputChange(e)}
                  placeholder="Enter Password"
                  placeholderTextColor="grey"
                  style={{ borderBottomWidth: 1, width: "100%", color: "black" }}
                  onSubmitEditing={(event) => this.validateInputs()}
                  returnKeyType="done" />
                <TouchableOpacity onPress={() => this.setState({ showpassword: !this.state.showpassword })} style={{ height: 30, width: 30, position: "absolute", right: 0 }}>
                  <Icon size={24} name={this.state.showpassword ? 'eye-slash' : "eye"} color={"black"} />
                  {/* <Image source={this.state.showpassword ? images.hidePassword : images.viewPassword} style={{ height: 30, width: 30, resizeMode: "contain" }} /> */}
                </TouchableOpacity>
              </View>
              <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "red", display: this.state.passwordError ? "flex" : "none" }}>{this.state.passwordErrorMsg}</Text>
            </View>

            <Modal animationType="fade" transparent={true}
              visible={this.state.showPasswordModal}
              onRequestClose={() => this.setState({ showPasswordModal: false })}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TouchableOpacity onPress={() => this.setState({ showPasswordModal: false })} style={{ width: 30, height: 30, backgroundColor: "red", borderRadius: 15, position: "absolute", top: -10, right: -10, zIndex: 1000, alignItems: "center", justifyContent: "center" }}>
                    <Icon size={12} solid={true} name={'times'} color={"white"} />
                  </TouchableOpacity>
                  <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "black", marginRight: 5, marginBottom: 10 }}>Set Your Password</Text>

                  <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black" }}>Password *</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        ref={(input) => { this.newPasswordRef = input; }}
                        onFocus={() => { this.setState({ newPasswordError: !this.state.isNewPasswordSatisfied, newPasswordErrorMsg: this.state.isNewPasswordSatisfied ? "" : this.state.newPasswordErrorMsg.length > 0 ? "Enter New Password" : "" }) }}
                        keyboardType="default"
                        secureTextEntry={!this.state.showNewPassword}
                        defaultValue={this.state.newPassword}
                        value={this.state.newPassword}
                        onChangeText={(text) => this.handleNewPassword(true, text)}
                        onTextInput={(e) => this.onNewPasswordInputChange(e)}
                        placeholder="Enter New Password"
                        placeholderTextColor="grey"
                        style={{ borderBottomWidth: 1, width: "100%", color: "black" }}
                        returnKeyType="done" />
                      <TouchableOpacity onPress={() => this.setState({ showNewPassword: !this.state.showNewPassword })} style={{ height: 30, width: 30, position: "absolute", right: 0 }}>
                        <Icon size={24} name={this.state.showNewPassword ? 'eye-slash' : "eye"} color={"black"} />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "red", display: this.state.newPasswordError ? "flex" : "none" }}>{this.state.newPasswordErrorMsg}</Text>
                  </View>

                  <TouchableOpacity onPress={() => this.validatePasswordInput()} style={{ width: "80%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, alignSelf: "center" }}>
                    <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <TouchableOpacity onPress={() => this.validateInputs()} style={{ width: width * 0.75, height: 50, marginTop: 20, backgroundColor: bgColorCode, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: 100, flexDirection: "row" }}>
              <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>Login</Text>
              <Icon size={32} name={'chevron-circle-right'} color={"white"} style={{ position: "absolute", right: 10 }} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
});