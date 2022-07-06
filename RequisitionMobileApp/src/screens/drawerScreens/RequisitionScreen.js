import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { SafeAreaView, StatusBar, View, Text, BackHandler, TouchableOpacity, Modal, StyleSheet, Image, ScrollView, Dimensions, PermissionsAndroid, Share, RefreshControl } from 'react-native';
import { width, height, bgColorCode, sessionKeys, ApiHelper } from "../../utilities/ConstVariables";
import Loader from "../../utilities/Loader";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import RBSheet from "react-native-raw-bottom-sheet";
import { Table, Row, Cell, TableWrapper } from 'react-native-table-component';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from "react-native-fs";
import RNFU from "react-native-file-utils";
import RNFetchBlob from 'react-native-fetch-blob';
import moment from 'moment';
import Pdf from 'react-native-pdf';
import messaging from '@react-native-firebase/messaging';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import DeviceInfo from 'react-native-device-info';

export default class RequisitionScreen extends React.Component {

  state = {
    isLoading: true,
    activeTabIndex: 0,
    companies: [],
    statusList: [],
    badgeCountList: [],
    requisitions: [],
    attachments: [],
    selectedCompanyIndex: 0,
    showModal: false,
    isPlaying: false,
    attachmentIndex: 0,
    imageModal: false,
    requisitionTableHeader: ['S.No', 'Date', 'Requisition Id', 'Project Title', 'Project Code', 'Supplier', 'Amount', 'Action'],
    widthArr: [50, 100, 120, 150, 120, 180, 100, 80],
    attachmentTableHeader: ['S.No', 'File Name', 'File Type', 'Action'],
    attachmentWidthArr: [50, 150, 100, 100],
    url: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
    showPDF: false,
    additionalInfoModal: false,
    selectedIndex: -1,
    viewAttachments: false,
    isStartedRecording: false,
    showOnlyAttachments: false,
    orientation: 'portrait'
  }

  isPortrait = () => {
    return height > width;
  }

  constructor(props) {
    super(props);
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
    // Dimensions.addEventListener('change', () => { this.setState({ orientation: this.isPortrait() ? 'portrait' : 'landscape' }) });
    messaging().onMessage(async remoteMessage => {
      try {
        if ((remoteMessage?.data?.isForApprover + "").toLowerCase().trim() === "false") {
          // this.setState({ showRefreshModal: true });
          this.setState({ isLoading: false });
          this.loadData();
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
    AsyncStorage.getItem(sessionKeys.loginUserObj).then((loginUserObj) => {
      if (undefined != loginUserObj && null != undefined != loginUserObj && loginUserObj.length > 0) {
        let parsedLoginUserObj = JSON.parse(loginUserObj);
        if (undefined != parsedLoginUserObj && null != parsedLoginUserObj) {
          if (undefined != parsedLoginUserObj.companies && null != parsedLoginUserObj.companies && parsedLoginUserObj.companies.length > 0) {
            AsyncStorage.getItem(sessionKeys.selectedCompanyIndex).then((value) => {
              if (undefined != value && null != value) {
                // this.setState({ isLoading: false, companies: parsedLoginUserObj.companies, selectedCompanyIndex: parseInt(value) });
                this.setState({ isLoading: true, companies: parsedLoginUserObj.companies, selectedCompanyIndex: parseInt(value) }, () => this.loadData());
              } else { console.log("companyIndex"); this.logOut(); }
            });
          } else { console.log("companyObj"); this.logOut(); }
        } else { console.log("parseduserObj"); this.logOut(); }
      } else { console.log("userObj"); this.logOut(); }
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
              switch (data.statusCode) {
                case 0:
                  if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
                    this.setState({ statusList: data.respList, badgeCountList: data.respList2, activeTabIndex: 0 }, () => this.loadRequisition());
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
                  Toast.show('Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
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
                      Toast.show('Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
                      break;
                  }
                }).catch((error) => {
                  console.error("Error ---> " + error);
                  this.setState({ isLoading: false, requisitions: [] });
                  Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
                })
              } else { this.setState({ isLoading: false, requisitions: [] }); }
            });
          } else { this.setState({ isLoading: false, requisitions: [] }); }
        });
      } else { this.setState({ isLoading: false, requisitions: [] }); }
    });
  }

  handleCompanySelection(index) {
    AsyncStorage.setItem(sessionKeys.selectedCompanyIndex, JSON.stringify(index));
    this.setState({ showModal: !this.state.showModal, selectedCompanyIndex: index, activeTabIndex: 0, isLoading: true }, () => this.loadRequisition());
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

  onStartPlay = async (attachment) => {
    if (undefined != attachment.base64 && null != attachment.base64 && attachment.base64.length > 0) {
      RNFetchBlob.fs.writeFile(RNFU.DownloadsDirectoryPath + "/" + attachment.fileName, attachment.base64, 'base64').then(value => {
        this.audioRecorderPlayer = new AudioRecorderPlayer();
        this.audioRecorderPlayer.stopPlayer();
        this.audioRecorderPlayer.removePlayBackListener();
        this.audioRecorderPlayer.startPlayer(RNFU.DownloadsDirectoryPath + "/" + attachment.fileName);
        this.audioRecorderPlayer.setVolume(1.0);
        this.audioRecorderPlayer.addPlayBackListener((e) => {
          this.setState({ isPlaying: true });
          if (e.currentPosition === e.duration) {
            this.setState({ isPlaying: false });
            this.audioRecorderPlayer.stopPlayer(); this.audioRecorderPlayer.removePlayBackListener();
          }
        });
      }).catch(error => console.error("error ---> " + error))
    } else {
      this.audioRecorderPlayer = new AudioRecorderPlayer();
      this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.removePlayBackListener();
      this.audioRecorderPlayer.startPlayer(attachment.uri);
      this.audioRecorderPlayer.setVolume(1.0);
      this.audioRecorderPlayer.addPlayBackListener((e) => {
        this.setState({ isPlaying: true });
        if (e.currentPosition === e.duration) {
          this.setState({ isPlaying: false });
          this.audioRecorderPlayer.stopPlayer(); this.audioRecorderPlayer.removePlayBackListener();
        }
      });
    }
  };

  onStopPlay = async (e) => {
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
    this.setState({ isPlaying: false });
  };

  onFileCLicked(attachmentIndex) {
    let attachment = [];
    if (this.state.additionalInfoModal) {
      attachment = this.state.requisitions[this.state.selectedIndex].additionalInfo[attachmentIndex];
    } else {
      attachment = this.state.attachments[attachmentIndex];
    }
    if ((attachment.type + "").toLowerCase().startsWith("audio")) {
      this.onStartPlay(attachment);
    } else if ((attachment.type + "").toLowerCase().startsWith("image")) {
      this.setState({ attachmentIndex: attachmentIndex, imageModal: true });
    } else if ((attachment.type + "").toLowerCase().endsWith("pdf")) {
      this.setState({ url: attachment.uri, showPDF: true })
    }
  }

  element = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => this.onViewDetails(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'file-pdf'} color={"white"} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, true)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'paperclip'} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  rejectElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => this.onViewDetails(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'file-pdf'} color={"white"} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => this.onRequisitionInfo(rowIndex, true)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'paperclip'} color={"white"} />
      </TouchableOpacity>

      {(this.checkAdditionalInfo(rowIndex)) ?
        this.checkIfIsFinalReject(rowIndex) ?
          <TouchableOpacity onPress={() => this.onViewAddtionalInfo(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
            <Icon size={12} solid={true} name={'file-alt'} color={"white"} />
          </TouchableOpacity>
          :
          this.checkAdditionalInfoFilled(rowIndex) ?
            <TouchableOpacity onPress={() => this.onViewAddtionalInfo(rowIndex)} style={{ width: 25, height: 25, backgroundColor: bgColorCode, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
              <Icon size={12} solid={true} name={'file-alt'} color={"white"} />
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={() => this.onRequisitionAddtionalInfo(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "orange", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
              <Icon size={12} solid={true} name={'info'} color={"white"} />
            </TouchableOpacity>
        : null}
    </View>
  );

  onRequisitionInfo(index, shouldViewAttachment) {
    let attachments = [];
    if (shouldViewAttachment) {
      attachments = this.state.requisitions[index].attachments;
    } else {
      attachments = this.state.requisitions[index].additionalInfo;
    }
    this.setState({ selectedIndex: index, attachments: attachments, viewAttachments: shouldViewAttachment }, () => this.RBSheet.open())
  }

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

  checkAdditionalInfo(rowIndex) {
    if (undefined != this.state.requisitions[rowIndex]?.doesAdditionalInfoRequired && null != this.state.requisitions[rowIndex]?.doesAdditionalInfoRequired) {
      if ((this.state.requisitions[rowIndex]?.doesAdditionalInfoRequired + "").toLowerCase().trim().startsWith("true")) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkIfIsFinalReject(rowIndex) {
    if (undefined != this.state.requisitions[rowIndex]?.isFinalReject && null != this.state.requisitions[rowIndex]?.isFinalReject) {
      if ((this.state.requisitions[rowIndex]?.isFinalReject + "").toLowerCase().trim().startsWith("true")) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkAdditionalInfoFilled(rowIndex) {
    if (undefined != this.state.requisitions[rowIndex]?.doesAdditionalInfoFilled && null != this.state.requisitions[rowIndex]?.doesAdditionalInfoFilled) {
      if ((this.state.requisitions[rowIndex]?.doesAdditionalInfoFilled + "").toLowerCase().trim().startsWith("true")) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onRequisitionAddtionalInfo(rowIndex) {
    this.setState({ selectedIndex: rowIndex }, () => { this.setState({ additionalInfoModal: true }) })
  }

  onViewAddtionalInfo(rowIndex) {
    this.setState({ selectedIndex: rowIndex, showOnlyAttachments: true }, () => { this.setState({ additionalInfoModal: true }) })
  }

  onViewDetails(index) {
    this.setState({ isLoading: true });
    this.updateReadStatus(this.state.requisitions[index], index);
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
                      this.setState({ url: requisition.lpoPdfUrl }, () => this.setState({ isLoading: false, showPDF: true }))
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
                      this.setState({ url: requisition.lpoPdfUrl }, () => this.setState({ isLoading: false, showPDF: true }))
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
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitions[rowIndex].finalAmount}</Text>);
      default:
        if (this.isStatusRejected(rowIndex)) {
          return this.rejectElement(rowIndex);
        } else {
          return this.element(rowIndex);
        }
    }
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
        <TouchableOpacity onPress={() => this.state.isPlaying ? this.onStopPlay() : this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={this.state.isPlaying ? 'stop' : 'play'} color={"white"} />
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

  // additionalInfoElement = (rowIndex) => (
  //   <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
  //     {(this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex]?.type + "").toLowerCase().startsWith("audio") ?
  //       <TouchableOpacity onPress={() => this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex]?.isPlaying ? this.onStopPlay() : this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
  //         <Icon size={12} solid={true} name={this.state.requisitions[this.state.selectedIndex]?.additionalInfo[rowIndex]?.isPlaying ? 'stop' : 'play'} color={"white"} />
  //       </TouchableOpacity>
  //       :
  //       <TouchableOpacity onPress={() => this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
  //         <Icon size={12} solid={true} name={'eye'} color={"white"} />
  //       </TouchableOpacity>
  //     }
  //   </View>
  // );

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

  requestWritePermissionAndShare = async (url) => {
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
        let options = {
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: PictureDir + ((url + "").substring((url + "").lastIndexOf("/"), (url + "").length)),
            description: 'File',
          },
        };
        config(options)
          .fetch('GET', url)
          .then(res => {
            // Showing alert after successful downloading
            if (undefined != res && null != res && undefined != res.data && null != res.data) {
              this.onShare(res, url);
            }
          });
      } else {
        Toast.show('Camera permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      console.error("Error ---> " + err);
    }
  };

  onShare = async (res, url) => {
    try {
      const result = await Share.share({
        message: 'Requisition Form PDF ' + url,
        url: url,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  }

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "Requisition application needs access to your camera",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.launchCameras();
      } else {
        Toast.show('Camera permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      console.error("Error ---> " + err);
    }
  };

  launchCameras = () => {
    ImagePicker.openCamera({ includeBase64: true, mediaType: 'photo', compressImageQuality: 0.7 }).then(image => {
      let fileName = (undefined != image.path && null != image.path) ? (image.path + "").substring((image.path + "").lastIndexOf("/"), (image.path + "").length) : ("ABC" + (new Date().getMilliseconds()));

      let additionalInfo = [];
      if (undefined != this.state.requisitions[this.state.selectedIndex].additionalInfo && null != this.state.requisitions[this.state.selectedIndex].additionalInfo && this.state.requisitions[this.state.selectedIndex].additionalInfo.length > 0) {
        additionalInfo = this.state.requisitions[this.state.selectedIndex].additionalInfo;
      }
      let audioRecordingObj = {
        type: image.mime,
        fileName: fileName.substring(1, fileName.length),
        // fileName: fileName,
        uri: image.path,
        base64: image.data
      }
      additionalInfo.push(audioRecordingObj);
      let requisition = this.state.requisitions[this.state.selectedIndex];
      requisition.additionalInfo = additionalInfo;
      this.setState({ requisition: requisition })
    });
  }

  launchImageLibrarys = async () => {
    try {
      ImagePicker.openPicker({ includeBase64: true, mediaType: 'photo', compressImageQuality: 0.7 }).then(image => {
        let fileName = (undefined != image.path && null != image.path) ? (image.path + "").substring((image.path + "").lastIndexOf("/"), (image.path + "").length) : ("ABC" + (new Date().getMilliseconds()));

        let additionalInfo = [];
        if (undefined != this.state.requisitions[this.state.selectedIndex].additionalInfo && null != this.state.requisitions[this.state.selectedIndex].additionalInfo && this.state.requisitions[this.state.selectedIndex].additionalInfo.length > 0) {
          additionalInfo = this.state.requisitions[this.state.selectedIndex].additionalInfo;
        }

        let audioRecordingObj = {
          type: image.mime,
          fileName: fileName.substring(1, fileName.length),
          uri: image.path,
          base64: image.data
        }

        additionalInfo.push(audioRecordingObj);
        let requisition = this.state.requisitions[this.state.selectedIndex];
        requisition.additionalInfo = additionalInfo;
        this.setState({ requisition: requisition })
      });
    } catch (error) {
      console.error("Error: --> " + error);
    }
  }

  selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
        // There can me more options as well
        // DocumentPicker.types.allFiles
        // DocumentPicker.types.images
        // DocumentPicker.types.plainText
        // DocumentPicker.types.audio
        // DocumentPicker.types.pdf
      });
      if (res.length > 0) {
        if ((res[0].type + "").endsWith("pdf")) {
          let audioRecordingObj = {
            type: res[0].type,
            fileName: res[0].name,
            uri: res[0].fileCopyUri,
            base64: ""
          };
          RNFS.readFile(res[0].fileCopyUri, 'base64').then(base64 => {
            audioRecordingObj["base64"] = base64;

            let additionalInfo = [];
            if (undefined != this.state.requisitions[this.state.selectedIndex].additionalInfo && null != this.state.requisitions[this.state.selectedIndex].additionalInfo && this.state.requisitions[this.state.selectedIndex].additionalInfo.length > 0) {
              additionalInfo = this.state.requisitions[this.state.selectedIndex].additionalInfo;
            }

            additionalInfo.push(audioRecordingObj);
            let requisition = this.state.requisitions[this.state.selectedIndex];
            requisition.additionalInfo = additionalInfo;
            this.setState({ requisition: requisition });
          }).catch(reason => { console.error("Error ---> " + reason) });
        } else {
          Toast.show('Only PDF\'s are supported', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        Toast.show('No file selected', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.error('Canceled');
      } else {
        console.error('Unknown Error: ' + JSON.stringify(err));
      }
    }
  };

  requestRecordPermission = async () => {
    this.setState({ isLoading: true })
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Requisition application needs access to your microphone so you can record audio.',
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.requestReadStoragePermission();
      } else {
        this.setState({ isLoading: false })
        Toast.show('Recoed permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      this.setState({ isLoading: false })
      console.error("Error ---> " + err);
      Toast.show('Microphone Permission issue', Toast.LONG, Toast.BOTTOM);
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
        this.setState({ isLoading: false })
        Toast.show('Storage permission denied. Go to app setting and allow to use application', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      this.setState({ isLoading: false })
      console.error("Error ---> " + err);
      Toast.show('Storage Permission issue', Toast.LONG, Toast.BOTTOM);
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
      this.setState({ isLoading: false });
      console.error("Error ---> " + err);
      Toast.show('Storage Permission issue', Toast.LONG, Toast.BOTTOM);
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
    this.setState({ audioRecordingObj: audioRecordingObj });
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    const uri = await this.audioRecorderPlayer.startRecorder(path, audioSet);
    this.audioRecorderPlayer.addRecordBackListener((e) => { this.setState({ isStartedRecording: true, isLoading: false }); });
  };

  onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({ isStartedRecording: false });
    RNFU.getPathFromURI(result).then(path => {
      RNFS.readFile(path, 'base64').then(imageBase64 => {
        let additionalInfo = this.state.requisitions[this.state.selectedIndex].additionalInfo;
        if (!(undefined != additionalInfo && null != additionalInfo)) {
          additionalInfo = [];
        }

        let audioRecordingObj = this.state.audioRecordingObj;
        audioRecordingObj["base64"] = imageBase64;
        additionalInfo.push(audioRecordingObj);

        let requisition = this.state.requisitions[this.state.selectedIndex];
        requisition.additionalInfo = additionalInfo;
        this.setState({ requisition: requisition, audioRecordingObj: null });
      }).catch(reason => { console.error("Error ---> " + reason); })
    })
  };

  checkAddInfoUriorBase64() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.additionalInfo && null != this.state.requisitions[this.state.selectedIndex]?.additionalInfo && (this.state.requisitions[this.state.selectedIndex]?.additionalInfo + "").length > 0) {
      if (undefined != this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.base64 && null != this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.base64 && (this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.base64 + "").length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  validateAdditionalInfoFormFields() {
    if (undefined != this.state.requisitions[this.state.selectedIndex].additionalInfo && null != this.state.requisitions[this.state.selectedIndex].additionalInfo && this.state.requisitions[this.state.selectedIndex].additionalInfo.length > 0) {
      this.addAdditionalInfoRequisition();
    } else {
      Toast.show('Add atleast one attachment.', Toast.LONG, Toast.BOTTOM);
    }
  }

  addAdditionalInfoRequisition() {
    this.setState({ isLoading: true });
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("addadditionalinfo", { userId: loginUserMobileNumber, reqObject: this.state.requisitions[this.state.selectedIndex] }, "POST", value, false, false, false, false).then(data => {
              if (undefined !== data && null !== data && undefined !== data.respObject && null !== data.respObject) {
                switch (data.statusCode) {
                  case 0:
                    Toast.show('Additional Information Submitted Successfully.', Toast.LONG, Toast.BOTTOM);
                    this.setState({ isLoading: true, selectedIndex: -1, additionalInfoModal: false, showOnlyAttachments: false }, () => this.loadRequisition());
                    break;
                  default:
                    this.setState({ isLoading: false, selectedIndex: -1, additionalInfoModal: false, showOnlyAttachments: false });
                    Toast.show('Please Try Again Later.', Toast.LONG, Toast.BOTTOM);
                    break;
                }
              } else {
                this.setState({ isLoading: false, selectedIndex: -1, additionalInfoModal: false, showOnlyAttachments: false });
                Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
              }
            }).catch((error) => {
              console.error("Error ---> " + error);
              this.setState({ isLoading: false, selectedIndex: -1, additionalInfoModal: false });
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            });
          } else {
            this.setState({ isLoading: false, selectedIndex: -1, additionalInfoModal: false, showOnlyAttachments: false }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false, selectedIndex: -1, additionalInfoModal: false }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  checkIsImageValid() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.additionalInfo && null != this.state.requisitions[this.state.selectedIndex]?.additionalInfo) {
      if (this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.uri && null != this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.uri && (this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.uri + "").length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkVoiceNote() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote && null != this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote) {
      if ((this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote + "").length > 0) {
        // && (this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote + "").endsWith("m4a")
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkRemarks() {
    if (undefined != this.state.requisitions[this.state.selectedIndex]?.rejectionRemark && null != this.state.requisitions[this.state.selectedIndex]?.rejectionRemark) {
      if ((this.state.requisitions[this.state.selectedIndex]?.rejectionRemark + "").length > 0) {
        // && (this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote + "").endsWith("m4a")
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, width: width, height: height }} >
        <StatusBar hidden={false} />
        <Loader isVisible={this.state.isLoading} />
        <View style={{ height: 90, width: width, backgroundColor: bgColorCode, elevation: 10 }}>
          <TouchableOpacity onPress={() => this.setState({ showModal: !this.state.showModal })} style={{ height: 40, width: width, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "white", marginRight: 5 }}>Selected Company: <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>{this.state.companies[this.state.selectedCompanyIndex]?.companyName}</Text></Text>
            <Icon size={16} solid={true} name={'edit'} color={"white"} style={{ alignSelf: "center", borderRadius: 50 }} />
          </TouchableOpacity>

          <View style={{ height: 50, width: width, flexDirection: "row" }}>
            {this.state.statusList.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => this.setState({ activeTabIndex: index, isLoading: true }, () => this.loadRequisition())} style={{ width: width / this.state.statusList.length, height: 50, alignItems: "center", justifyContent: "center", borderBottomColor: "white", borderBottomWidth: this.state.activeTabIndex === index ? 4 : 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "white" }}>{item.statusName}</Text>
                {item.statusName !== "Raised" ?
                  <View style={{ position: "absolute", top: 0, right: 5, padding: 5, alignItems: "center", justifyContent: "center", backgroundColor: "red", borderRadius: 10 }}>
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 12, color: "white" }}>{this.state?.badgeCountList?.[index]}</Text>
                  </View> : null}
              </TouchableOpacity>
            ))}
          </View>

          <Icon size={18} solid={true} name={'sign-out-alt'} color={"white"} style={{ alignSelf: "flex-end", borderRadius: 50, position: "absolute", right: 10, top: 10, zIndex: 100 }} onPress={() => { AsyncStorage.clear(); this.props.navigation.navigate("Login"); }} />
        </View>

        <ScrollView horizontal={true}
          refreshControl={<RefreshControl refreshing={this.state.isLoading} onRefresh={() => { this.setState({ isLoading: true }); this.loadData() }} />}>
          <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff', backgroundColor: "#fff" }} style={{ backgroundColor: "#fff" }}>
            <Row data={this.state.requisitionTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.widthArr} />
            <ScrollView style={styles.dataWrapper}>
              {(undefined != this.state.requisitions && null != this.state.requisitions && this.state.requisitions.length > 0) ?
                this.state.requisitions.map((rowData, index) => (
                  <TableWrapper key={index} style={[styles.row, { backgroundColor: (rowData?.statusObj?.statusName !== "Raised") ? rowData.isUpdated ? "lightgrey" : null : null }]}>
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
                  <TouchableOpacity key={index} onPress={() => this.handleCompanySelection(index)} key={index} style={{ flexDirection: "column", width: ((width * 0.9) - 30) / 3, height: ((height / 3) / 2) - 20, borderWidth: 1, borderColor: bgColorCode, borderRadius: 10, marginRight: 5, backgroundColor: this.state.companies[this.state.selectedCompanyIndex]?.companyName.startsWith(item.companyName) ? "#d3d3d3" : "white" }}>
                    <Image source={{ uri: item.imageURL }} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={this.state.showPDF}
          onRequestClose={() => this.setState({ showPDF: !this.state.showPDF })}>
          <View style={[styles.centeredView, { width: DeviceInfo.isTablet() ? height - 20 : height, height: DeviceInfo.isTablet() ? width - 20 : width, padding: 20 }]}>
            <View style={[styles.modalView, { width: DeviceInfo.isTablet() ? (height - 20) - 40 : (height - 20), height: DeviceInfo.isTablet() ? (width - 20) - 40 : (width - 20), transform: [{ rotateZ: this.isPortrait() ? "90deg" : "0deg" }], position: "absolute", bottom: DeviceInfo.isTablet() ? 270 : 210, left: DeviceInfo.isTablet() ? -220 : -200 }]}>
              <TouchableOpacity onPress={() => this.setState({ showPDF: !this.state.showPDF })} style={{ position: "absolute", top: -15, left: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={24} name={'times'} color={"white"} onPress={() => this.setState({ showPDF: !this.state.showPDF })} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.requestWritePermissionAndDownload(this.state.url)} style={{ position: "absolute", top: -15, right: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, padding: 5, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={20} name={'download'} color={"white"} />
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => this.requestWritePermissionAndShare(this.state.url)} style={{ position: "absolute", top: -15, right: 20, zIndex: 100, height: 30, width: 30, borderRadius: 15, padding: 5, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                <Icon size={20} name={'share'} color={"white"} />
              </TouchableOpacity> */}
              <Pdf
                source={{ uri: this.state.url }}
                onLoadComplete={(numberOfPages, filePath) => { }}
                onPageChanged={(page, numberOfPages) => { }}
                onError={(error) => { }}
                onPressLink={(uri) => { }}
                style={{ flex: 1, width: height - 80, height: width - 80 }} />
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true}
          visible={this.state.imageModal}
          onRequestClose={() => this.setState({ imageModal: false })}>
          <View style={styles.centeredView}>
            <View style={styles.imageModalView}>
              <TouchableOpacity onPress={() => this.setState({ imageModal: false })} style={{ width: 30, height: 30, backgroundColor: "red", borderRadius: 15, position: "absolute", top: -10, right: -10, zIndex: 1000, alignItems: "center", justifyContent: "center" }}>
                <Icon size={12} solid={true} name={'times'} color={"white"} />
              </TouchableOpacity>
              {this.state.additionalInfoModal ?
                this.checkAddInfoUriorBase64() ?
                  <Image source={{ uri: `data:image/png;base64,${this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.base64}` }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
                  :
                  this.state.showOnlyAttachments ?
                    <Image source={{ uri: this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.uri }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
                    : this.checkIsImageValid() ? <Image source={{ uri: this.state.requisitions[this.state.selectedIndex]?.additionalInfo[this.state.attachmentIndex]?.uri }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
                      : null
                :
                (undefined != this.state.attachments[this.state.attachmentIndex]?.base64 && null != this.state.attachments[this.state.attachmentIndex]?.base64 && this.state.attachments[this.state.attachmentIndex]?.base64.length > 0) ?
                  <Image source={{ uri: `data:image/png;base64,${this.state.attachments[this.state.attachmentIndex]?.base64}` }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
                  :
                  <Image source={{ uri: this.state.attachments[this.state.attachmentIndex]?.uri }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
              }
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true}
          visible={this.state.additionalInfoModal}
          onRequestClose={() => this.setState({ additionalInfoModal: false, showOnlyAttachments: false })}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity onPress={() => this.setState({ additionalInfoModal: false, showOnlyAttachments: false })} style={{ width: 30, height: 30, backgroundColor: "red", borderRadius: 15, position: "absolute", top: -10, right: -10, zIndex: 1000, alignItems: "center", justifyContent: "center" }}>
                <Icon size={12} solid={true} name={'times'} color={"white"} />
              </TouchableOpacity>
              <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "black", marginRight: 5 }}>{this.state.showOnlyAttachments ? "Additional Attachments" : "Additional Info Requested"} #{this.state.requisitions[this.state.selectedIndex]?.requisitionId}</Text>

              {!this.state.showOnlyAttachments ?
                <>
                  <View style={{ width: "100%", flexDirection: "column", borderBottomWidth: 2, marginTop: 10, alignSelf: "center", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
                    {this.checkVoiceNote() && <View style={{ width: "100%", height: 60, flexDirection: "row", borderBottomWidth: 2, marginTop: 10, alignSelf: "center", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "black", marginRight: 10 }}>Voice Note</Text>
                      <TouchableOpacity onPress={() => this.state.isPlaying ? this.onStopPlay() : this.onStartPlay(this.state.requisitions[this.state.selectedIndex]?.rejectedVoiceNote)} style={{ width: 40, height: 40, backgroundColor: bgColorCode, borderRadius: 20, padding: 5, alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} solid={true} name={this.state.isPlaying ? 'stop' : 'play'} color={"white"} />
                      </TouchableOpacity>
                    </View>}
                    {this.checkRemarks() && <View style={{ width: "100%", height: 40, flexDirection: "row", marginTop: 10, alignSelf: "center", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "black", marginRight: 10 }}>Remarks</Text>
                      <Text numberOfLines={4} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, color: "black", marginRight: 10 }}>{this.state.requisitions[this.state.selectedIndex]?.rejectionRemark}</Text>
                    </View>}
                  </View>

                  <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                    <TouchableOpacity onPress={() => this.state.isStartedRecording ? this.onStopRecord() : this.requestRecordPermission()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, marginRight: 10, alignItems: "center", justifyContent: "space-evenly", flexDirection: "row", alignSelf: "flex-end" }}>
                      <Icon size={16} solid={true} name={this.state.isStartedRecording ? 'stop' : 'microphone'} color={"white"} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.requestCameraPermission()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginRight: 10 }}>
                      <Icon size={16} solid={true} name={'camera'} color={"white"} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.launchImageLibrarys()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginRight: 10 }}>
                      <Icon size={16} solid={true} name={'images'} color={"white"} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.selectFile()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, marginRight: 10, marginTop: 10 }}>
                      <Icon size={16} solid={true} name={'file-invoice'} color={"white"} />
                    </TouchableOpacity>
                  </View>
                </>
                : null}

              <View style={{ width: "100%", height: 150, marginTop: 10, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                <ScrollView nestedScrollEnabled={true} horizontal={true}>
                  <Table style={{ backgroundColor: "#fff" }}>
                    <Row data={this.state.attachmentTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.attachmentWidthArr} />
                    <ScrollView horizontal={false}>
                      {(undefined != this.state.requisitions[this.state.selectedIndex]?.additionalInfo && null != this.state.requisitions[this.state.selectedIndex]?.additionalInfo) ?
                        this.state.requisitions[this.state.selectedIndex]?.additionalInfo.map((rowData, index) => (
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
                        <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black", alignSelf: "center", marginTop: 5 }}>No Additional Info Attachment(s) Found</Text>
                      }
                    </ScrollView>
                  </Table>
                </ScrollView>
              </View>

              {!this.state.showOnlyAttachments &&
                <TouchableOpacity onPress={() => this.validateAdditionalInfoFormFields()} style={{ width: "80%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Submit</Text>
                </TouchableOpacity>}
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

                <TouchableOpacity onPress={() => { this.setState({ isLoading: false }); this.loadData() }} style={{ width: "25%", backgroundColor: bgColorCode, borderRadius: 10, padding: 8, marginTop: 10, alignSelf: "center" }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal> */}

        <RBSheet
          ref={ref => { this.RBSheet = ref; }}
          height={250}
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
          <View style={{ width: "100%", height: 225, alignSelf: "center", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <ScrollView nestedScrollEnabled={true} horizontal={true} contentContainerStyle={{ height: 225, zIndex: 100 }}>
              <Table style={{ backgroundColor: "#fff", zIndex: 100 }}>
                <Row data={this.state.attachmentTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.attachmentWidthArr} />
                <ScrollView horizontal={false} contentContainerStyle={{ height: 200, zIndex: 100 }}>
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
          </View>
        </RBSheet>

        <TouchableOpacity onPress={() => { this.props.navigation.reset({ index: 0, routes: [{ name: 'RequisitionForm' }] }) }} style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: bgColorCode, position: "absolute", bottom: 25, right: 25, alignItems: "center", justifyContent: "center" }}>
          <Icon size={24} solid={true} name={'plus'} color={"white"} />
        </TouchableOpacity>
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
