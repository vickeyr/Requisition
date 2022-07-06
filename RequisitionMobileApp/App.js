import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "./src/screens/authScreens/LoginScreen";
import { View, ActivityIndicator, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bgColorCode, height, sessionKeys, width } from './src/utilities/ConstVariables';
import RequisitionScreen from './src/screens/drawerScreens/RequisitionScreen';
import RequisitionFormScreen from './src/screens/drawerScreens/RequisitionFormScreen';
import ApproveRequisitionScreen from './src/screens/drawerScreens/ApproveRequisitionScreen';

const Stack = createNativeStackNavigator()
export default class App extends React.Component {

  state = {
    isLoading: true,
    initialRouteName: "Login"
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    AsyncStorage.getItem(sessionKeys.isLoggedIn).then((value) => {
      if (null != value && undefined != value && value.length > 0 && value.startsWith("true")) {
        AsyncStorage.getItem(sessionKeys.loginUserObj).then((loginUserObj) => {
          if (null != loginUserObj && undefined != loginUserObj && loginUserObj.length > 0) {
            switch (JSON.parse(loginUserObj).roleObj.roleName) {
              case "Super Admin":
                this.setState({ initialRouteName: "ApproveRequisition" });
                break;
              case "Approver":
                this.setState({ initialRouteName: "ApproveRequisition" });
                break;
              case "Requisition User":
                this.setState({ initialRouteName: "Requisition" });
                break;
              // case "Finance Dept.":
              //   this.setState({ initialRouteName: "SettleRequisition" });
              //   break;
              default:
                AsyncStorage.clear();
                this.setState({ initialRouteName: "LoginScreen" });
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

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, width: width, height: height, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={bgColorCode} />
        </View>
      )
    } else {
      return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={this.state.initialRouteName}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Requisition" component={RequisitionScreen} />
            <Stack.Screen name="ApproveRequisition" component={ApproveRequisitionScreen} />
            <Stack.Screen name="RequisitionForm" component={RequisitionFormScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
  }
}
