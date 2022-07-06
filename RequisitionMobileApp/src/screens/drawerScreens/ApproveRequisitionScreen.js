import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { SafeAreaView, StatusBar, View, Text, BackHandler, TouchableOpacity, RefreshControl, Modal, StyleSheet, Image, ScrollView, PermissionsAndroid, Keyboard, TextInput } from 'react-native';
import { width, height, bgColorCode, sessionKeys, ApiHelper } from "../../utilities/ConstVariables";
import Loader from "../../utilities/Loader";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import { Table, Row, Cell, TableWrapper } from 'react-native-table-component';
import Pdf from 'react-native-pdf';
import moment from 'moment';
import RNFS from "react-native-fs";
import RNFU from "react-native-file-utils";
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RBSheet from "react-native-raw-bottom-sheet";
import messaging from '@react-native-firebase/messaging';
import RNFetchBlob from 'react-native-fetch-blob';
import DeviceInfo from 'react-native-device-info';

export default class ApproveRequisitionScreen extends React.Component {

  state = {
    isLoading: true,
    activeTabIndex: 0,
    companies: [],
    statusList: [],
    badgeCountList: [],
    requisitions: [],
    roleList: [],
    selectedCompanyIndex: 0,
    selectedRoleIndex: 0,
    showModal: false,
    showRoleModal: false,
    showRejectModal: false,
    requisitionTableHeader: ['S.No', 'Date', 'Requisition Id', 'Project Title', 'Project Code', 'Supplier', 'Requested By', 'Amount', 'Action'],
    widthArr: [50, 100, 120, 150, 120, 180, 150, 100, 120],
    url: "",
    showPDF: false,
    isStartedRecording: false,
    isPlaying: false,
    audioRecordingObj: {
      type: "audio",
      fileName: "",
      uri: "",
      base64: ""
    },
    selectedIndex: -1,
    additionalInfoList: [
      {
        title: "No",
        key: "doesAdditionalInfoRequired",
        value: false,
        isSelected: false
      },
      {
        title: "Yes",
        key: "doesAdditionalInfoRequired",
        value: true,
        isSelected: true
      }
    ],
    attachmentTableHeader: ['S.No', 'File Name', 'File Type', 'Action'],
    attachmentWidthArr: [40, 180, 80, 60],
    imageModal: false,
    viewAttachments: false,
    showApprovalModal: false,
    showDirectRejectModal: false,
    viewAdditionalInfo: false,
    showRefreshModal: false,
  }

  isPortrait = () => {
    return height > width;
  }

  constructor(props) {
    super(props);
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
    messaging().onMessage(async remoteMessage => {
      try {
        if ((remoteMessage?.data?.isForApprover + "").toLowerCase().trim() === "true") {
          // this.setState({ showRefreshModal: true });
          this.setState({ isLoading: false });
          this.initialMethod();
        }
      } catch (error) {
        console.error("Error ---> " + error);
      }
    });
  }

  logout() {
    AsyncStorage.clear();
    this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
    this.initialMethod();
  }

  initialMethod() {
    AsyncStorage.getItem(sessionKeys.loginUserRoleList).then((loginUserRoleList) => {
      if (undefined != loginUserRoleList && null != loginUserRoleList && loginUserRoleList.length > 0) {
        this.setState({ roleList: JSON.parse(loginUserRoleList) });
        AsyncStorage.getItem(sessionKeys.selectedRoleIndex).then((sltdRlInd) => {
          if (undefined != sltdRlInd && null != sltdRlInd) {
            this.setState({ selectedRoleIndex: parseInt(sltdRlInd) });
            AsyncStorage.getItem(sessionKeys.loginUserObj).then((loginUserObj) => {
              if (undefined != loginUserObj && null != loginUserObj && loginUserObj.length > 0) {
                let parsedLoginUserObj = JSON.parse(loginUserObj);
                if (undefined != parsedLoginUserObj && null != parsedLoginUserObj) {
                  if (undefined != parsedLoginUserObj.companies && null != parsedLoginUserObj.companies && parsedLoginUserObj.companies.length > 0) {
                    AsyncStorage.getItem(sessionKeys.selectedCompanyIndex).then((value) => {
                      if (undefined != value && null != value) {
                        this.setState({ isLoading: true, companies: parsedLoginUserObj.companies, selectedCompanyIndex: parseInt(value) }, () => this.loadData());
                      } else { this.logOut(); }
                    });
                  } else { this.logOut(); }
                } else { this.logOut(); }
              } else { this.logOut(); }
            });
          } else { this.logOut(); }
        });
      } else { this.logOut(); }
    });
  }

  logOut() {
    AsyncStorage.clear();
    this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  loadData() {
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("getallstatusbyactivitywithbadgecount", { extraVariable: "forRequisition," + this.state.companies[this.state.selectedCompanyIndex].id, userId: loginUserMobileNumber }, "POST", value, false, false, false, false).then(data => {
              this.setState({ isLoading: false });
              switch (data.statusCode) {
                case 0:
                  if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
                    this.setState({ isLoading: true, statusList: data.respList, badgeCountList: data.respList2, activeTabIndex: 0 }, () => this.loadRequisition());
                  } else {
                    this.setState({ isLoading: false });
                    Toast.show('Something went wrong.', Toast.LONG, Toast.BOTTOM);
                  }
                  break;
                case 2:
                  this.setState({ isLoading: false });
                  Toast.show('Input Error, please check all the missing feilds.', Toast.LONG, Toast.BOTTOM);
                  break;
                default:
                  this.setState({ isLoading: false });
                  Toast.show('here Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
                  break;
              }
            }).catch((error) => {
              console.error("Error ---> " + error);
              this.setState({ isLoading: false });
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            })
          } else { }
        });
      } else { }
    });
  }

  loadRequisition() {
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            AsyncStorage.getItem(sessionKeys.loginUserId).then(loginUserId => {
              if (undefined != loginUserId && null != loginUserId && loginUserId.length > 0) {
                ApiHelper("getallrequisitionbyuserstatusandcompany", { userId: loginUserMobileNumber, reqObject: { loggedInUserId: loginUserId, requisitionStatusId: this.state.statusList[this.state.activeTabIndex].id, companyId: this.state.companies[this.state.selectedCompanyIndex].id } }, "POST", value, false, false, false, false).then(data => {
                  this.setState({ isLoading: false });
                  switch (data.statusCode) {
                    case 0:
                      if (undefined !== data.respList && null !== data.respList) {
                        if (data.respList.length > 0) {
                          this.setState({ isLoading: false, requisitions: data.respList });
                        } else {
                          this.setState({ isLoading: false, requisitions: [] });
                          Toast.show('No records found.', Toast.LONG, Toast.BOTTOM);
                        }
                      } else {
                        this.setState({ isLoading: false, requisitions: [] });
                        Toast.show('Something went wrong.', Toast.LONG, Toast.BOTTOM);
                      }
                      break;
                    case 2:
                      this.setState({ isLoading: false, requisitions: [] });
                      Toast.show('Input Error, please check all the missing feilds.', Toast.LONG, Toast.BOTTOM);
                      break;
                    default:
                      this.setState({ isLoading: false, requisitions: [] });
                      Toast.show('heresss Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
                      break;
                  }
                }).catch((error) => {
                  this.setState({ isLoading: false, requisitions: [] });
                  Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
                })
              } else { }
            });
          } else { }
        });
      } else { }
    });
  }

  handleRejectionRemark(text) {
    let conditionalText = text;
    if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0) {
      let requisitions = this.state.requisitions;
      requisitions[this.state.selectedIndex]["rejectionRemark"] = text;
      this.setState({ requisitions: requisitions });
    } else {
      let requisitions = this.state.requisitions;
      requisitions[this.state.selectedIndex]["rejectionRemark"] = "";
      this.setState({ requisitions: requisitions });
    }
  }

  handleCompanySelection(index) {
    AsyncStorage.setItem(sessionKeys.selectedCompanyIndex, JSON.stringify(index));
    this.setState({ showModal: !this.state.showModal, selectedCompanyIndex: index, activeTabIndex: 0, isLoading: true }, () => this.loadRequisition());
  }

  handleRoleSelection(index) {
    if (undefined != this.state.roleList[parseInt(index)] && null != this.state.roleList[parseInt(index)]) {
      if ((this.state.roleList[parseInt(index)].roleName + "").toLowerCase().trim().includes("super")) {
        this.setState({ showRoleModal: !this.state.showRoleModal, activeTabIndex: 0 });
        AsyncStorage.setItem(sessionKeys.selectedRoleIndex, JSON.stringify(parseInt(this.state.selectedRoleIndex)));
        Toast.show('Under Development.', Toast.LONG, Toast.BOTTOM);
      } else {
        AsyncStorage.setItem(sessionKeys.selectedRoleIndex, JSON.stringify(parseInt(index)));
        this.setState({ showRoleModal: !this.state.showRoleModal, selectedRoleIndex: index, activeTabIndex: 0 });
      }
    } else {
      Toast.show('Please Try Again Later.', Toast.LONG, Toast.BOTTOM);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.backAction);
  }

  backAction = () => {
    // Alert.alert("Hold on!", "Are you sure you want to exit?", [
    //   { text: "Cancel", onPress: () => null, style: "cancel" },
    //   { text: "YES", onPress: () => { BackHandler.removeEventListener("hardwareBackPress", this.backAction); BackHandler.exitApp(); } }
    // ]);
    return true;
  };

  cellDataFromObj = (rowIndex, cellIndex) => {
    switch (cellIndex) {
      case 0:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{rowIndex + 1}</Text>);
      case 1:
        return (<Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{moment(this.state.requisitions[rowIndex]?.requisitionCreatedOn).format("DD/MM/YYYY")}</Text>);
      case 2:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.requisitionId}</Text>);
      case 3:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.projectObj?.projectTitle}</Text>);
      case 4:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.projectObj?.projectCode}</Text>);
      case 5:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.supplierObj?.supplierName}, {this.state.requisitions[rowIndex]?.supplierObj?.address}</Text>);
      // return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.discountPercentage + "% = " + this.state.requisitionTableData[rowIndex]?.discountAmount}</Text>);
      case 6:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.createdBy?.fullName}</Text>);
      case 7:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex]?.finalAmount}</Text>);
      default:
        if (this.isStatusRejected(rowIndex)) {
          return this.rejectedElement(rowIndex);
        } else if (this.isStatusApproved(rowIndex)) {
          return this.approveElement(rowIndex);
        } else if (this.isStatusRaised(rowIndex)) {
          return this.raisedElement(rowIndex);
        } else if (this.isStatusSettled(rowIndex)) {
          return this.settledElement(rowIndex);
        } else {
          return "";
        }

    }
  }

  raisedElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => this.onViewDetails(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'file-pdf'} color={"white"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, true, false)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'paperclip'} color={"white"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.onRejectRequisition(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "orange", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'times'} color={"white"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.onApprovalRequisition(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'check'} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  rejectedElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => this.onViewDetails(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'file-pdf'} color={"white"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, true, false)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'paperclip'} color={"white"} />
      </TouchableOpacity>
      {this.state.requisitions[rowIndex]?.isFinalReject ?
        <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, false, true)} style={{ width: 25, height: 25, backgroundColor: "orange", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={'file-alt'} color={"white"} />
        </TouchableOpacity> :
        this.state.requisitions[rowIndex]?.doesAdditionalInfoRequired ?
          <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, false, true)} style={{ width: 25, height: 25, backgroundColor: "orange", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
            <Icon size={12} solid={true} name={'info'} color={"white"} />
          </TouchableOpacity>
          : null}
    </View>
  );

  approveElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => this.onViewDetails(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'file-pdf'} color={"white"} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, true, false)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'paperclip'} color={"white"} />
      </TouchableOpacity>

      {(this.state.requisitions[rowIndex]?.doesAdditionalInfoRequired && this.state.requisitions[rowIndex]?.doesAdditionalInfoFilled && this.state.requisitions[rowIndex]?.additionalInfo.length > 0) ?
        <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, false, false)} style={{ width: 25, height: 25, backgroundColor: "orange", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={'info'} color={"white"} />
        </TouchableOpacity> : null}
    </View>
  );

  settledElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => this.onViewDetails(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'file-pdf'} color={"white"} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, true, false)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'paperclip'} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  isStatusRejected(rowIndex) {
    if (undefined != rowIndex && null != rowIndex && rowIndex >= 0) {
      if (undefined != this.state.requisitions && null != this.state.requisitions && this.state.requisitions.length > 0) {
        if (undefined != this.state.requisitions[rowIndex] && null != this.state.requisitions[rowIndex] && (this.state.requisitions[rowIndex] + "").length > 0) {
          if (undefined != this.state.requisitions[rowIndex]?.statusObj && null != this.state.requisitions[rowIndex]?.statusObj && (this.state.requisitions[rowIndex]?.statusObj + "").length > 0) {
            if (undefined != this.state.requisitions[rowIndex]?.statusObj?.statusName && null != this.state.requisitions[rowIndex]?.statusObj?.statusName && (this.state.requisitions[rowIndex]?.statusObj?.statusName + "").length > 0) {
              if ((this.state.requisitions[rowIndex]?.statusObj?.statusName + "") === "Rejected") {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isStatusApproved(rowIndex) {
    if (undefined != rowIndex && null != rowIndex && rowIndex >= 0) {
      if (undefined != this.state.requisitions && null != this.state.requisitions && this.state.requisitions.length > 0) {
        if (undefined != this.state.requisitions[rowIndex] && null != this.state.requisitions[rowIndex] && (this.state.requisitions[rowIndex] + "").length > 0) {
          if (undefined != this.state.requisitions[rowIndex]?.statusObj && null != this.state.requisitions[rowIndex]?.statusObj && (this.state.requisitions[rowIndex]?.statusObj + "").length > 0) {
            if (undefined != this.state.requisitions[rowIndex]?.statusObj?.statusName && null != this.state.requisitions[rowIndex]?.statusObj?.statusName && (this.state.requisitions[rowIndex]?.statusObj?.statusName + "").length > 0) {
              if ((this.state.requisitions[rowIndex]?.statusObj?.statusName + "") === "Approved") {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isStatusRaised(rowIndex) {
    if (undefined != rowIndex && null != rowIndex && rowIndex >= 0) {
      if (undefined != this.state.requisitions && null != this.state.requisitions && this.state.requisitions.length > 0) {
        if (undefined != this.state.requisitions[rowIndex] && null != this.state.requisitions[rowIndex] && (this.state.requisitions[rowIndex] + "").length > 0) {
          if (undefined != this.state.requisitions[rowIndex]?.statusObj && null != this.state.requisitions[rowIndex]?.statusObj && (this.state.requisitions[rowIndex]?.statusObj + "").length > 0) {
            if (undefined != this.state.requisitions[rowIndex]?.statusObj?.statusName && null != this.state.requisitions[rowIndex]?.statusObj?.statusName && (this.state.requisitions[rowIndex]?.statusObj?.statusName + "").length > 0) {
              if ((this.state.requisitions[rowIndex]?.statusObj?.statusName + "") === "Raised") {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isStatusSettled(rowIndex) {
    if (undefined != rowIndex && null != rowIndex && rowIndex >= 0) {
      if (undefined != this.state.requisitions && null != this.state.requisitions && this.state.requisitions.length > 0) {
        if (undefined != this.state.requisitions[rowIndex] && null != this.state.requisitions[rowIndex] && (this.state.requisitions[rowIndex] + "").length > 0) {
          if (undefined != this.state.requisitions[rowIndex]?.statusObj && null != this.state.requisitions[rowIndex]?.statusObj && (this.state.requisitions[rowIndex]?.statusObj + "").length > 0) {
            if (undefined != this.state.requisitions[rowIndex]?.statusObj?.statusName && null != this.state.requisitions[rowIndex]?.statusObj?.statusName && (this.state.requisitions[rowIndex]?.statusObj?.statusName + "").length > 0) {
              if ((this.state.requisitions[rowIndex]?.statusObj?.statusName + "") === "Settled") {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onApprovalRequisition(index) {
    this.setState({ selectedIndex: index, showApprovalModal: !this.state.showApprovalModal })
  }

  approveRequisition() {
    this.setState({ isLoading: true });
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("approverequisition", { userId: loginUserMobileNumber, reqObject: this.state.requisitions[this.state.selectedIndex] }, "POST", value, false, false, false, false).then(data => {
              if (undefined !== data && null !== data && undefined !== data.respObject && null !== data.respObject) {
                switch (data.statusCode) {
                  case 0:
                    Toast.show('Requisition Approved Successfully.', Toast.LONG, Toast.BOTTOM);
                    this.setState({ isLoading: true, selectedIndex: -1, showApprovalModal: false }, () => this.loadRequisition());
                    break;
                  default:
                    this.setState({ isLoading: false, selectedIndex: -1, showApprovalModal: false });
                    Toast.show('Please Try Again Later.', Toast.LONG, Toast.BOTTOM);
                    break;
                }
              } else {
                this.setState({ isLoading: false, selectedIndex: -1, showApprovalModal: false });
                Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
              }
            }).catch((error) => {
              console.error("Error ---> " + error);
              this.setState({ isLoading: false, selectedIndex: -1, showApprovalModal: false });
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            });
          } else {
            this.setState({ isLoading: false, selectedIndex: -1, showApprovalModal: false }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false, selectedIndex: -1, showApprovalModal: false }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  onViewDetails(index) {
    this.setState({ isLoading: true });
    this.updateReadStatus(this.state.requisitions[index], index);
    // if (undefined != this.state.requisitions[index].lpoPdfUrl && null != this.state.requisitions[index].lpoPdfUrl && (this.state.requisitions[index].lpoPdfUrl + "").length > 0) {
    //   this.setState({ url: this.state.requisitions[index].lpoPdfUrl }, () => this.setState({ showPDF: true }))
    // } else {
    //   this.setState({ url: this.state.requisitions[index].pdfURL }, () => this.setState({ showPDF: true }))
    // }
  }

  updateReadStatus(requisition, index) {
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("updateReadStatus", { extraVariable: requisition.id, userId: loginUserMobileNumber }, "POST", value, false, false, false, false).then(data => {
              switch (data.statusCode) {
                case -1:
                  if (undefined !== data.respObject && null !== data.respObject) {
                    if (undefined != requisition.lpoPdfUrl && null != requisition.lpoPdfUrl && (requisition.lpoPdfUrl + "").length > 0) {
                      this.setState({ badgeCountList: badgeCountList, url: requisition.lpoPdfUrl }, () => this.setState({ isLoading: false, showPDF: true }))
                    } else {
                      this.setState({ url: requisition.pdfURL }, () => this.setState({ isLoading: false, showPDF: true }))
                    }
                  } else {
                    this.setState({ isLoading: false });
                    Toast.show('Something went wrong.', Toast.LONG, Toast.BOTTOM);
                  }
                  break;
                case 0:
                  if (undefined !== data.respObject && null !== data.respObject) {
                    let badgeCountList = this.state.badgeCountList;
                    badgeCountList[this.state.activeTabIndex] = badgeCountList[this.state.activeTabIndex] - 1;

                    let requisitionList = this.state.requisitions;
                    requisitionList[index].isUpdated = false;
                    this.setState({ requisitions: requisitionList, badgeCountList: badgeCountList });

                    if (undefined != requisition.lpoPdfUrl && null != requisition.lpoPdfUrl && (requisition.lpoPdfUrl + "").length > 0) {
                      this.setState({ badgeCountList: badgeCountList, url: requisition.lpoPdfUrl }, () => this.setState({ isLoading: false, showPDF: true }))
                    } else {
                      this.setState({ url: requisition.pdfURL }, () => this.setState({ isLoading: false, showPDF: true }))
                    }
                  } else {
                    this.setState({ isLoading: false });
                    Toast.show('Something went wrong.', Toast.LONG, Toast.BOTTOM);
                  }
                  break;
                case 2:
                  this.setState({ isLoading: false });
                  Toast.show('Input Error, please check all the missing feilds.', Toast.LONG, Toast.BOTTOM);
                  break;
                case 3:
                  this.setState({ isLoading: false });
                  Toast.show('Failed to update count.', Toast.LONG, Toast.BOTTOM);
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
            })
          }
        });
      }
    });
  }

  onRequisitionInfo(index, shouldViewAttachment, shouldViewAdditionalInfo) {
    this.setState({ selectedIndex: index, viewAttachments: shouldViewAttachment, viewAdditionalInfo: shouldViewAdditionalInfo }, () => this.RBSheet.open())
  }

  cellDataFromObjForAttachment = (rowIndex, cellIndex) => {
    switch (cellIndex) {
      case 0:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{rowIndex + 1}</Text>);
      case 1:
        if (this.state.viewAttachments) {
          return (<Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{this.state.requisitions[this.state.selectedIndex]?.attachments[rowIndex]?.fileName}</Text>);
        } else {
          return (<Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex]?.fileName}</Text>);
        }
      case 2:
        if (this.state.viewAttachments) {
          return (<Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{this.state.requisitions[this.state.selectedIndex]?.attachments[rowIndex]?.type}</Text>);
        } else {
          return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex]?.type}</Text>);
        }
      case 3:
        if (this.state.viewAttachments) {
          return this.attachmentElement(rowIndex);
        } else {
          return this.addtionalInfoElement(rowIndex);
        }
      default:
        return (<Text></Text>);
    }
  }

  addtionalInfoElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      {(this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex]?.type + "").toLowerCase().startsWith("audio") ?
        <TouchableOpacity onPress={() => this.state.isStartedRecording ? this.onStopPlay() : this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={this.state.isStartedRecording ? 'stop' : 'play'} color={"white"} />
        </TouchableOpacity>
        :
        <TouchableOpacity onPress={() => this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={'eye'} color={"white"} />
        </TouchableOpacity>
      }
    </View>
  );

  attachmentElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      {(this.state.requisitions[this.state.selectedIndex]?.attachments[rowIndex]?.type + "").toLowerCase().startsWith("audio") ?
        <TouchableOpacity onPress={() => this.state.requisitions[this.state.selectedIndex]?.attachments[rowIndex]?.isPlaying ? this.onStopPlay() : this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={this.state.requisitions[this.state.selectedIndex]?.attachments[rowIndex]?.isPlaying ? 'stop' : 'play'} color={"white"} />
        </TouchableOpacity>
        :
        <TouchableOpacity onPress={() => this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={'eye'} color={"white"} />
        </TouchableOpacity>
      }
    </View>
  );

  onFileCLicked(rowIndex) {
    let addtionalInfo = [];
    if (this.state.viewAttachments) {
      addtionalInfo = this.state.requisitions[this.state.selectedIndex]?.attachments[rowIndex];
    } else {
      addtionalInfo = this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex];
    }
    if ((addtionalInfo.type + "").toLowerCase().startsWith("audio")) {
      this.onStartPlay(addtionalInfo.uri, rowIndex);
    } else if ((addtionalInfo.type + "").toLowerCase().startsWith("image")) {
      this.setState({ activeImageURI: addtionalInfo.uri, imageModal: true });
    } else if ((addtionalInfo.type + "").toLowerCase().startsWith("pdf")) {
      this.setState({ url: addtionalInfo.uri, showPDF: true })
    }
  }

  onRejectRequisition(index) {
    let requisitions = this.state.requisitions;
    requisitions[index]["doesAdditionalInfoRequired"] = this.state.additionalInfoList[1].value;
    this.setState({
      isStartedRecording: false,
      isPlaying: false,
      audioRecordingObj: {
        type: "audio",
        fileName: "",
        uri: "",
        base64: ""
      },
      selectedIndex: index,
      requisitions: requisitions
    }, () => this.setState({ showRejectModal: true }));
  }

  onDirectRejectRequisition() {
    this.setState({ showDirectRejectModal: true });
  }

  updateAdditionalInfoSelection(index) {
    if (this.state.selectedCompanyIndex >= 0) {
      let additionalInfoList = this.state.additionalInfoList;
      for (let i = 0; i < additionalInfoList.length; i++) {
        additionalInfoList[i].isSelected = false;
      }
      additionalInfoList[index].isSelected = true;
      let requisitions = this.state.requisitions;
      requisitions[this.state.selectedIndex]["doesAdditionalInfoRequired"] = additionalInfoList[index].value;
      this.setState({ additionalInfoList: additionalInfoList, requisitions: requisitions });
    } else {
      this.setState({
        isStartedRecording: false,
        isPlaying: false,
        audioRecordingObj: {
          type: "audio",
          fileName: "",
          uri: "",
          base64: ""
        },
        selectedIndex: -1
      }, () => this.setState({ showRejectModal: false }));
    }
  }

  requestRecordPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Requisition applicartion needs access to your microphone so you can record audio.',
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.requestReadStoragePermission();
      } else {
        Toast.show('Recoed permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      console.error("Error --> " + err);
    }
  };

  requestReadStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Read External Storage Permission',
          message: 'Requisition application needs access to read recorded files from your external storage, so you can record audio.',
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.requestWriteStoragePermission();
      } else {
        Toast.show('Camera permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      console.error("Error ---> " + err);
    }
  };

  requestWriteStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Read External Storage Permission',
          message: 'Requisition application needs access to write recordings in your external storage, so you can record audio.',
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.audioRecorderPlayer = new AudioRecorderPlayer();
        this.onStartRecord();
      } else {
        Toast.show('Camera permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      console.error("Error ---> " + err);
    }
  };

  onStartRecord = async () => {
    let fileName = 'hello' + new Date().getMilliseconds() + '.m4a';
    let path = RNFS.DocumentDirectoryPath + "/" + fileName;
    let audioRecordingObj = {
      type: "audio",
      fileName: fileName,
      uri: path
    }
    this.setState({ audioRecordingObj: audioRecordingObj })
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    const uri = await this.audioRecorderPlayer.startRecorder(path, audioSet);
    this.audioRecorderPlayer.addRecordBackListener((e) => { this.setState({ isStartedRecording: true }); });
  };

  onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({ isStartedRecording: false });
    RNFU.getPathFromURI(result).then(path => {
      RNFS.readFile(path, 'base64').then(imageBase64 => {
        let audioRecordingObj = this.state.audioRecordingObj;
        audioRecordingObj["base64"] = imageBase64;
        let requisitions = this.state.requisitions;
        requisitions[this.state.selectedIndex]["rejectedVoiceNote"] = audioRecordingObj;
        this.setState({ requisitions: requisitions, audioRecordingObj: audioRecordingObj })
      }).catch(reason => { console.error("Error ---> " + reason) })
    })
  };

  onStartPlay = async (path) => {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    const msg = await this.audioRecorderPlayer.startPlayer(path);
    this.audioRecorderPlayer.setVolume(1.0);
    this.audioRecorderPlayer.addPlayBackListener((e) => {
      this.setState({ isStartedRecording: true });
      if (e.currentPosition === e.duration) {
        this.setState({ isStartedRecording: false });
        this.audioRecorderPlayer.stopPlayer();
        this.audioRecorderPlayer.removePlayBackListener();
      }
    });
  };

  onStopPlay = async () => {
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
    this.setState({ isStartedRecording: false });
  };

  validateRejectionFields() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.doesAdditionalInfoRequired && null != this.state.requisitions[this.state.selectedIndex]?.doesAdditionalInfoRequired && (this.state.requisitions[this.state.selectedIndex]?.doesAdditionalInfoRequired + "").length > 0) {
      if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.base64 && null != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.base64 && this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.base64.length > 0) {
        this.rejectRequisition(false);
      } else {
        if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectionRemark && null != this.state.requisitions[this.state.selectedIndex]?.rejectionRemark && (this.state.requisitions[this.state.selectedIndex]?.rejectionRemark + "").length > 0) {
          this.rejectRequisition(false);
        } else {
          Toast.show('Either Comment or Voice Note is Required.', Toast.LONG, Toast.BOTTOM);
        }
      }
    } else {
      Toast.show('Select Does Additional Info Required!', Toast.LONG, Toast.BOTTOM);
    }
  }

  rejectRequisition(isDirectRejection) {
    this.setState({ isLoading: true });
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("rejectrequisition", { userId: loginUserMobileNumber, reqObject: this.state.requisitions[this.state.selectedIndex], extraVariable: isDirectRejection ? "Yes" : "No" }, "POST", value, false, false, false, false).then(data => {
              if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                  case 0:
                    this.RBSheet.close();
                    this.setState({
                      isLoading: true, isStartedRecording: false, isPlaying: false,
                      audioRecordingObj: { type: "audio", fileName: "", uri: "", base64: "" },
                      selectedIndex: -1, showRejectModal: false, showDirectRejectModal: false
                    });
                    this.loadRequisition();
                    Toast.show('Requisition Rejected Successfully.', Toast.LONG, Toast.BOTTOM);
                    break;
                  default:
                    this.RBSheet.close();
                    this.setState({ isLoading: true, isStartedRecording: false, isPlaying: false, audioRecordingObj: { type: "audio", fileName: "", uri: "", base64: "" }, selectedIndex: -1, showRejectModal: false, showDirectRejectModal: false });
                    Toast.show('Please Try Again Later.', Toast.LONG, Toast.BOTTOM);
                    break;
                }
              } else {
                this.RBSheet.close();
                this.setState({
                  isLoading: false, isStartedRecording: false, isPlaying: false,
                  audioRecordingObj: { type: "audio", fileName: "", uri: "", base64: "" },
                  selectedIndex: -1, showRejectModal: false, showDirectRejectModal: false
                });
                Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
              }
            }).catch((error) => {
              this.RBSheet.close();
              console.error("Error ---> " + error);
              this.setState({
                isLoading: false, isStartedRecording: false, isPlaying: false,
                audioRecordingObj: { type: "audio", fileName: "", uri: "", base64: "" },
                selectedIndex: -1, showRejectModal: false, showDirectRejectModal: false
              });
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            });
          } else {
            this.RBSheet.close();
            this.setState({
              isLoading: false, isStartedRecording: false, isPlaying: false,
              audioRecordingObj: { type: "audio", fileName: "", uri: "", base64: "" },
              selectedIndex: -1, showRejectModal: false, showDirectRejectModal: false
            }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.RBSheet.close();
        this.setState({
          isLoading: false, isStartedRecording: false, isPlaying: false,
          audioRecordingObj: { type: "audio", fileName: "", uri: "", base64: "" },
          selectedIndex: -1, showRejectModal: false, showDirectRejectModal: false
        }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  chkRejectionVoiceNote() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote && null != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote) {
      if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri && null != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri
        && (this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri + "").length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  chkRejectionRemarks() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectionRemark && null != this.state.requisitions[this.state.selectedIndex]?.rejectionRemark
      && (this.state.requisitions[this.state.selectedIndex]?.rejectionRemark + "").length > 0) {
      return true;
    } else {
      return false;
    }
  }

  playRejectedVoiceNote() {
    let voiceNoteUrl = "";
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote && null != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote
      && undefined != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri && null != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri && (this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri + "").length > 0) {
      voiceNoteUrl = this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote?.uri;
      this.onStartPlay(voiceNoteUrl);
    } else {
      // voiceNoteUrl = "http://192.168.0.101/REQ-SF0002-22/REQ-SF0002-22-3.m4a";
      Toast.show('Error While Playing Voice Note.', Toast.LONG, Toast.BOTTOM);
    }
  }

  requestWritePermissionAndDownload = async (url) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Write Permission",
          message: "Requisition application needs access to your storage to download",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const { config, fs } = RNFetchBlob;
        let PictureDir = fs.dirs.PictureDir;
        let path = PictureDir + ((url + "").substring((url + "").lastIndexOf("/"), (url + "").length));
        this.download(url, path, config);
      } else {
        Toast.show('Camera permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      console.error("Error ---> " + err);
    }
  };

  download(url, path, config) {
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: path,
        description: 'File',
      },
    };
    config(options)
      .fetch('GET', url)
      .then(res => {
        if (undefined != res && null != res && undefined != res.data && null != res.data) {
          // Linking.openURL(res.data);
          // Linking.openURL(path)
        }
        alert('File Downloaded Successfully.');
      });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, width: width, height: height }}>
        <StatusBar hidden={false} />
        <Loader isVisible={this.state.isLoading} />
        <View style={{ display: "none", height: 90, width: width, backgroundColor: bgColorCode, elevation: 10 }}>
          <View style={{ height: 40, width: width, alignItems: "center", justifyContent: "center", flexDirection: "row", borderWidth: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "white", marginRight: 5 }}>Selected Company: <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>{this.state.companies[this.state.selectedCompanyIndex]?.companyName}</Text></Text>
            <Icon size={16} solid={true} name={'edit'} color={"white"} style={{ alignSelf: "center", borderRadius: 50 }} onPress={() => this.setState({ showModal: !this.state.showModal })} />
          </View>

          <View style={{ height: 50, width: width, flexDirection: "row" }}>
            {this.state.statusList.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => this.setState({ activeTabIndex: index, isLoading: true }, () => this.loadRequisition())} style={{ width: width / this.state.statusList.length, height: 50, alignItems: "center", justifyContent: "center", borderBottomColor: "white", borderBottomWidth: this.state.activeTabIndex === index ? 4 : 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>{item.statusName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40, width: width, backgroundColor: bgColorCode, elevation: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", borderWidth: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "white", marginRight: 5 }}>Selected Company: </Text>
          <TouchableOpacity onPress={() => this.setState({ showModal: !this.state.showModal })} style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>{this.state.companies[this.state.selectedCompanyIndex]?.companyName}</Text>
            <Icon size={16} solid={true} name={'edit'} color={"white"} style={{ alignSelf: "center", borderRadius: 50 }} onPress={() => this.setState({ showModal: !this.state.showModal })} />
          </TouchableOpacity>
          <Icon size={18} solid={true} name={'sign-out-alt'} color={"white"} style={{ alignSelf: "flex-end", borderRadius: 50, position: "absolute", right: 10, top: 10, zIndex: 100 }} onPress={() => { AsyncStorage.clear(); this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }} />{/* AsyncStorage.clear(); this.props.navigation.navigate("Login"); */}
        </View>

        {this.state.roleList.length > 1 && <View style={{ height: 40, width: width, backgroundColor: bgColorCode, elevation: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", borderWidth: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "white", marginRight: 5 }}>Selected Role: </Text>
          <TouchableOpacity onPress={() => this.setState({ showRoleModal: !this.state.showRoleModal })} style={{ flexDirection: "row" }}>
            <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white", marginRight: 5, }}>{this.state.roleList[this.state.selectedRoleIndex]?.roleName}</Text>
            <Icon size={16} solid={true} name={'retweet'} color={"white"} style={{ alignSelf: "center", borderRadius: 50 }} />
          </TouchableOpacity>
        </View>}

        <View style={{ height: 50, width: width, backgroundColor: bgColorCode, elevation: 10, flexDirection: "row" }}>
          {this.state.statusList.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => this.setState({ activeTabIndex: index, isLoading: true }, () => this.loadRequisition())} style={{ width: width / this.state.statusList.length, height: 50, alignItems: "center", justifyContent: "center", borderBottomColor: "white", borderBottomWidth: this.state.activeTabIndex === index ? 4 : 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>{item.statusName}</Text>
              {item.statusName !== "Approved" ? <View style={{ position: "absolute", top: 0, right: 5, padding: 5, alignItems: "center", justifyContent: "center", backgroundColor: "red", borderRadius: 10 }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 12, color: "white" }}>{this.state?.badgeCountList?.[index]}</Text>
              </View> : null}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal={true}
          refreshControl={<RefreshControl refreshing={this.state.isLoading} onRefresh={() => { this.setState({ isLoading: true }); this.initialMethod() }} />}>
          <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff', backgroundColor: "#fff" }} style={{ backgroundColor: "#fff" }}>
            <Row data={this.state.requisitionTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.widthArr} />
            <ScrollView style={styles.dataWrapper}>
              {(undefined != this.state.requisitions && null != this.state.requisitions && this.state.requisitions.length > 0) ?
                this.state.requisitions.map((rowData, index) => (
                  <TableWrapper key={index} style={[styles.row, { backgroundColor: (rowData?.statusObj?.statusName !== "Approved") ? rowData.isUpdated ? "lightgrey" : null : null }]}>
                    {
                      <View style={{ flexDirection: "row" }}>
                        {this.state.widthArr.map((cellData, cellIndex) => (
                          <Cell key={cellIndex} width={this.state.widthArr[cellIndex]} data={this.cellDataFromObj(index, cellIndex)} textStyle={styles.text} />
                        ))}
                      </View>
                    }
                  </TableWrapper>
                ))
                :
                <View style={{ width: width, height: height, alignItems: "center", justifyContent: "center" }}>
                  <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 18, color: "black" }}>No {this.state.statusList[this.state.activeTabIndex]?.statusName} Requisition(s) Found</Text>
                </View>}
            </ScrollView>
          </Table>
        </ScrollView>

        <Modal animationType="fade" transparent={true} visible={this.state.showModal}
          onRequestClose={() => this.setState({ showModal: !this.state.showModal })}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity onPress={() => this.setState({ showModal: !this.state.showModal })} style={{ position: "absolute", top: -15, right: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={24} name={'times'} color={"white"} onPress={() => this.setState({ showModal: !this.state.showModal })} />
              </TouchableOpacity>
              <ScrollView horizontal={true} style={{ flexDirection: "row", width: (width * 0.9) - 20, height: ((height / 3) / 2) - 20 }}>
                {this.state.companies.map((item, index) => (
                  <TouchableOpacity key={index} onPress={() => this.handleCompanySelection(index)} style={{ flexDirection: "column", width: ((width * 0.9) - 30) / 3, height: ((height / 3) / 2) - 20, borderWidth: 1, borderColor: bgColorCode, borderRadius: 10, marginRight: 5, backgroundColor: this.state.companies[this.state.selectedCompanyIndex]?.companyName.startsWith(item.companyName) ? "#d3d3d3" : "white" }}>
                    <Image source={{ uri: item.imageURL }} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={this.state.showRoleModal}
          onRequestClose={() => this.setState({ showRoleModal: !this.state.showRoleModal })}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity onPress={() => this.setState({ showRoleModal: !this.state.showRoleModal })} style={{ position: "absolute", top: -15, right: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={24} name={'times'} color={"white"} />
              </TouchableOpacity>
              <ScrollView horizontal={true} style={{ flexDirection: "row", width: (width * 0.9) - 20, height: ((height / 3) / 2) - 20 }}>
                {this.state.roleList.map((item, index) => (
                  <TouchableOpacity key={index} onPress={() => this.handleRoleSelection(index)} style={{ flexDirection: "column", width: ((width * 0.9) - 30) / 3, height: ((width * 0.9) - 30) / 3, borderWidth: 1, borderColor: bgColorCode, borderRadius: 10, marginRight: 5, backgroundColor: this.state.selectedRoleIndex === index ? "#d3d3d3" : "white", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={32} solid={true} name={'user-tag'} color={"black"} />
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 10, color: "black" }}>{item?.roleName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={this.state.showPDF}
          onRequestClose={() => this.setState({ showPDF: !this.state.showPDF })}>
          <View style={[styles.centeredView, { width: DeviceInfo.isTablet() ? (height - 20) * 0.85 : (height * 0.85), height: DeviceInfo.isTablet() ? (width - 20) * 0.85 : (width * 0.85), padding: 20 }]}>
            <View style={[styles.modalView, { width: DeviceInfo.isTablet() ? ((height - 20) * 0.85) - 40 : ((height - 20) * 0.85), height: DeviceInfo.isTablet() ? ((width - 20) * 0.85) - 40 : ((width - 20) * 0.85), transform: [{ rotateZ: this.isPortrait() ? "90deg" : "0deg" }], position: "absolute", bottom: DeviceInfo.isTablet() ? 200 : 210, left: DeviceInfo.isTablet() ? -100 : -150 }]}>
              <TouchableOpacity onPress={() => this.setState({ showPDF: !this.state.showPDF })} style={{ position: "absolute", top: -15, left: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={24} name={'times'} color={"white"} onPress={() => this.setState({ showPDF: !this.state.showPDF })} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.requestWritePermissionAndDownload(this.state.url)} style={{ position: "absolute", top: -15, right: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, padding: 5, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={20} name={'download'} color={"white"} />
              </TouchableOpacity>

              <Pdf
                source={{ uri: this.state.url }}
                onLoadComplete={(numberOfPages, filePath) => { }}
                onPageChanged={(page, numberOfPages) => { }}
                onError={(error) => { }}
                onPressLink={(uri) => { }}
                style={{ flex: 1, width: (height - 80) * 0.85, height: (width - 80) * 0.85 }} />
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={this.state.showRejectModal}
          onRequestClose={() => this.setState({ showRejectModal: !this.state.showRejectModal })}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: 330, alignItems: "center", justifyContent: "center" }]}>
              <TouchableOpacity onPress={() => this.setState({ showRejectModal: !this.state.showRejectModal })} style={{ position: "absolute", top: -15, right: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={24} name={'times'} color={"white"} />
              </TouchableOpacity>
              <View style={{ flexDirection: "column", width: (width * 0.9) - 20, height: ((height / 3) / 2) - 20, alignItems: "center", justifyContent: "center" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 20, color: bgColorCode, marginBottom: 30 }}>Reject Requisition #{this.state.requisitions[this.state.selectedIndex]?.requisitionId}</Text>

                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black", marginRight: 15 }}>Does Additional Info Required?</Text>
                <View style={{ flexDirection: "row", width: "80%", justifyContent: "space-around", marginBottom: 15 }}>
                  {this.state.additionalInfoList.map((formTypeObj, index) => (
                    <TouchableOpacity key={index} onPress={() => this.updateAdditionalInfoSelection(index)} style={{ flexDirection: "row" }}>
                      <Icon size={18} name={formTypeObj.isSelected ? 'check-circle' : 'circle'} color={formTypeObj.isSelected ? bgColorCode : "black"} />
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: formTypeObj.isSelected ? "bold" : "normal", fontSize: 15, color: "black", marginLeft: 5 }}>{formTypeObj.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(undefined != this.state.audioRecordingObj?.base64 && null != this.state.audioRecordingObj?.base64 && this.state.audioRecordingObj?.base64.length > 0) ?
                  <TouchableOpacity onPress={() => this.state.isStartedRecording ? this.onStopPlay() : this.onStartPlay(this.state.audioRecordingObj.uri)} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center" }}>
                    <Icon size={24} solid={true} name={this.state.isStartedRecording ? 'stop' : 'play'} color={"white"} />
                  </TouchableOpacity>
                  :
                  <TouchableOpacity onPress={() => this.state.isStartedRecording ? this.onStopRecord() : this.requestRecordPermission()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center" }}>
                    <Icon size={24} solid={true} name={this.state.isStartedRecording ? 'stop' : 'microphone'} color={"white"} />
                  </TouchableOpacity>}

                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 13, color: "black", marginBottom: 10, marginTop: 10, alignSelf: "center", textAlign: "center" }}>--or--</Text>

                <TextInput
                  numberOfLines={4}
                  ref={(input) => { this.rejectionRemarkInput = input; }}
                  keyboardType="default"
                  defaultValue={this.state.requisitions[this.state.selectedIndex]?.rejectionRemark}
                  value={this.state.requisitions[this.state.selectedIndex]?.rejectionRemark}
                  onChangeText={(text) => this.handleRejectionRemark(text)}
                  placeholder="Enter Remarks"
                  placeholderTextColor="grey"
                  style={{ borderBottomWidth: 1, width: "100%", height: 35, color: "black" }}
                  onSubmitEditing={(event) => Keyboard.dismiss()}
                  returnKeyType="done" />


                <TouchableOpacity onPress={() => this.validateRejectionFields()} style={{ width: "80%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginTop: 20, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={this.state.showApprovalModal}
          onRequestClose={() => this.setState({ showApprovalModal: !this.state.showApprovalModal })}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { alignItems: "center", justifyContent: "center" }]}>
              <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: bgColorCode, marginBottom: 15, textAlign: "center" }}>Are you sure you want to approve requisition #{this.state.requisitions[this.state.selectedIndex]?.requisitionId}?</Text>

              <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-around" }}>
                <TouchableOpacity onPress={() => this.setState({ showApprovalModal: !this.state.showApprovalModal })} style={{ width: "25%", borderWidth: 1, borderColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: bgColorCode, textAlign: "center", marginLeft: 5 }}>No</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.approveRequisition()} style={{ width: "25%", backgroundColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={this.state.showDirectRejectModal}
          onRequestClose={() => this.setState({ showDirectRejectModal: !this.state.showDirectRejectModal })}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { alignItems: "center", justifyContent: "center" }]}>
              <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: bgColorCode, marginBottom: 15, textAlign: "center" }}>Are you sure you want to reject requisition #{this.state.requisitions[this.state.selectedIndex]?.requisitionId}?</Text>

              <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-around" }}>
                <TouchableOpacity onPress={() => this.setState({ showDirectRejectModal: !this.state.showDirectRejectModal })} style={{ width: "25%", borderWidth: 1, borderColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: bgColorCode, textAlign: "center", marginLeft: 5 }}>No</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.rejectRequisition(true)} style={{ width: "25%", backgroundColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* <Modal animationType="fade" transparent={true} visible={this.state.showRefreshModal}
          onRequestClose={() => this.setState({ showRefreshModal: !this.state.showRefreshModal })}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { alignItems: "center", justifyContent: "center" }]}>
              <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: bgColorCode, marginBottom: 15, textAlign: "center" }}>A new requisition received, refresh Now?</Text>

              <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-around" }}>
                <TouchableOpacity onPress={() => this.setState({ showRefreshModal: !this.state.showRefreshModal })} style={{ width: "25%", borderWidth: 1, borderColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: bgColorCode, textAlign: "center", marginLeft: 5 }}>No</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { this.setState({ isLoading: false }); this.initialMethod() }} style={{ width: "25%", backgroundColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal> */}

        <RBSheet
          ref={ref => { this.RBSheet = ref; }}
          height={300}
          openDuration={1000}
          closeDuration={1000}
          animationType={"slide"}
          closeOnDragDown={true}
          closeOnPressMask={true}
          customStyles={{
            container: {
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              borderWidth: 2,
              borderColor: bgColorCode,
              elevation: 30
            },
            wrapper: {
              backgroundColor: "transparent",
            },
            draggableIcon: {
              backgroundColor: "#000",
            }
          }}>
          <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black", marginBottom: 10 }}>{this.state.viewAttachments ? "Attachments " : "Additional Info "} #{this.state.requisitions[this.state.selectedIndex]?.requisitionId}</Text>
          <ScrollView nestedScrollEnabled={true} style={{ width: "100%", height: 225, alignSelf: "center", zIndex: 100 }} contentContainerStyle={{ alignItems: "center", justifyContent: "center", }}>

            {!this.state.viewAttachments &&
              <View style={{ width: "100%", flexDirection: "column", marginBottom: 15 }}>
                <View style={{ width: "100%", alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginBottom: 10 }}>
                  {this.chkRejectionVoiceNote() ?
                    <View style={{ flexDirection: "row", }}>
                      <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 13, color: "black" }}>Rejection Voicenote: </Text>
                      <TouchableOpacity onPress={() => this.state.isStartedRecording ? this.onStopPlay() : this.playRejectedVoiceNote()} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center", marginLeft: 10 }}>
                        <Icon size={12} solid={true} name={this.state.isStartedRecording ? 'stop' : 'play'} color={"white"} />
                      </TouchableOpacity>
                    </View> :
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>Gap Purpose</Text>//dont remove
                  }

                  {this.state.viewAdditionalInfo && !this.state.requisitions[this.state.selectedIndex]?.isFinalReject ?
                    <View style={{ width: "35%", alignItems: "center", justifyContent: "flex-end", flexDirection: "row" }}>
                      <TouchableOpacity onPress={() => this.onDirectRejectRequisition()} style={{ width: 25, height: 25, backgroundColor: "orange", borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 15 }}>
                        <Icon size={12} solid={true} name={'times'} color={"white"} />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.onApprovalRequisition(this.state.selectedIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                        <Icon size={12} solid={true} name={'check'} color={"white"} />
                      </TouchableOpacity>
                    </View> : null}

                </View>
                {this.chkRejectionRemarks() && <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 13, color: "black" }}>Rejection Remarks: <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 13, color: "black" }}>{this.state.requisitions[this.state.selectedIndex]?.rejectionRemark}</Text></Text>}
              </View>}

            <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ width: "100%", height: 225 }}>
              <Table style={{ backgroundColor: "#fff", width: "100%", height: 225 }}>
                <Row data={this.state.attachmentTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.attachmentWidthArr} />
                <ScrollView horizontal={false} nestedScrollEnabled={true} contentContainerStyle={{ width: "100%", height: 200 }}>
                  {this.state.viewAttachments ?

                    (undefined != this.state.requisitions[this.state.selectedIndex]?.attachments && null != this.state.requisitions[this.state.selectedIndex]?.attachments) ?
                      this.state.requisitions[this.state.selectedIndex]?.attachments.map((rowData, index) => (
                        <TableWrapper key={index} style={styles.row}>
                          {
                            <View style={{ flexDirection: "row" }}>
                              {this.state.attachmentWidthArr.map((cellData, cellIndex) => (
                                <Cell key={cellIndex} width={this.state.attachmentWidthArr[cellIndex]} height={20} data={this.cellDataFromObjForAttachment(index, cellIndex)} textStyle={styles.text} />
                              ))}
                            </View>
                          }
                        </TableWrapper>
                      ))
                      :
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black", alignSelf: "center", marginTop: 5 }}>No Attachment(s) Found</Text>
                    :
                    (undefined != this.state.requisitions[this.state.selectedIndex]?.doesAdditionalInfoFilled && null != this.state.requisitions[this.state.selectedIndex]?.doesAdditionalInfoFilled && ((this.state.requisitions[this.state.selectedIndex]?.doesAdditionalInfoFilled + "") === "true")) ?
                      this.state.requisitions[this.state.selectedIndex]?.additionalInfo?.map((rowData, index) => (
                        <TableWrapper key={index} style={styles.row}>
                          {
                            <View style={{ flexDirection: "row" }}>
                              {this.state.attachmentWidthArr.map((cellData, cellIndex) => (
                                <Cell key={cellIndex} width={this.state.attachmentWidthArr[cellIndex]} height={20} data={this.cellDataFromObjForAttachment(index, cellIndex)} textStyle={styles.text} />
                              ))}
                            </View>
                          }
                        </TableWrapper>
                      ))
                      :
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black", alignSelf: "center", marginTop: 5 }}>No Addtional Info(s) Found</Text>
                  }
                </ScrollView>
              </Table>
            </ScrollView>
          </ScrollView>
        </RBSheet>

        <Modal animationType="fade" transparent={true}
          visible={this.state.imageModal}
          onRequestClose={() => this.setState({ imageModal: false })}>
          <View style={styles.centeredView}>
            <View style={styles.imageModalView}>
              <TouchableOpacity onPress={() => this.setState({ imageModal: false })} style={{ width: 30, height: 30, backgroundColor: "red", borderRadius: 15, position: "absolute", top: -10, right: -10, zIndex: 1000, alignItems: "center", justifyContent: "center" }}>
                <Icon size={12} solid={true} name={'times'} color={"white"} />
              </TouchableOpacity>
              <Image source={{ uri: this.state.activeImageURI }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  header: { height: 50, borderWidth: 1, borderColor: '#c8e1ff' },
  text: { textAlign: 'center', fontWeight: 'normal', color: "black" },
  textTotal: { textAlign: 'center', fontWeight: 'bold', color: "black", },
  dataWrapper: { height: 220 },
  row: { height: 40, backgroundColor: '#fff', borderWidth: 1, borderColor: '#c8e1ff' },
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
  imageModalView: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    width: width * 0.9,
    height: width * 0.9
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5
  },
});