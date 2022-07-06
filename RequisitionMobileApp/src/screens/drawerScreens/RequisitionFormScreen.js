import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { SafeAreaView, StatusBar, Text, BackHandler, TextInput, TouchableOpacity, View, Keyboard, ScrollView, FlatList, StyleSheet, Modal, Image, PermissionsAndroid } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { width, height, sessionKeys, bgColorCode, ApiHelper, useLocalURL } from "../../utilities/ConstVariables";
import Loader from "../../utilities/Loader";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import RBSheet from "react-native-raw-bottom-sheet";
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS, { stat } from "react-native-fs";
import RNFU from "react-native-file-utils";
import ImagePicker from 'react-native-image-crop-picker';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';
import { Image as ImgCom } from 'react-native-compressor';

export default class RequisitionFormScreen extends React.Component {

  state = {
    isLoading: true,
    loginUserObj: null,
    selectedCompanyIndex: 0,
    currencies: [],
    companies: [],
    departments: [],
    suppliers: [],
    paymentType: [],
    uoms: [],
    selectedCurrencyIndex: 0,
    selectedUomIndex: 0,
    selectedProjectIndex: 0,
    selectedSupplierIndex: 0,
    selectedDepartmentIndex: 0,
    discountType: [
      {
        title: "Amount",
        key: "Amount",
        isSelected: true
      },
      {
        title: "Percentage",
        key: "Percentage",
        isSelected: false
      }
    ],
    formType: [
      {
        title: "Reimbursment",
        key: "forReimbursment",
        isSelected: false
      },
      {
        title: "Requisition",
        key: "forRequisition",
        isSelected: true
      }
    ],
    projectsList: [],

    requisitionTableHeader: ['S.NO', 'Description', 'Unit', 'Qty', 'Unit Price', 'Amount', 'Discount', 'VAT', 'Total (BD)', 'Action'],
    requisitionTableDataOrg: [
      ['1', 'ON Whey Protein', '22', '2', '44', '4.4', '48.4', ''],
      ['2', 'RSP Whey Protien', '11', '3', '33', '3.3', '36.3', ''],
      ['3', 'Universal Vitamin C 1000mg', '4', '4', '16', '1.6', '17.6', ''],
      ['4', 'ON Whey Protein', '22', '2', '44', '4.4', '48.4', ''],
      ['5', 'RSP Whey Protien', '11', '3', '33', '3.3', '36.3', ''],
      ['6', 'Universal Vitamin C 1000mg', '4', '4', '16', '1.6', '17.6', ''],
    ],
    requisitionTableData: [],
    requisitionTableTotalDataOrg: [['', '', '', '', 'Total Value', '184', '18.4', '204.6', '']],
    requisitionTableDiscountDataOrg: [['', '', '', '', '', '', 'Discount', '0', '']],
    requisitionTableDiscountData: [],
    discount: 0,
    requisitionTableTotalData: [['', '', '', '', 'Total Value', '0', '0', '0', '0', '']],
    widthArr: [50, 150, 80, 80, 80, 80, 80, 80, 80, 80],
    attachments: [],
    modalVisible: false,
    requisitionFormObj: {
      description: "",
      uomObj: null,
      unitPrice: 0,
      quantity: 1.00,
      productTotal: 0,
      vatPercentage: 10,
      totalVAT: 0,
      totalAmount: 0,
      discountPercentage: 0,
      discountAmount: 0,
      discountType: "Amount",
      requisitionObj: null,
      requisitionId: null,
      createdBy: null,
      createdDate: new Date(),
    },
    emptyRequisitionFormObj: {
      description: "",
      uomObj: null,
      unitPrice: 0,
      quantity: 1.00,
      productTotal: 0,
      vatPercentage: 10,
      totalVAT: 0,
      totalAmount: 0,
      discountPercentage: 0,
      discountAmount: 0,
      discountType: "Amount",
      requisitionObj: null,
      requisitionId: null,
      createdBy: null,
      createdDate: new Date(),
    },
    isEdit: false,
    rowIndex: -1,


    isStartedRecording: false,
    isPlaying: false,
    audioRecordingObj: {
      type: "audio",
      fileName: "",
      uri: "",
      base64: ""
    },
    imageModal: false,
    activeImageURI: "",
    fieldsDisplayLength: 0,
    fieldsDisplayLengthBk: 0,
    deleteRowIndex: -1,
    showDeleteModal: false,
    showApproverModal: false,
    selectedApproverIndex: 0,
    isObjectFound: false,
    isMultiple: false,
    attachmentTableHeader: ['S.NO', 'File Name', 'File Type', 'Action'],
    attachmentWidthArr: [40, 180, 80, 60],
    url: "",
    showPDF: false,
    showSupplierModal: false,
    notes: "",
    webViewURL: ""
  }

  constructor(props) {
    super(props);
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
    AsyncStorage.getItem(sessionKeys.selectedCompanyIndex).then((value) => {
      if (null != value && undefined != value && value.length > 0) {
        this.setState({ selectedCompanyIndex: value }, () => this.getLoginUserObj())
      } else {
        this.setState({ selectedCompanyIndex: 0 }, () => this.getLoginUserObj());
      }
    });
  }

  getLoginUserObj() {
    AsyncStorage.getItem(sessionKeys.loginUserObj).then((loginUserObj) => {
      if (undefined != loginUserObj && null != undefined != loginUserObj && loginUserObj.length > 0) {
        let parsedLoginUserObj = JSON.parse(loginUserObj);
        if (undefined != parsedLoginUserObj && null != parsedLoginUserObj) {
          if (undefined != parsedLoginUserObj.companies && null != parsedLoginUserObj.companies && parsedLoginUserObj.companies.length > 0) {
            this.setState({ companies: parsedLoginUserObj.companies, loginUserObj: parsedLoginUserObj }, () => this.loadData());
          } else { this.setState({ isLoading: false }, () => this.goBack()); }
        } else { this.setState({ isLoading: false }, () => this.goBack()); }
      } else { this.setState({ isLoading: false }, () => this.goBack()); }
    });
  }

  logout() {
    AsyncStorage.clear();
    this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }

  loadData() {
    this.setState({ isLoading: true });
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("getalldepartmentsbycompanyid", { userId: loginUserMobileNumber, extraVariable: "Active," + this.state.companies[this.state.selectedCompanyIndex].id }, "POST", value, false, false, false, false).then(data => {
              if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
                let departments = [];
                departments.push({
                  id: null,
                  departmentName: "Select One",
                  departmentCode: "SO",
                });
                departments.push(...data.respList);
                this.setState({ departments: departments }, () => this.getApproversListForRequisitionUsersByCompanyId(value, loginUserMobileNumber));
              } else {
                this.setState({ isLoading: false, departments: [] }, () => this.goBack());
                Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
              }
            }).catch((error) => {
              console.error("Error ---> " + error);
              this.setState({ isLoading: false, suppliers: [] }, () => this.goBack());
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            });
          } else {
            this.setState({ isLoading: false, departments: [] }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false, suppliers: [] }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  getApproversListForRequisitionUsersByCompanyId(value, loginUserMobileNumber) {
    this.setState({ isLoading: true });
    ApiHelper("getapproverslistforrequisitionusersbycompanyid", { userId: loginUserMobileNumber, extraVariable: this.state.companies[this.state.selectedCompanyIndex].id }, "POST", value, false, false, false, false).then(data => {
      if (undefined !== data && null !== data) {
        if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
          this.setState({ approversList: data.respList }, () => this.getAllProjectsByCompanyId(value, loginUserMobileNumber));
        } else {
          this.setState({ isLoading: false, approversList: [] }, () => this.goBack());
          Toast.show('No Approvers found.', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        this.setState({ isLoading: false, approversList: [] }, () => this.goBack());
        Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, approversList: [] }, () => this.goBack());
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    })
  }

  getAllProjectsByCompanyId(value, loginUserMobileNumber) {
    this.setState({ isLoading: true });
    ApiHelper("getallprojectsbycompanyid", { userId: loginUserMobileNumber, extraVariable: 'Active,' + this.state.companies[this.state.selectedCompanyIndex].id }, "POST", value, false, false, false, false).then(data => {
      if (undefined !== data && null !== data) {
        if (undefined !== data.respList && null !== data.respList) {
          if (data.respList.length > 0) {
            let projectsList = [];
            projectsList.push({
              id: null,
              projectTitle: "Select One",
            });
            projectsList.push(...data.respList);
            this.setState({ projectsList: projectsList, selectedProjectIndex: 0, isMultiple: false }, () => this.getAllUOMs(value, loginUserMobileNumber));
          } else {
            this.setState({ isLoading: false, projectsList: [] }, () => this.goBack());
            Toast.show('No Active Projects found.', Toast.LONG, Toast.BOTTOM);
          }
        } else {
          this.setState({ isLoading: false, projectsList: [] }, () => this.goBack());
          Toast.show('No Projecs found.', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        this.setState({ isLoading: false, projectsList: [] }, () => this.goBack());
        Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, projectsList: [] }, () => this.goBack());
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    })
  }

  getAllUOMs(value, loginUserMobileNumber) {
    this.setState({ isLoading: true });
    ApiHelper("getalluoms", { userId: loginUserMobileNumber, extraVariable: 'Active' }, "POST", value, false, false, false, false).then(data => {
      if (undefined !== data && null !== data) {
        if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
          let uoms = [];
          uoms.push({
            id: null,
            uomNameLong: "Select One",
            uomNameShort: "Select One",
          });
          uoms.push(...data.respList);
          this.setState({ uoms: uoms, selectedUOMIndex: 0 }, () => this.getAllCurrencies(value, loginUserMobileNumber));
        } else {
          this.setState({ isLoading: false, uoms: [] }, () => this.goBack());
          Toast.show('No UOMs found.', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        this.setState({ isLoading: false, uoms: [] }, () => this.goBack());
        Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, uoms: [] }, () => this.goBack());
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    })
  }

  getAllCurrencies(value, loginUserMobileNumber) {
    this.setState({ isLoading: true });
    ApiHelper("getallcurrencies", { userId: loginUserMobileNumber, extraVariable: 'Active' }, "POST", value, false, false, false, false).then(data => {
      if (undefined !== data && null !== data) {
        if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
          let currencies = [];
          currencies.push({
            id: null,
            currencyLongName: "Select One",
            currencyShortName: "Select One",
            isPrefered: false,
          });
          currencies.push(...data.respList);
          let foundIndex = -1;
          for (let i = 0; i < currencies.length; i++) {
            if (currencies[i]["isPrefered"]) {
              foundIndex = i;
              break;
            }
          }
          if (foundIndex >= 0) {
            this.setState({ currencies: currencies, selectedCurrencyIndex: foundIndex }, () => this.getAllSuppliersByProjectId(true));
            // this.setState({ currencies: currencies, selectedCurrencyIndex: foundIndex }, () => this.getAllTransferType(value, loginUserMobileNumber, "forRequisition", false));
          } else {
            this.setState({ currencies: currencies, selectedCurrencyIndex: 0 }, () => this.getAllSuppliersByProjectId(true));
            // this.setState({ currencies: currencies, selectedCurrencyIndex: 0 }, () => this.getAllTransferType(value, loginUserMobileNumber, "forRequisition", false));
          }
        } else {
          this.setState({ isLoading: false, currencies: [] }, () => this.goBack());
          Toast.show('No UOMs found.', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        this.setState({ isLoading: false, currencies: [] }, () => this.goBack());
        Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, currencies: [] }, () => this.goBack());
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    })
  }

  getAllTransferType(value, loginUserMobileNumber, forType, cond) {
    this.setState({ isLoading: true });
    ApiHelper("getalltransfertype", { userId: loginUserMobileNumber, extraVariable: "Active," + forType }, "POST", value, false, false, false, false).then(data => {
      if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
        this.setState({ paymentType: data.respList });
        if (cond) {
          this.manipulatePaymentTypeObjForReimbursement(value, loginUserMobileNumber, forType, cond, data.respList, this.state.loginUserObj);
        } else {
          this.setState({ isLoading: false });
        }
      } else {
        this.setState({ isLoading: false, paymentType: [] }, () => this.goBack());
        Toast.show('Something Went Wrong. 5', Toast.LONG, Toast.BOTTOM);
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, paymentType: [] }, () => this.goBack());
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    });
  }

  manipulatePaymentTypeObjForReimbursement(value, loginUserMobileNumber, forType, cond, paymentTypeList, loginUserObj) {
    // let paymentType = data.respList;
    let foundIndex = -1;
    if (undefined != loginUserObj?.transferTypeObj && null != loginUserObj?.transferTypeObj) {
      let isMultiple = false;
      if (loginUserObj.transferTypeObj.length > 0) {
        if (loginUserObj.transferTypeObj.length > 1) {
          isMultiple = true;
          for (let i = 0; i < paymentTypeList.length; i++) {
            if (loginUserObj.transferTypeObj[0]?.id === paymentTypeList[i].id) {
              foundIndex = i;
              break;
            }
          }
        } else {
          foundIndex = 0;
          isMultiple = false;
        }
      }
      if (foundIndex >= 0) {
        for (let i = 0; i < paymentTypeList.length; i++) {
          paymentTypeList[i]["isSelected"] = false;
          if (i === foundIndex) {
            paymentTypeList[i]["isSelected"] = true;
          }
        }
        this.setState({ isLoading: false, selectedPaymentTypeIndex: foundIndex, paymentType: paymentTypeList, isObjectFound: (foundIndex >= 0), isMultiple: isMultiple });
      } else {
        this.getUserDetails(value, loginUserMobileNumber, forType, cond, paymentTypeList, loginUserObj);
      }
    } else {
      this.getUserDetails(value, loginUserMobileNumber, forType, cond, paymentTypeList, loginUserObj);
    }
  }

  getUserDetails(value, loginUserMobileNumber, forType, cond, paymentTypeList, loginUserObj) {
    ApiHelper("getuserbyid", { userId: loginUserMobileNumber, extraVariable: loginUserObj?.id }, "POST", value, false, false, false, false).then(data => {
      if (undefined !== data && null !== data) {
        if (undefined !== data.respObject && null !== data.respObject && Object.keys(data?.respObject).length > 0) {
          this.setState({ loginUserObj: data.respObject }, () => {
            if (cond) {
              this.manipulatePaymentTypeObjForReimbursement(value, loginUserMobileNumber, forType, cond, paymentTypeList, data.respObject);
            } else {
              this.setState({ isLoading: false, paymnetType: paymentTypeList });
            }
          });
        } else {
          this.setState({ isLoading: false, paymentType: [] }, () => this.goBack());
          Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        this.setState({ isLoading: false, paymentType: [] }, () => this.goBack());
        Toast.show('Something Went Wrong. 6', Toast.LONG, Toast.BOTTOM);
      }
    }).catch((error) => {
      console.error("Error ---> " + error);
      this.setState({ isLoading: false, paymentType: [] }, () => this.goBack());
      Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
    });
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

  goBack() {
    this.props.navigation.reset({ index: 0, routes: [{ name: 'Requisition' }] })
  }

  handleProjectTitle(text) {
    const re = /^[a-zA-Z ]*$/;
    let conditionalText = text;
    if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0 && re.test(conditionalText)) {
      if ((conditionalText + "").length >= 4 && (conditionalText + "").length <= 15) {
        this.setState({ projectTitle: conditionalText, projectTitleError: false, projectTitleErrorMsg: "", isProjectTitleSatisfied: true });

      } else if ((conditionalText + "").length <= 4) {
        this.setState({ projectTitle: conditionalText, projectTitleError: true, projectTitleErrorMsg: "Project Title should be min. 4 characters", isProjectTitleSatisfied: false });
      } else {
        this.setState({ projectTitleError: true, projectTitleErrorMsg: "Enter Project Title", isProjectTitleSatisfied: false });

      }
    } else {
      this.setState({ projectTitle: conditionalText, projectTitleError: false, projectTitleErrorMsg: "", isProjectTitleSatisfied: true });
    }
  }

  handleProjectCode(text) {
    const re = /^[a-zA-Z ]*$/;
    let conditionalText = text;
    if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0 && re.test(conditionalText)) {
      if ((conditionalText + "").length >= 4 && (conditionalText + "").length <= 15) {
        this.setState({ projectCode: conditionalText, projectCodeError: false, projectCodeErrorMsg: "", isProjectCodeSatisfied: true });

      } else if ((conditionalText + "").length <= 4) {
        this.setState({ projectCode: conditionalText, projectCodeError: true, projectCodeErrorMsg: "Project Code should be min. 4 characters", isProjectCodeSatisfied: false });

      } else {
        this.setState({ projectCodeError: true, projectCodeErrorMsg: "Enter Project Code", isProjectCodeSatisfied: false });

      }
    } else {
      this.setState({ projectCode: conditionalText, projectCodeError: false, projectCodeErrorMsg: "", isProjectCodeSatisfied: true });

    }
  }

  handleDescription(text) {
    // const re = /^[a-zA-Z0-9 ]*$/;
    let conditionalText = text + "";
    // if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0 && re.test(conditionalText)) {
    if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0) {
      if ((conditionalText + "").length >= 4 && (conditionalText + "").length <= 40) {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.description = conditionalText;
        this.setState({ requisitionFormObj: requisitionFormObj, vatAmountError: false, vatAmountErrorMsg: "", isVatAmountSatisfied: true });

      } else if ((conditionalText + "").length < 1) {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.description = conditionalText;
        this.setState({ requisitionFormObj: requisitionFormObj, vatAmountError: true, vatAmountErrorMsg: "Vat should be min. 1 characters", isVatAmountSatisfied: false });

      } else {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.description = conditionalText;
        this.setState({ requisitionFormObj: requisitionFormObj, vatAmountError: true, vatAmountErrorMsg: "Enter Vat", isVatAmountSatisfied: false });

      }
    } else {
      let requisitionFormObj = this.state.requisitionFormObj;
      requisitionFormObj.description = "";
      this.description.clear();
      this.setState({ requisitionFormObj: requisitionFormObj, vatAmountError: conditionalText, projectCodeError: false, vatAmountErrorMsg: "", isVatAmountSatisfied: true });

    }
  }

  onChangeUP(text) {
    let conditionalText = (text + "").trim();
    let requisitionFormObj = this.state.requisitionFormObj;
    requisitionFormObj.unitPrice = conditionalText;
    this.setState({ requisitionFormObj: requisitionFormObj });
  }

  handleUnitPrice(text) {
    this.setState({ isLoading: true });
    let conditionalText = (text + "").trim();
    if (undefined !== conditionalText && null !== conditionalText && (conditionalText + "").length > 0 && !isNaN(conditionalText)) {
      try {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.unitPrice = conditionalText;
        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleQuantity(this.state.requisitionFormObj.quantity));
      } catch (error) {
        console.error("Error ---> " + error);
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.unitPrice = 0.0;
        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleQuantity(this.state.requisitionFormObj.quantity));
      }
    } else {
      if (undefined != conditionalText && null != conditionalText && (conditionalText + "").length > 0) {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.unitPrice = parseFloat((conditionalText + "").substring(0, conditionalText.length - 1));

        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleQuantity(this.state.requisitionFormObj.quantity));
      } else {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.unitPrice = 0.0;
        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleQuantity(this.state.requisitionFormObj.quantity));
      }
    }
  }

  handleQuantity(text) {
    let conditionalText = (text + "").trim();
    if (undefined !== conditionalText && null !== conditionalText && (conditionalText + "").length > 0 && !isNaN(conditionalText)) {
      try {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.quantity = parseFloat(conditionalText).toFixed(2);
        requisitionFormObj.productTotal = parseFloat(parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity)).toFixed(3);
        this.setState({ requisitionFormObj: requisitionFormObj }, () => {
          if (this.state.discountType[1].isSelected) {
            this.handleDiscountPercentage(this.state.requisitionFormObj.discountPercentage)
          } else {
            this.handleDiscountAmount(this.state.requisitionFormObj.discountAmount);
          }
        });
      } catch (error) {
        console.error("Error ---> " + error);
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.quantity = 0.00;
        requisitionFormObj.productTotal = parseFloat(parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity)).toFixed(3);
        this.setState({ requisitionFormObj: requisitionFormObj }, () => {
          if (this.state.discountType[1].isSelected) {
            this.handleDiscountPercentage(this.state.requisitionFormObj.discountPercentage)
          } else {
            this.handleDiscountAmount(this.state.requisitionFormObj.discountAmount);
          }
        });
      }
    } else {
      if (undefined != conditionalText && null != conditionalText && (conditionalText + "").length > 0) {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.quantity = parseFloat((conditionalText + "").substring(0, conditionalText.length - 1)).toFixed(2);
        requisitionFormObj.productTotal = parseFloat(parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity)).toFixed(3);
        this.setState({ requisitionFormObj: requisitionFormObj }, () => {
          if (this.state.discountType[1].isSelected) {
            this.handleDiscountPercentage(this.state.requisitionFormObj.discountPercentage)
          } else {
            this.handleDiscountAmount(this.state.requisitionFormObj.discountAmount);
          }
        });
      } else {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.quantity = 0.00;
        requisitionFormObj.productTotal = parseFloat(parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity)).toFixed(3);
        this.setState({ requisitionFormObj: requisitionFormObj }, () => {
          if (this.state.discountType[1].isSelected) {
            this.handleDiscountPercentage(this.state.requisitionFormObj.discountPercentage)
          } else {
            this.handleDiscountAmount(this.state.requisitionFormObj.discountAmount);
          }
        });
      }
    }
  }

  onChangeDiscountPercentage(text) {
    let conditionalText = (text + "").trim();
    let requisitionFormObj = this.state.requisitionFormObj;
    requisitionFormObj.discountPercentage = conditionalText;
    // requisitionFormObj.discountPercentage = (parseFloat(conditionalText));
    this.setState({ requisitionFormObj: requisitionFormObj });
  }

  handleDiscountPercentage(text) {
    let conditionalText = (text + "").trim();
    if (undefined !== conditionalText && null !== conditionalText && (conditionalText + "").length > 0 && !isNaN(conditionalText)) {
      if (parseFloat(conditionalText) > 0 && parseFloat(conditionalText) < 99) {
        let requisitionFormObj = this.state.requisitionFormObj;

        let ttlAmt = parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity);

        requisitionFormObj.discountPercentage = (parseFloat(conditionalText));
        requisitionFormObj.discountAmount = ((ttlAmt / 100) * parseFloat(conditionalText)).toFixed(3);
        requisitionFormObj.discountType = "Percentage";

        let ttlAmtAfterDis = parseFloat(ttlAmt - requisitionFormObj.discountAmount).toFixed(3);
        requisitionFormObj.productTotal = ttlAmtAfterDis;

        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleVat(this.state.requisitionFormObj.vatPercentage));

      } else {
        let requisitionFormObj = this.state.requisitionFormObj;
        let ttlAmt = parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity);


        requisitionFormObj.discountPercentage = 0.0;
        requisitionFormObj.discountAmount = 0.0;
        requisitionFormObj.discountType = "Percentage";

        let ttlAmtAfterDis = parseFloat(ttlAmt - requisitionFormObj.discountAmount).toFixed(3);
        requisitionFormObj.productTotal = ttlAmtAfterDis;

        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleVat(this.state.requisitionFormObj.vatPercentage));
      }
    } else {
      let requisitionFormObj = this.state.requisitionFormObj;
      let ttlAmt = parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity);


      requisitionFormObj.discountPercentage = 0.0;
      requisitionFormObj.discountAmount = 0.0;
      requisitionFormObj.discountType = "Percentage";

      let ttlAmtAfterDis = parseFloat(ttlAmt - requisitionFormObj.discountAmount).toFixed(3);
      requisitionFormObj.productTotal = ttlAmtAfterDis;

      this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleVat(this.state.requisitionFormObj.vatPercentage));
    }
  }

  onChangeDiscountAmount(text) {
    let conditionalText = (text + "").trim();
    let requisitionFormObj = this.state.requisitionFormObj;
    requisitionFormObj.discountAmount = conditionalText;
    // requisitionFormObj.discountAmount = (parseFloat(conditionalText));
    this.setState({ requisitionFormObj: requisitionFormObj });
  }

  handleDiscountAmount(text) {
    let conditionalText = (text + "").trim();
    if (undefined !== conditionalText && null !== conditionalText && (conditionalText + "").length > 0 && !isNaN(conditionalText)) {
      if (parseFloat(conditionalText) > 0 && parseFloat(conditionalText) < 99) {
        let requisitionFormObj = this.state.requisitionFormObj;

        let ttlAmt = parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity);

        requisitionFormObj.discountPercentage = 0.0;
        requisitionFormObj.discountAmount = (parseFloat(conditionalText)).toFixed(3);
        requisitionFormObj.discountType = "Amount";

        let ttlAmtAfterDis = parseFloat(ttlAmt - requisitionFormObj.discountAmount).toFixed(3);
        requisitionFormObj.productTotal = ttlAmtAfterDis;

        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleVat(this.state.requisitionFormObj.vatPercentage));

      } else {
        let requisitionFormObj = this.state.requisitionFormObj;
        let ttlAmt = parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity);


        requisitionFormObj.discountPercentage = 0.0;
        requisitionFormObj.discountAmount = 0.0;
        requisitionFormObj.discountType = "Amount";

        let ttlAmtAfterDis = parseFloat(ttlAmt - requisitionFormObj.discountAmount).toFixed(3);
        requisitionFormObj.productTotal = ttlAmtAfterDis;

        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleVat(this.state.requisitionFormObj.vatPercentage));
      }
    } else {
      let requisitionFormObj = this.state.requisitionFormObj;
      let ttlAmt = parseFloat(requisitionFormObj.unitPrice) * parseFloat(requisitionFormObj.quantity);


      requisitionFormObj.discountPercentage = 0.0;
      requisitionFormObj.discountAmount = 0.0;
      requisitionFormObj.discountType = "Amount";

      let ttlAmtAfterDis = parseFloat(ttlAmt - requisitionFormObj.discountAmount).toFixed(3);
      requisitionFormObj.productTotal = ttlAmtAfterDis;

      this.setState({ requisitionFormObj: requisitionFormObj }, () => this.handleVat(this.state.requisitionFormObj.vatPercentage));
    }
  }

  handleVat(text) {
    let conditionalText = (text + "").trim();
    if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0 && !isNaN(conditionalText)) {
      let requisitionFormObj = this.state.requisitionFormObj;
      requisitionFormObj.vatPercentage = conditionalText;

      requisitionFormObj.totalVAT = parseFloat((parseFloat(requisitionFormObj.productTotal) / 100) * parseFloat(requisitionFormObj.vatPercentage)).toFixed(3);

      requisitionFormObj.totalAmount = parseFloat(parseFloat(requisitionFormObj.productTotal) + parseFloat(requisitionFormObj.totalVAT)).toFixed(3);

      this.setState({ requisitionFormObj: requisitionFormObj, isLoading: false });
    } else {
      if (undefined != conditionalText && null != conditionalText && (conditionalText + "").length > 0) {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.vatPercentage = conditionalText;

        requisitionFormObj.totalVAT = parseFloat((parseFloat(requisitionFormObj.productTotal) / 100) * parseFloat(requisitionFormObj.vatPercentage)).toFixed(3);

        requisitionFormObj.totalAmount = parseFloat(parseFloat(requisitionFormObj.productTotal) + parseFloat(requisitionFormObj.totalVAT)).toFixed(3);

        this.setState({ requisitionFormObj: requisitionFormObj, isLoading: false });
      } else {
        let requisitionFormObj = this.state.requisitionFormObj;
        requisitionFormObj.vatPercentage = 0.0;

        requisitionFormObj.totalVAT = parseFloat((parseFloat(requisitionFormObj.productTotal) / 100) * parseFloat(requisitionFormObj.vatPercentage)).toFixed(3);

        requisitionFormObj.totalAmount = parseFloat(parseFloat(requisitionFormObj.productTotal) + parseFloat(requisitionFormObj.totalVAT)).toFixed(3);

        this.setState({ requisitionFormObj: requisitionFormObj, isLoading: false });
      }
    }
  }

  onProjectChangeListener(itemIndex) {
    this.setState({ isLoading: true });
    if (itemIndex > 0) {
      this.setState({ isLoading: false, selectedProjectIndex: itemIndex });
      // this.setState({ selectedProjectIndex: itemIndex }, () => this.getAllSuppliersByProjectId(true));
    } else {
      this.setState({ isLoading: false })
    }
  }

  getAllSuppliersByProjectId(cond) {
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            let reqObject = {
              userId: loginUserMobileNumber,
              extraVariable: "Active," + this.state.companies[this.state.selectedCompanyIndex].id
              // extraVariable: "Active," + this.state.projectsList[this.state.selectedProjectIndex].id
            };
            ApiHelper("getallsuppliersbyprojectid", reqObject, "POST", value, false, false, false, false).then(data => {
              if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
                let suppliers = [];
                suppliers.push({
                  id: null,
                  supplierName: "Select One",
                });
                suppliers.push(...data.respList);
                if (cond) {
                  this.setState({ suppliers: suppliers }, () => this.getAllTransferType(value, loginUserMobileNumber, "forRequisition", false));
                } else {
                  this.setState({ suppliers: suppliers, isLoading: false });
                }
              } else {
                this.setState({ isLoading: false, suppliers: [] });
                // this.setState({ isLoading: false, suppliers: [] }, () => this.goBack());
                Toast.show('No Supplier Found.', Toast.LONG, Toast.BOTTOM);
              }
            }).catch((error) => {
              console.error("Error ---> " + error);
              this.setState({ isLoading: false, suppliers: [] });
              // this.setState({ isLoading: false, suppliers: [] }, this.goBack());
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            });
          } else {
            this.setState({ isLoading: false, suppliers: [] }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false, suppliers: [] }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  onUOMChangeListener(itemIndex) {
    this.setState({ isLoading: true });
    if (itemIndex > 0) {
      this.setState({ selectedUomIndex: itemIndex });
      setTimeout(() => {
        this.unitPriceFocus();
        this.setState({ isLoading: false })
      }, 500);
    } else {
      this.unitPriceFocus();
      this.setState({ isLoading: false })
    }
  }

  unitPriceFocus() {
    this.unitPrice.focus();
    this.unitPrice.clear();
    this.unitPrice.setNativeProps({ text: this.state.requisitionFormObj?.unitPrice + "" });
  }

  onCurrencyChangeListener(itemIndex) {
    this.setState({ isLoading: true });
    if (itemIndex > 0) {
      this.setState({ selectedCurrencyIndex: itemIndex });
      setTimeout(() => {
        this.setState({ isLoading: false })
      }, 500);
    } else {
      this.setState({ isLoading: false })
    }
  }

  onDepartmentChangeListener(itemIndex) {
    this.setState({ isLoading: true });
    if (itemIndex > 0) {
      this.setState({ selectedDepartmentIndex: itemIndex });
      setTimeout(() => {
        this.setState({ isLoading: false })
      }, 500);
    } else {
      this.setState({ isLoading: false })
    }
  }

  onSupplierChangeListener(itemIndex) {
    this.setState({ isLoading: true });
    if (itemIndex > 0) {
      if (!this.state.formType[0].isSelected) {
        // let paymentType = this.state.paymentType;
        // let foundIndex = -1;
        if (undefined != this.state.suppliers[itemIndex].transferTypeObj && null != this.state.suppliers[itemIndex].transferTypeObj) {
          // let isMultiple = false;
          // if (this.state.suppliers[itemIndex].transferTypeObj.length > 0) {
          //   if (this.state.suppliers[itemIndex].transferTypeObj.length > 1) {
          //     isMultiple = true;
          //     for (let i = 0; i < paymentType.length; i++) {
          //       if (this.state.suppliers[itemIndex].transferTypeObj[0]?.id === paymentType[i].id) {
          //         foundIndex = i;
          //         break;
          //       }
          //     }
          //   } else {
          //     foundIndex = 0;
          //   }
          // }
          // if (foundIndex >= 0) {
          //   for (let i = 0; i < paymentType.length; i++) {
          //     paymentType[i]["isSelected"] = false;
          //     if (i === foundIndex) {
          //       paymentType[i]["isSelected"] = true;
          //     }
          //   }
          //   this.setState({ selectedPaymentTypeIndex: foundIndex, paymentType: paymentType, isObjectFound: (foundIndex >= 0), isMultiple: isMultiple });
          // } else { }

          let transferTypesList = this.state.suppliers[itemIndex].transferTypeObj;
          for (let i = 0; i < transferTypesList.length; i++) {
            transferTypesList[i]["isSelected"] = false;
            if (i === 0) {
              transferTypesList[i]["isSelected"] = true;
            }
          }

          this.setState({ selectedPaymentTypeIndex: 0, paymentType: transferTypesList, isObjectFound: true, isMultiple: transferTypesList.length > 1 });


        } else { }
        if (this.state.suppliers[itemIndex]?.fields?.length > 0) {
          this.setState({ fieldsDisplayLength: this.state.suppliers[itemIndex]?.fields?.length, fieldsDisplayLengthBk: this.state.suppliers[itemIndex]?.fields?.length });
        }
      }
      this.setState({ selectedSupplierIndex: itemIndex });
      setTimeout(() => {
        this.setState({ isLoading: false })
      }, 500);
    } else {
      this.setState({ isLoading: false })
    }
  }

  updatePaymentSelection(itemIndex) {
    let paymentTypeList = this.state.paymentType;
    for (let i = 0; i < paymentTypeList.length; i++) {
      if (i === itemIndex) {
        paymentTypeList[i].isSelected = true;
      } else {
        paymentTypeList[i].isSelected = false;
      }
    }
    this.setState({ paymentType: paymentTypeList })
  }

  element = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      <TouchableOpacity onPress={() => { this.setState({ isEdit: true, rowIndex: rowIndex, requisitionFormObj: this.state.requisitionTableData[rowIndex], modalVisible: true }) }} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'edit'} color={"white"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.onDeleteRequisitionItem(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "red", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'trash'} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  cellDataFromObj = (rowIndex, cellIndex) => {
    switch (cellIndex) {
      case 0:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{rowIndex + 1}</Text>);
      case 1:
        return (<Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitionTableData[rowIndex].description}</Text>);
      case 2:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitionTableData[rowIndex].uomObj?.uomNameShort}</Text>);
      case 3:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{parseFloat(this.state.requisitionTableData[rowIndex].quantity).toFixed(2)}</Text>);
      case 4:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{parseFloat(this.state.requisitionTableData[rowIndex].unitPrice).toFixed(3)}</Text>);
      case 5:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{parseFloat(this.state.requisitionTableData[rowIndex].productTotal).toFixed(3)}</Text>);
      case 6:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{parseFloat(this.state.requisitionTableData[rowIndex].discountAmount).toFixed(3)}</Text>);
      // return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitionTableData[rowIndex].discountPercentage + "% = " + parseFloat(this.state.requisitionTableData[rowIndex].discountAmount).toFixed(3)}</Text>);
      case 7:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{parseFloat(this.state.requisitionTableData[rowIndex].totalVAT).toFixed(3)}</Text>);
      // return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.requisitionTableData[rowIndex].vatPercentage + "% = " + parseFloat(this.state.requisitionTableData[rowIndex].totalVAT).toFixed(3)}</Text>);
      case 8:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{parseFloat(this.state.requisitionTableData[rowIndex].totalAmount).toFixed(3)}</Text>);
      default:
        return this.element(rowIndex);
    }
  }

  cellDataFromObjForTotal = (rowIndex, cellIndex, cellData) => {
    switch (cellIndex) {
      case 0:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}></Text>);
      case 1:
        return (<Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}></Text>);
      case 2:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}></Text>);
      case 3:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}></Text>);
      case 4:
        return (<Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 14, color: "black", alignSelf: "center" }}>Total Amount</Text>);
      case 5:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{parseFloat(cellData).toFixed(3)}</Text>);
      case 6:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{parseFloat(cellData).toFixed(3)}</Text>);
      case 7:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{parseFloat(cellData).toFixed(3)}</Text>);
      case 8:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{parseFloat(cellData).toFixed(3)}</Text>);
      default:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}></Text>);
    }
  }

  validateRequisitionItemFormInput() {
    if (undefined != this.state.requisitionFormObj.description && null != this.state.requisitionFormObj.description && (this.state.requisitionFormObj.description + "").length > 0) {
      if (undefined != this.state.selectedUomIndex && null != this.state.selectedUomIndex && this.state.selectedUomIndex > 0) {
        if (undefined != this.state.selectedUomIndex && null != this.state.selectedUomIndex && this.state.selectedUomIndex > 0) {
          let requisitionFormObj = this.state.requisitionFormObj;
          requisitionFormObj.uomObj = this.state.uoms[this.state.selectedUomIndex];
          this.setState({ requisitionFormObj: requisitionFormObj }, () => this.nextValidationForRequisitionItemFeilds());
        } else {
          this.nextValidationForRequisitionItemFeilds();
        }
      } else {
        Toast.show('Select One UOM.', Toast.LONG, Toast.BOTTOM);
      }
    } else {
      Toast.show('Enter Description.', Toast.LONG, Toast.BOTTOM);
    }
  }

  nextValidationForRequisitionItemFeilds() {
    if (undefined != this.state.requisitionFormObj.unitPrice && null != this.state.requisitionFormObj.unitPrice && parseFloat(this.state.requisitionFormObj.unitPrice) > 0) {
      if (undefined != this.state.requisitionFormObj.discountPercentage && null != this.state.requisitionFormObj.discountPercentage && this.state.requisitionFormObj.discountPercentage >= 0) {
        this.validateRemainingRequisitionItemFeilds();
      } else {
        let requisitionFormObj = this.state.requisitionFormObj
        requisitionFormObj.discountPercentage = 0;
        this.setState({ requisitionFormObj: requisitionFormObj }, () => this.validateRemainingRequisitionItemFeilds());
      }
    } else {
      Toast.show('Enter Unit Price.', Toast.LONG, Toast.BOTTOM);
    }
  }

  validateRemainingRequisitionItemFeilds() {
    if (undefined != this.state.requisitionFormObj.quantity && null != this.state.requisitionFormObj.quantity && parseFloat(this.state.requisitionFormObj.quantity) > 0) {
      if (undefined != this.state.requisitionFormObj.vatPercentage && null != this.state.requisitionFormObj.vatPercentage && parseFloat(this.state.requisitionFormObj.vatPercentage) >= 0) {
        this.addDataToList();
      } else {
        Toast.show('Enter VAT.', Toast.LONG, Toast.BOTTOM);
      }
    } else {
      Toast.show('Enter Quantity.', Toast.LONG, Toast.BOTTOM);
    }
  }

  addDataToList() {
    if (this.state.isEdit) {
      if (this.state.rowIndex >= 0) {
        let newRequisitionTableData = [];
        for (let i = 0; i < this.state.requisitionTableData.length; i++) {
          if (i === this.state.rowIndex) {
            newRequisitionTableData.push(this.state.requisitionFormObj);
          } else {
            newRequisitionTableData.push(requisitionTableData[i]);
          }
        }
        let totalOfProductTotal = 0;
        let totalOfDiscountAmount = 0;
        let totalOfVat = 0;
        let totalOfTotalAmount = 0;
        for (let i = 0; i < newRequisitionTableData.length; i++) {
          totalOfProductTotal = parseFloat(totalOfProductTotal) + parseFloat(newRequisitionTableData[i].productTotal);
          totalOfDiscountAmount = parseFloat(totalOfDiscountAmount) + parseFloat(newRequisitionTableData[i]?.discountAmount);
          totalOfVat = parseFloat(totalOfVat) + parseFloat(newRequisitionTableData[i].totalVAT);
          totalOfTotalAmount = parseFloat(totalOfTotalAmount) + parseFloat(newRequisitionTableData[i].totalAmount);
        }
        let list = ['', '', '', '', 'Total Value', totalOfProductTotal, totalOfDiscountAmount, totalOfVat, totalOfTotalAmount, ''];
        let requisitionTableTotalData = [];
        requisitionTableTotalData.push(list);
        this.setState({ isEdit: false, rowIndex: -1, requisitionTableData: newRequisitionTableData, requisitionFormObj: this.state.emptyRequisitionFormObj, modalVisible: false, requisitionTableTotalData: requisitionTableTotalData });
      } else {
        Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
      }
    } else {
      let requisitionTableData = this.state.requisitionTableData;
      requisitionTableData.push(this.state.requisitionFormObj);
      let totalOfProductTotal = 0.0;
      let totalOfDiscountAmount = 0.0;
      let totalOfVat = 0.0;
      let totalOfTotalAmount = 0.0;
      for (let i = 0; i < requisitionTableData.length; i++) {
        totalOfProductTotal = parseFloat(totalOfProductTotal) + parseFloat(requisitionTableData[i].productTotal);
        totalOfDiscountAmount = parseFloat(totalOfDiscountAmount) + parseFloat(requisitionTableData[i]?.discountAmount);
        totalOfVat = parseFloat(totalOfVat) + parseFloat(requisitionTableData[i].totalVAT);
        totalOfTotalAmount = parseFloat(totalOfTotalAmount) + parseFloat(requisitionTableData[i].totalAmount);
      }
      let list = ['', '', '', '', 'Total Value', totalOfProductTotal, totalOfDiscountAmount, totalOfVat, totalOfTotalAmount, ''];
      let requisitionTableTotalData = [];
      requisitionTableTotalData.push(list);
      this.setState({ isEdit: false, rowIndex: -1, requisitionTableData: requisitionTableData, requisitionFormObj: this.state.emptyRequisitionFormObj, modalVisible: false, requisitionTableTotalData: requisitionTableTotalData });
    }
  }

  onAdd() {
    if (this.state.selectedCurrencyIndex > 0) {
      let requisitionFormObj = {
        description: "",
        uomObj: null,
        unitPrice: 0,
        quantity: 1.00,
        productTotal: 0,
        vatPercentage: 10,
        totalVAT: 0,
        totalAmount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        discountType: "Amount",
        requisitionObj: null,
        requisitionId: null,
        createdBy: null,
        createdDate: new Date(),
      }
      let discountType = this.state.discountType;
      discountType[0].isSelected = true;
      discountType[1].isSelected = false;
      this.setState({ requisitionFormObj: requisitionFormObj, discountType: discountType, selectedUomIndex: 0, modalVisible: true })
    } else {
      Toast.show('Select One Currency.', Toast.LONG, Toast.BOTTOM);
    }
  }

  validateRequisitionFormFields() {
    if (undefined != this.state.selectedDepartmentIndex && null != this.state.selectedDepartmentIndex && this.state.selectedDepartmentIndex > 0) {
      if (undefined != this.state.selectedProjectIndex && null != this.state.selectedProjectIndex && this.state.selectedProjectIndex > 0) {
        if (this.checkIsSupplierMandatory()) {
          if (undefined != this.state.selectedSupplierIndex && null != this.state.selectedSupplierIndex && this.state.selectedSupplierIndex > 0) {
            if (this.checkPaymentType()) {
              this.supplierCondRemainingFeildsValidation();
            } else {
              Toast.show('Select One Payment Type.', Toast.LONG, Toast.BOTTOM);
            }
          } else {
            Toast.show('Select One Supplier.', Toast.LONG, Toast.BOTTOM);
          }
        } else {
          this.supplierCondRemainingFeildsValidation();
        }
      } else {
        Toast.show('Select One Project.', Toast.LONG, Toast.BOTTOM);
      }
    } else {
      Toast.show('Select One Department.', Toast.LONG, Toast.BOTTOM);
    }
  }

  checkIsSupplierMandatory() {
    if (this.state.formType[1].isSelected) {
      return true;
    } else {
      return false;
    }
  }

  supplierCondRemainingFeildsValidation() {
    if (undefined != this.state.requisitionTableData && null != this.state.requisitionTableData && this.state.requisitionTableData.length > 0) {
      if (undefined != this.state.attachments && null != this.state.attachments && this.state.attachments.length > 0) {
        if (this.state.approversList?.length > 0) {
          if (this.state.approversList?.length > 1) {
            this.setState({ showApproverModal: true });
          } else {
            this.setState({ showApproverModal: true });
            // this.submitRequisition(requisitionReqObj);
          }
        } else {
          Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        Toast.show('Add atleast one attachment.', Toast.LONG, Toast.BOTTOM);
      }
    } else {
      Toast.show('Fill requisition form.', Toast.LONG, Toast.BOTTOM);
    }
  }

  onApproverChangeListener(itemIndex) {
    this.setState({ isLoading: true });
    if (itemIndex >= 0) {
      this.setState({ selectedApproverIndex: itemIndex });
      setTimeout(() => {
        this.setState({ isLoading: false })
      }, 500);
    } else {
      this.setState({ isLoading: false })
    }
  }

  handleNotes(text) {
    // const re = /^[a-zA-Z0-9 ]*$/;
    let conditionalText = text + "";
    // if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0 && re.test(conditionalText)) {
    if (undefined !== conditionalText && null !== conditionalText && conditionalText.length > 0) {
      this.setState({ notes: conditionalText });
    } else {
      this.setState({ notes: "" });
    }
  }

  submitAprover() {
    if (undefined != this.state.approversList && null != this.state.approversList && this.state.approversList?.length > 1) {
      if (undefined != this.state.selectedApproverIndex && null != this.state.selectedApproverIndex && this.state.selectedApproverIndex >= 0) {
        let requisitionReqObj = {
          projectObj: this.state.projectsList[this.state.selectedProjectIndex],
          requisitionCreatedOn: new Date(),
          transferTypeObj: this.getPaymentType(),
          supplierObj: this.state.suppliers[this.state.selectedSupplierIndex],
          companyObj: this.state.companies[this.state.selectedCompanyIndex],
          preferedApprover: this.state.approversList[this.state.selectedApproverIndex],
          attachments: this.state.attachments,
          productTotal: parseFloat(this.state.requisitionTableTotalData[0][5]),
          discountTotal: parseFloat(this.state.requisitionTableTotalData[0][6]),
          vatTotal: parseFloat(this.state.requisitionTableTotalData[0][7]),
          finalAmount: parseFloat(this.state.requisitionTableTotalData[0][8]),
          otherDeliveryAddress: false,
          address: "",
          requisitionProductses: this.state.requisitionTableData,

          departmentObj: this.state.departments[this.state.selectedDepartmentIndex],
          typeOfForm: this.state.formType[0].isSelected ? this.state.formType[0].title : this.state.formType[1].title,
          fields: this.state.formType[0].isSelected ? this.state.loginUserObj.fields : this.state.suppliers[this.state.selectedSupplierIndex].fields,
          currencyObj: this.state.currencies[this.state.selectedCurrencyIndex],
          globalNotes: (undefined != this.state.notes && null != this.state.notes && this.state.notes.length > 0) ? this.state.notes : ""
        }
        this.submitRequisition(requisitionReqObj);
      } else {
        Toast.show('Select One Approver.', Toast.LONG, Toast.BOTTOM);
      }
    } else {
      let requisitionReqObj = {
        departmentObj: this.state.departments[this.state.selectedDepartmentIndex],
        projectObj: this.state.projectsList[this.state.selectedProjectIndex],
        typeOfForm: this.state.formType[0].isSelected ? this.state.formType[0].title : this.state.formType[1].title,
        requisitionCreatedOn: new Date(),
        transferTypeObj: this.getPaymentType(),
        fields: this.state.formType[0].isSelected ? this.state.loginUserObj.fields : this.state.suppliers[this.state.selectedSupplierIndex].fields,
        supplierObj: this.state.suppliers[this.state.selectedSupplierIndex],
        companyObj: this.state.companies[this.state.selectedCompanyIndex],
        preferedApprover: this.state.approversList[0],
        attachments: this.state.attachments,
        productTotal: parseFloat(this.state.requisitionTableTotalData[0][5]),
        discountTotal: parseFloat(this.state.requisitionTableTotalData[0][6]),
        vatTotal: parseFloat(this.state.requisitionTableTotalData[0][7]),
        finalAmount: parseFloat(this.state.requisitionTableTotalData[0][8]),
        requisitionProductses: this.state.requisitionTableData,
        otherDeliveryAddress: false,
        address: "",
        currencyObj: this.state.currencies[this.state.selectedCurrencyIndex],
        globalNotes: (undefined != this.state.notes && null != this.state.notes && this.state.notes.length > 0) ? this.state.notes : ""
      }
      this.submitRequisition(requisitionReqObj);
    }
  }

  submitRequisition(requisitionReqObj) {
    this.setState({ isLoading: true, showApproverModal: false })
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            ApiHelper("createrequisition", { userId: loginUserMobileNumber, reqObject: requisitionReqObj }, "POST", value, false, false, false, false).then(data => {
              if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                  case 0:
                    Toast.show('Requisition submitted successfully.', Toast.LONG, Toast.BOTTOM);
                    this.setState({ isLoading: false }, () => this.goBack());
                    break;
                  default:
                    Toast.show('Server Error, please try after sometime or contact admin.', Toast.LONG, Toast.BOTTOM);
                    this.setState({ isLoading: false }, () => this.goBack());
                    break;
                }
              } else {
                Toast.show('Something Went Wrong.', Toast.LONG, Toast.BOTTOM);
                this.setState({ isLoading: false }, () => this.goBack());
              }
            }).catch((error) => {
              console.error("Error ---> " + error);
              this.setState({ isLoading: false }, () => this.goBack());
              Toast.show('Please try again later.', Toast.LONG, Toast.BOTTOM);
            });
          } else {
            this.setState({ isLoading: false }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  onDeleteRequisitionItem(rowIndex) {
    this.setState({ deleteRowIndex: rowIndex, showDeleteModal: true })
  }

  deleteRequisitionItem() {
    let requisitionTableData = this.state.requisitionTableData;
    requisitionTableData.splice(this.state.deleteRowIndex, 1);

    let totalOfProductTotal = 0;
    let totalOfVat = 0;
    let totalOfTotalAmount = 0;
    let totalOfDiscountAmount = 0;
    for (let i = 0; i < requisitionTableData.length; i++) {
      totalOfProductTotal += requisitionTableData[i].productTotal;
      totalOfDiscountAmount = parseFloat(totalOfDiscountAmount) + parseFloat(newRequisitionTableData[i]?.discountAmount);
      totalOfVat += requisitionTableData[i].totalVAT;
      totalOfTotalAmount += requisitionTableData[i].totalAmount;
    }
    let list = ['', '', '', '', 'Total Value', totalOfProductTotal, totalOfDiscountAmount, totalOfVat, totalOfTotalAmount, ''];
    let requisitionTableTotalData = [];
    requisitionTableTotalData.push(list);
    this.setState({ requisitionTableData: requisitionTableData, showDeleteModal: false, deleteRowIndex: -1, requisitionTableTotalData: requisitionTableTotalData });
  }

  checkPaymentType() {
    let index = -1;
    for (let i = 0; i < this.state.paymentType.length; i++) {
      try {
        if (this.state.paymentType[i].isSelected) {
          index = i;
          break;
        }
      } catch (error) {
        console.error("Error ---> " + error)
      }
    }
    return index >= 0;
  }

  getPaymentType() {
    let index = -1;
    for (let i = 0; i < this.state.paymentType.length; i++) {
      try {
        if (this.state.paymentType[i].isSelected) {
          index = i;
          break;
        }
      } catch (error) {
        console.error("Error ---> " + error)
      }
    }
    if (index >= 0) {
      return this.state.paymentType[index];
    } else {
      return null;
    }
  }

  launchCameras = () => {
    ImagePicker.openCamera({ includeBase64: true, mediaType: 'photo', compressImageQuality: 0.7 }).then(image => {
      let attachments = this.state.attachments;
      let fileName = (undefined != image.path && null != image.path) ? (image.path + "").substring((image.path + "").lastIndexOf("/"), (image.path + "").length) : ("ABC" + (new Date().getMilliseconds()));
      // let fileName = (undefined != image.path && null != image.path) ? (image.path + "").substring((image.path + "").lastIndexOf("/"), (image.path + "").length - 1) : "ABC";
      let audioRecordingObj = {
        type: image.mime,
        fileName: fileName.substring(1, fileName.length),
        // fileName: fileName,
        uri: image.path,
        base64: image.data
      }
      attachments.push(audioRecordingObj);
      this.setState({ attachments: attachments });
    });
  }

  // launchImageLibrarys = async () => {
  //   try {
  //     ImagePicker.openPicker({ includeBase64: true, mediaType: 'photo', compressImageQuality: 0.7 }).then(image => {
  //       let attachments = this.state.attachments;
  //       let fileName = (undefined != image.path && null != image.path) ? (image.path + "").substring((image.path + "").lastIndexOf("/"), (image.path + "").length) : ("ABC" + (new Date().getMilliseconds()));
  //       let audioRecordingObj = {
  //         type: image.mime,
  //         // fileName: fileName,
  //         fileName: fileName.substring(1, fileName.length),
  //         uri: image.path,
  //         base64: image.data
  //       }
  //       attachments.push(audioRecordingObj);
  //       this.setState({ attachments: attachments });
  //     });
  //   } catch (error) {
  //     console.error("Error: --> " + error);
  //   }
  // }

  launchImageLibrarys = async () => {
    try {
      this.setState({ isLoading: true });
      ImagePicker.openPicker({ includeBase64: true, mediaType: 'photo', compressImageQuality: 0.7 }).then(image => {
        let attachments = this.state.attachments;
        let fileName = (undefined != image.path && null != image.path) ? (image.path + "").substring((image.path + "").lastIndexOf("/"), (image.path + "").length) : ("ABC" + (new Date().getMilliseconds()));
        ImgCom.compress(image.path, { compressionMethod: "auto" }).then((value) => {
          stat(value).then((res) => {
            RNFS.readFile(res.originalFilepath, 'base64').then(imageBase64 => {
              let audioRecordingObj = {
                type: image.mime,
                fileName: fileName.substring(1, fileName.length),
                uri: res.path,
                base64: imageBase64
              }
              attachments.push(audioRecordingObj);
              this.setState({ attachments: attachments, isLoading: false });
            }).catch(reason => { console.error("Error ---> " + reason); this.setState({ isLoading: false }) });
          })
        }).catch((reason) => { console.error("error ---> " + reason); this.setState({ isLoading: false }) }).finally(() => this.setState({ isLoading: false }));
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
          RNFS.readFile(res[0].fileCopyUri, 'base64').then(imageBase64 => {
            let attachments = this.state.attachments;
            audioRecordingObj["base64"] = imageBase64;
            attachments.push(audioRecordingObj);
            this.setState({ attachments: attachments })
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

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "Requisition applicartion needs access to your camera",
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
      console.error("Error ---> " + err);
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
        let attachments = this.state.attachments;
        let audioRecordingObj = this.state.audioRecordingObj;
        audioRecordingObj["base64"] = imageBase64;
        attachments.push(audioRecordingObj);
        this.setState({ attachments: attachments, audioRecordingObj: audioRecordingObj })
      }).catch(reason => { console.error("Error ---> " + reason) })
    })
  };

  onStartPlay = async (path, attachmentIndex) => {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    const msg = await this.audioRecorderPlayer.startPlayer(path);
    this.audioRecorderPlayer.setVolume(1.0);
    this.audioRecorderPlayer.addPlayBackListener((e) => {
      let attachments = this.state.attachments;
      attachments[attachmentIndex]["isPlaying"] = true;
      this.setState({ attachments: attachments });
      if (e.currentPosition === e.duration) {
        let attachments = this.state.attachments;
        attachments[attachmentIndex]["isPlaying"] = false;
        this.setState({ attachments: attachments });
        this.audioRecorderPlayer.stopPlayer();
        this.audioRecorderPlayer.removePlayBackListener();
      }
    });
  };

  onPausePlay = async (e) => {
    await this.audioRecorderPlayer.pausePlayer();
  };

  onStopPlay = async (e) => {
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
    this.setState({ isPlaying: false });
  };

  onFileCLicked(attachmentIndex) {
    let attachment = this.state.attachments[attachmentIndex];
    if ((attachment.type + "").toLowerCase().startsWith("audio")) {
      this.onStartPlay(attachment.uri, attachmentIndex);
    } else if ((attachment.type + "").toLowerCase().startsWith("image")) {
      this.setState({ activeImageURI: attachment.uri, imageModal: true });
    } else if ((attachment.type + "").toLowerCase().endsWith("pdf")) {
      this.setState({ url: attachment.uri, showPDF: true })
    }
  }

  updateDiscountTypeSelection(index) {
    this.setState({ isLoading: true });
    let discountType = this.state.discountType;
    for (let i = 0; i < discountType.length; i++) {
      discountType[i].isSelected = false;
    }
    discountType[index].isSelected = true;
    this.setState({ discountType: discountType, isLoading: false });
  }

  updateFormTypeSelection(index) {
    this.setState({ isLoading: true });
    let formType = this.state.formType;
    for (let i = 0; i < formType.length; i++) {
      formType[i].isSelected = false;
    }
    formType[index].isSelected = true;
    this.setState({ formType: formType, selectedSupplierIndex: -1, selectedPaymentTypeIndex: -1, isObjectFound: false, isMultiple: false });
    AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
      if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
        AsyncStorage.getItem(sessionKeys.authToken).then(value => {
          if (undefined != value && null != value && value.length > 0) {
            this.getAllTransferType(value, loginUserMobileNumber, formType[index].key, (index === 0))
          } else {
            this.setState({ isLoading: false, suppliers: [] }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false, suppliers: [] }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  attachmentElement = (rowIndex) => (
    <View style={{ alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
      {(this.state.attachments[rowIndex]?.type + "").toLowerCase().startsWith("audio") ?
        <TouchableOpacity onPress={() => this.state.attachments[rowIndex]?.isPlaying ? this.onStopPlay() : this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={this.state.attachments[rowIndex]?.isPlaying ? 'stop' : 'play'} color={"white"} />
        </TouchableOpacity>
        :
        <TouchableOpacity onPress={() => this.onFileCLicked(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "green", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} solid={true} name={'eye'} color={"white"} />
        </TouchableOpacity>
      }
      <TouchableOpacity onPress={() => this.onDeleteAttachmentItem(rowIndex)} style={{ width: 25, height: 25, backgroundColor: "red", borderRadius: 12, marginLeft: 5, alignItems: "center", justifyContent: "center" }}>
        <Icon size={12} solid={true} name={'trash'} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  onDeleteAttachmentItem = (rowIndex) => {
    let attachments = this.state.attachments;
    attachments.splice(rowIndex, 1);
    this.setState({ attachments: attachments });
  }

  cellDataFromObjForAttachment = (rowIndex, cellIndex) => {
    switch (cellIndex) {
      case 0:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{rowIndex + 1}</Text>);
      case 1:
        return (<Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center", textAlign: "center" }}>{this.state.attachments[rowIndex]?.fileName}</Text>);
      case 2:
        return (<Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", alignSelf: "center" }}>{this.state.attachments[rowIndex]?.type}</Text>);
      case 3:
        return this.attachmentElement(rowIndex);
      default:
        return (<Text></Text>);
    }
  }

  showSupplierWebView() {
    // let url = "http://localhost:3000/#/mobilesuppliers?authToken=41036509K8jJCC6zmqpCGFVSegcX7w==&loginUserId=32002566&companyId=620cc4408f649f47d8722f45"
    AsyncStorage.getItem(sessionKeys.authToken).then(value => {
      if (undefined != value && null != value && value.length > 0) {
        AsyncStorage.getItem(sessionKeys.loginUserMobileNumber).then(loginUserMobileNumber => {
          if (undefined != loginUserMobileNumber && null != loginUserMobileNumber && loginUserMobileNumber.length > 0) {
            let url = useLocalURL ? "http://192.168.0.101:3000/#/mobilesuppliers?" : "http://requisition.kecc.me/#/mobilesuppliers?"
            let urlParams = `authToken=${value}&loginUserId=${loginUserMobileNumber}&companyId=${this.state.companies[this.state.selectedCompanyIndex]?.id}`;
            this.setState({ webViewURL: url + urlParams }, () => this.setState({ showSupplierModal: true }));
          } else {
            this.setState({ isLoading: false, departments: [] }, () => this.logout());
            Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
          }
        });
      } else {
        this.setState({ isLoading: false, suppliers: [] }, () => this.logout());
        Toast.show('Invalid Credintials.', Toast.LONG, Toast.BOTTOM);
      }
    });
  }

  handleWebViewNavigationStateChange = newNavState => {
    // newNavState looks something like this:
    // {
    //   url?: string;
    //   title?: string;
    //   loading?: boolean;
    //   canGoBack?: boolean;
    //   canGoForward?: boolean;
    // }
    const { url } = newNavState;
    if (!url) return;

    if (url === (useLocalURL ? "http://192.168.0.101:3000/#/" : "http://requisition.kecc.me/#/")) {
      this.webview.stopLoading();
      this.setState({ showSupplierModal: false, webViewURL: "", isLoading: true });
      this.getAllSuppliersByProjectId(false);
    }
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1, width: width, height: height }} >
        <StatusBar hidden={false} />
        <ScrollView style={{ flex: 1, width: width, height: height }} contentContainerStyle={{ padding: 10 }}>
          <Loader isVisible={this.state.isLoading} />
          <Icon size={18} solid={true} name={'long-arrow-alt-left'} color={"black"} style={{ marginBottom: 10 }} onPress={() => this.goBack()} />
          <View style={{ backgroundColor: "#c8e1ff", padding: 5, width: width - 20, borderRadius: 10, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
            <View style={{ width: (width - 30), flexDirection: "row" }}>
              <View style={{ width: (width - 30) * 0.22, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Date</Text>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black" }}>{new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear()}</Text>
              </View>

              <View style={{ width: (width - 30) * 0.45, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Company</Text>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black" }}>{this.state.companies[this.state.selectedCompanyIndex]?.companyName}</Text>
              </View>

              <View style={{ width: (width - 30) * 0.33, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", marginBottom: 5 }}>Currency *</Text>
                <View pointerEvents={(undefined != this.state.requisitionTableData && null != this.state.requisitionTableData && this.state.requisitionTableData.length > 0) ? 'none' : 'auto'} style={{ borderRadius: 15, borderWidth: 1, borderColor: (undefined != this.state.requisitionTableData && null != this.state.requisitionTableData && this.state.requisitionTableData.length > 0) ? "grey" : "black", overflow: "hidden", width: "100%", height: 35, padding: 0, backgroundColor: "#c8e1ff" }}>
                  <Picker mode={"dropdown"} selectedValue={this.state.selectedCurrencyIndex} style={{ width: "100%", height: 25, marginTop: -10, padding: 0, margin: 0, color: (undefined != this.state.requisitionTableData && null != this.state.requisitionTableData && this.state.requisitionTableData.length > 0) ? "grey" : "black" }}
                    itemStyle={{ fontWeight: "bold" }} onValueChange={(itemValue, itemIndex) => this.onCurrencyChangeListener(itemIndex)}>
                    {this.state.currencies.map((currencyObj, index) => (
                      <Picker.Item label={currencyObj.currencyShortName} value={index} key={index} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={{ display: "none", width: (width - 30), marginTop: 5, flexDirection: "row" }}>
              <View style={{ width: ((width - 30) / 2) - 10, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Project Title*</Text>
                <TextInput
                  ref={(input) => { this.projectTitle = input; }}
                  keyboardType="default"
                  defaultValue={this.state.projectTitle}
                  value={this.state.projectTitle}
                  onChangeText={(text) => this.handleProjectTitle(text)}
                  placeholder="Enter Project Title"
                  placeholderTextColor="grey"
                  style={{ borderBottomWidth: 1, width: "100%", height: 35, color: "black" }}
                  onSubmitEditing={(event) => this.projectCode.focus()}
                  returnKeyType="next" />
                <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "500", color: "red", display: this.state.projectTitleError ? "flex" : "none" }}>{this.state.projectTitleErrorMsg}</Text>
              </View>
              <View style={{ width: 10, flexDirection: "column" }} />
              <View style={{ width: ((width - 30) / 2) - 10, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Project Code*</Text>
                <TextInput
                  ref={(input) => { this.projectCode = input; }}
                  keyboardType="default"
                  defaultValue={this.state.projectCode}
                  value={this.state.projectCode}
                  onChangeText={(text) => this.handleProjectCode(text)}
                  placeholder="Enter Project Code"
                  placeholderTextColor="grey"
                  style={{ borderBottomWidth: 1, width: "100%", height: 35, color: "black" }}
                  onSubmitEditing={(event) => Keyboard.dismiss}
                  returnKeyType="done" />
                <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "500", color: "red", display: this.state.projectCodeError ? "flex" : "none" }}>{this.state.projectCodeErrorMsg}</Text>
              </View>
            </View>

            <View style={{ width: (width - 30), marginTop: 5, flexDirection: "column", justifyContent: "space-between" }}>
              <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Form Type *</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 5 }}>
                {this.state.formType.map((formTypeObj, index) => (
                  <TouchableOpacity key={index} onPress={() => this.updateFormTypeSelection(index)} style={{ flexDirection: "row" }}>
                    <Icon size={18} name={formTypeObj.isSelected ? 'check-circle' : 'circle'} color={formTypeObj.isSelected ? bgColorCode : "black"} />
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: formTypeObj.isSelected ? "bold" : "normal", fontSize: 15, color: "black", marginLeft: 5 }}>{formTypeObj.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ width: (width - 30), marginTop: 5, flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: ((width - 30) * 0.50) - 10, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", marginBottom: 5 }}>Department *</Text>
                <View style={{ borderRadius: 15, borderWidth: 1, overflow: "hidden", width: "100%", height: 35, padding: 0, backgroundColor: "#c8e1ff" }}>
                  <Picker mode={"dropdown"} selectedValue={this.state.selectedDepartmentIndex} style={{ width: "100%", height: 25, marginTop: -10, padding: 0, margin: 0, color: "black" }}
                    itemStyle={{ fontWeight: "bold" }} onValueChange={(itemValue, itemIndex) => this.onDepartmentChangeListener(itemIndex)}>
                    {this.state.departments.map((departmentObj, index) => (
                      <Picker.Item label={departmentObj.departmentName} value={index} key={index} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ width: ((width - 30) * 0.50) - 10, flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", marginBottom: 5 }}>Project *</Text>
                <View style={{ borderRadius: 15, borderWidth: 1, overflow: "hidden", width: "100%", height: 35, padding: 0, backgroundColor: "#c8e1ff" }}>
                  <Picker mode={"dropdown"} selectedValue={this.state.selectedProjectIndex} style={{ width: "100%", height: 25, marginTop: -10, padding: 0, margin: 0, color: "black" }}
                    itemStyle={{ fontWeight: "bold" }} onValueChange={(itemValue, itemIndex) => this.onProjectChangeListener(itemIndex)}>
                    {this.state.projectsList.map((projectObj, index) => (
                      <Picker.Item label={projectObj.projectTitle} value={index} key={index} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={{ width: (width - 30), height: 35, marginTop: 20, marginBottom: this.state.selectedSupplierIndex > 0 ? 0 : 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ width: "90%", flexDirection: "column" }}>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", marginBottom: 5 }}>Suppliers {this.state.formType[1].isSelected ? "*" : ""}</Text>
                <View style={{ borderRadius: 15, borderWidth: 1, overflow: "hidden", width: "100%", height: 35, padding: 0, backgroundColor: "#c8e1ff" }}>
                  <Picker mode={"dropdown"} selectedValue={this.state.selectedSupplierIndex} style={{ width: "100%", height: 25, marginTop: -10, padding: 0, margin: 0, color: "black" }}
                    itemStyle={{ fontWeight: "bold" }} onValueChange={(itemValue, itemIndex) => this.onSupplierChangeListener(itemIndex)}>
                    {this.state.suppliers.map((supplierObj, index) => (
                      <Picker.Item label={supplierObj.supplierName} value={index} key={index} />
                    ))}
                  </Picker>
                </View>
              </View>

              <TouchableOpacity onPress={() => this.showSupplierWebView()} style={{ display: "flex", width: "8%", backgroundColor: bgColorCode, borderRadius: 10, alignItems: "center", justifyContent: "center", padding: 5 }}>
                <Icon size={12} solid={true} name={'plus'} color={"white"} />
              </TouchableOpacity>
            </View>

            {this.state.selectedSupplierIndex > 0 && <View style={{ width: (width - 30), marginTop: 20, flexDirection: "column", marginBottom: 5 }}>
              <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Payment Type {this.state.formType[0].isSelected ? "*" : ""}</Text>
              <View pointerEvents={(this.state.isObjectFound && !this.state.isMultiple) ? 'none' : 'auto'} style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 5 }}>
                {this.state.paymentType.map((paymnetTypeObj, index) => (
                  <TouchableOpacity key={index} onPress={() => this.updatePaymentSelection(index)} style={{ flexDirection: "row" }}>
                    <Icon size={18} name={paymnetTypeObj.isSelected ? 'check-circle' : 'circle'} color={(this.state.isObjectFound && !this.state.isMultiple) ? "lightgrey" : paymnetTypeObj.isSelected ? bgColorCode : "black"} />
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: paymnetTypeObj.isSelected ? "bold" : "normal", fontSize: 15, color: (this.state.isObjectFound && !this.state.isMultiple) ? "lightgrey" : "black", marginLeft: 5 }}>{paymnetTypeObj.transferTypeName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ display: "none", width: (width - 30), borderWidth: this.state.suppliers[this.state.selectedSupplierIndex]?.fields?.slice(0, this.state.fieldsDisplayLength).length > 0 ? 1 : 0 }}>
                {this.state.suppliers[this.state.selectedSupplierIndex]?.fields?.slice(0, this.state.fieldsDisplayLength).map((item, index) => (
                  <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 13, color: "black" }}>
                    {item.fieldName + ": "}
                    <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black" }}>{item.fieldValue}</Text>
                  </Text>
                ))}
              </View>
            </View>}
          </View>

          <View style={{ backgroundColor: "white", padding: 5, width: width - 20, borderRadius: 10, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
            <View style={{ display: "none", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", marginBottom: 10 }}>Requisition Details</Text>
              <TouchableOpacity onPress={() => this.onAdd()} style={{ width: "25%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, alignItems: "center", justifyContent: "space-evenly", flexDirection: "row", alignSelf: "flex-end" }}>
                <Icon size={12} solid={true} name={'plus'} color={"white"} />
              </TouchableOpacity>
            </View>

            <Icon size={12} solid={true} name={'plus'} color={"white"} onPress={() => this.onAdd()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, alignItems: "center", alignSelf: "flex-end" }} />

            <ScrollView horizontal={true}>
              <Table>
                <Row data={this.state.requisitionTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.widthArr} />
                <ScrollView style={styles.dataWrapper}>
                  {this.state.requisitionTableData.map((rowData, index) => (
                    <TableWrapper key={index} style={styles.row}>
                      {
                        <View style={{ flexDirection: "row" }}>
                          {this.state.widthArr.map((cellData, cellIndex) => (
                            <Cell key={cellIndex} width={this.state.widthArr[cellIndex]} data={this.cellDataFromObj(index, cellIndex)} textStyle={styles.text} />
                          ))}
                        </View>
                      }
                    </TableWrapper>
                  ))}
                </ScrollView>
                {this.state.requisitionTableTotalData.map((rowData, index) => (
                  <TableWrapper key={index} style={[styles.row, { backgroundColor: "#c8e1ff" }]}>
                    {
                      <View style={{ flexDirection: "row", alignItems: (index === 8) ? "center" : null, justifyContent: (index === 8) ? "center" : null }}>
                        {rowData.map((cellData, cellIndex) => (
                          <Cell key={cellIndex} width={this.state.widthArr[cellIndex]} data={this.cellDataFromObjForTotal(index, cellIndex, cellData)} textStyle={styles.textTotal} />
                        ))}
                      </View>
                    }
                  </TableWrapper>
                ))}
              </Table>
            </ScrollView>

            <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", justifyContent: "flex-end" }}>
              {this.state.attachments.length > 0 ?
                <TouchableOpacity onPress={() => this.RBSheet.open()} style={{ borderRadius: 10, padding: 10, marginBottom: 10, marginRight: 10 }}>
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 15, textDecorationLine: "underline", color: "black", textAlign: "center", marginRight: 10 }}>View Attachments</Text>
                </TouchableOpacity> : null}
              <TouchableOpacity onPress={() => this.requestCameraPermission()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, marginRight: 10 }}>
                <Icon size={16} solid={true} name={'camera'} color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.launchImageLibrarys()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, marginRight: 10 }}>
                <Icon size={16} solid={true} name={'images'} color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.selectFile()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, marginRight: 10 }}>
                <Icon size={16} solid={true} name={'file-invoice'} color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.state.isStartedRecording ? this.onStopRecord() : this.requestRecordPermission()} style={{ backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, alignItems: "center", justifyContent: "space-evenly", flexDirection: "row", alignSelf: "flex-end" }}>
                <Icon size={16} solid={true} name={this.state.isStartedRecording ? 'stop' : 'microphone'} color={"white"} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => this.validateRequisitionFormFields()} style={{ width: "80%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginBottom: 10, alignSelf: "center" }}>
            <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Submit</Text>
          </TouchableOpacity>

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
                elevation: 30,
              },
              wrapper: {
                backgroundColor: "transparent",
              },
              draggableIcon: {
                backgroundColor: "#000",
              }
            }}>
            <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black" }}>Attachments</Text>
            <View style={{ width: "100%", alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
              <ScrollView nestedScrollEnabled={true}>
                <Table style={{ backgroundColor: "#fff" }}>
                  <Row data={this.state.attachmentTableHeader} style={styles.header} textStyle={[styles.text, { fontWeight: "bold" }]} widthArr={this.state.attachmentWidthArr} />
                  {this.state.attachments.map((rowData, index) => (
                    <TableWrapper key={index} style={styles.row}>
                      {
                        <View style={{ flexDirection: "row" }}>
                          {this.state.attachmentWidthArr.map((cellData, cellIndex) => (
                            <Cell key={cellIndex} width={this.state.attachmentWidthArr[cellIndex]} height={20} data={this.cellDataFromObjForAttachment(index, cellIndex)} textStyle={styles.text} />
                          ))}
                        </View>
                      }
                    </TableWrapper>
                  ))}
                </Table>
              </ScrollView>
            </View>
          </RBSheet>

          <Modal animationType="fade" transparent={true}
            visible={this.state.showDeleteModal}
            onRequestClose={() => this.setState({ showDeleteModal: false })}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity onPress={() => this.setState({ showDeleteModal: false })} style={{ width: 30, height: 30, backgroundColor: "red", borderRadius: 15, position: "absolute", top: -10, right: -10, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={12} solid={true} name={'times'} color={"white"} />
                </TouchableOpacity>
                <Text numberOfLines={3} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black", marginBottom: 10 }}>Are you sure to delete requisition item named {this.state.requisitionTableData[this.state.deleteRowIndex]?.description}?</Text>
                <View style={{ width: (width * 0.9) - 20, padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}>
                  <TouchableOpacity onPress={() => this.setState({ deleteRowIndex: -1, showDeleteModal: false })} style={{ width: ((width * 0.9) - 20) * 0.3, backgroundColor: bgColorCode, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
                    <Icon size={16} solid={true} name={'times'} color={"white"} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.deleteRequisitionItem()} style={{ width: ((width * 0.9) - 20) * 0.3, backgroundColor: "red", borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
                    <Icon size={16} solid={true} name={'check'} color={"white"} />
                  </TouchableOpacity>
                </View>
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
                <Image source={{ uri: this.state.activeImageURI }} style={{ width: "100%", height: "100%", resizeMode: "stretch" }} />
              </View>
            </View>
          </Modal>

          <Modal animationType="fade" transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => this.setState({ modalVisible: false })}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity onPress={() => this.setState({ modalVisible: false })} style={{ width: 40, height: 40, backgroundColor: "red", borderRadius: 20, position: "absolute", top: -15, right: -15, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} solid={true} name={'times'} color={"white"} />
                </TouchableOpacity>
                <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black" }}>Requisition Details</Text>
                <View style={{ display: "flex", width: (width * 0.9) - 20, padding: 10, alignItems: "center" }}>
                  <View style={{ width: ((width * 0.9) - 20) - 10, flexDirection: "row", marginTop: 0, justifyContent: "space-between" }}>
                    <View style={{ width: (((width * 0.9) - 20) - 10) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Description *</Text>
                      <TextInput
                        ref={(input) => { this.description = input; }}
                        keyboardType="default"
                        defaultValue={this.state.requisitionFormObj.description}
                        numberOfLines={4}
                        value={this.state.requisitionFormObj.description}
                        onChangeText={(text) => this.handleDescription(text)}
                        placeholder="Enter Description"
                        placeholderTextColor="grey"
                        style={{ borderBottomWidth: 1, width: "100%", borderWidth: 1, color: "black" }}
                        onSubmitEditing={(event) => { this.uomPicker.focus(); }}
                        returnKeyType="next" />
                    </View>
                  </View>

                  <View style={{ width: ((width * 0.9) - 20) - 10, flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
                    <View style={{ width: ((((width * 0.9) - 20) - 10) * 0.40) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black", marginBottom: 5 }}>UOM *</Text>
                      <View style={{ borderRadius: 15, borderWidth: 1, overflow: "hidden", width: "100%", height: 35, padding: 0 }}>
                        <Picker ref={ref => this.uomPicker = ref} mode={"dropdown"} selectedValue={this.state.selectedUomIndex} style={{ width: "100%", height: 25, marginTop: -10, padding: 0, margin: 0, color: "black" }}
                          itemStyle={{ fontWeight: "bold" }} onValueChange={(itemValue, itemIndex) => this.onUOMChangeListener(itemIndex)}>
                          {this.state.uoms.map((uomObj, index) => (
                            <Picker.Item label={uomObj.uomNameShort} value={index} key={index} />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <View style={{ width: ((((width * 0.9) - 20) - 10) * 0.30) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Unit Price *</Text>
                      <TextInput
                        ref={(input) => { this.unitPrice = input; }}
                        // onFocus={() => { this.setState({ projectCodeError: !this.state.isProjectCodeSatisfied, projectCodeErrorMsg: this.state.isProjectCodeSatisfied ? "" : this.state.projectCodeErrorMsg.length > 0 ? this.state.projectCodeErrorMsg : this.state.selectedPosition >= 0 ? "" : "Enter Project Code" }) }}
                        keyboardType="numeric"
                        defaultValue={this.state.requisitionFormObj?.unitPrice + ""}
                        value={this.state.requisitionFormObj?.unitPrice + ""}
                        onEndEditing={(event) => this.handleUnitPrice(this.state.requisitionFormObj.unitPrice)}
                        onChangeText={(text) => this.onChangeUP(text)}
                        placeholder="Enter Unit Price"
                        placeholderTextColor="grey"
                        style={{ borderBottomWidth: 1, width: "100%", height: 35, color: "black" }}
                        onSubmitEditing={(event) => { this.quantity.focus(); this.quantity.clear(); this.quantity.setNativeProps({ text: this.state.requisitionFormObj?.quantity + "" }); }}
                        // onEndEditing={(event) => { this.quantity.focus(); this.quantity.clear(); this.quantity.setNativeProps({ text: this.state.requisitionFormObj?.quantity + "" }); }}
                        returnKeyType="next" />
                    </View>

                    <View style={{ width: ((((width * 0.9) - 20) - 10) * 0.30) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Quantity *</Text>
                      <TextInput
                        ref={(input) => { this.quantity = input; }}
                        // onFocus={() => { this.setState({ projectCodeError: !this.state.isProjectCodeSatisfied, projectCodeErrorMsg: this.state.isProjectCodeSatisfied ? "" : this.state.projectCodeErrorMsg.length > 0 ? this.state.projectCodeErrorMsg : this.state.selectedPosition >= 0 ? "" : "Enter Project Code" }) }}
                        onfocus={() => { }}
                        keyboardType="numeric"
                        defaultValue={this.state.requisitionFormObj?.quantity + ""}
                        value={this.state.requisitionFormObj?.quantity + ""}
                        onChangeText={(text) => this.handleQuantity(text)}
                        placeholder="Enter Unit Price"
                        placeholderTextColor="grey"
                        style={{ borderBottomWidth: 1, width: "100%", height: 35, color: "black" }}
                        onSubmitEditing={(event) => { this.discount.focus(); this.discount.clear(); this.discount.setNativeProps({ text: this.state.requisitionFormObj?.discountPercentage + "" }); }}
                        // onEndEditing={(event) => { this.discount.focus(); this.discount.clear(); this.discount.setNativeProps({ text: this.state.requisitionFormObj?.discountPercentage + "" }); }}
                        returnKeyType="next" />
                    </View>
                  </View>

                  <View style={{ width: ((width * 0.9) - 20) - 10, flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Discount Type: </Text>
                    {this.state.discountType.map((discountTypeObj, index) => (
                      <TouchableOpacity key={index} onPress={() => this.updateDiscountTypeSelection(index)} style={{ flexDirection: "row" }}>
                        <Icon size={18} name={discountTypeObj.isSelected ? 'check-circle' : 'circle'} color={discountTypeObj.isSelected ? bgColorCode : "black"} />
                        <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: discountTypeObj.isSelected ? "bold" : "normal", fontSize: 15, color: "black", marginLeft: 5 }}>{discountTypeObj.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={{ width: ((width * 0.9) - 20) - 10, flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
                    <View style={{ width: ((((width * 0.9) - 20) - 10) / 2) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Discount {this.state.discountType[1].isSelected ? "(%)" : ""}</Text>
                      <TextInput
                        ref={(input) => { this.discount = input; }}
                        keyboardType="numeric"
                        defaultValue={this.state.discountType[1].isSelected ? (this.state.requisitionFormObj.discountPercentage + "") : (this.state.requisitionFormObj.discountAmount + "")}
                        value={this.state.discountType[1].isSelected ? (this.state.requisitionFormObj.discountPercentage + "") : (this.state.requisitionFormObj.discountAmount + "")}
                        // onChangeText={(text) => this.state.discountType[1].isSelected ? this.onChangeDiscountPercentage(text) : this.onChangeDiscountAmount(text)}
                        // onEndEditing={(text) => this.state.discountType[1].isSelected ? this.handleDiscountPercentage(text) : this.handleDiscountAmount(text)}
                        onChangeText={(text) => this.state.discountType[1].isSelected ? this.handleDiscountPercentage(text) : this.handleDiscountAmount(text)}
                        placeholder={this.state.discountType[1].isSelected ? "Enter Discount Percentage" : "Enter Discount Amount"}
                        placeholderTextColor="grey"
                        style={{ borderBottomWidth: 1, width: "100%", height: 35, padding: 0, color: "black" }}
                        onSubmitEditing={(event) => { this.vat.focus(); this.vat.clear(); this.vat.setNativeProps({ text: this.state.requisitionFormObj?.vatPercentage + "" }); }}
                        returnKeyType="next" />
                    </View>

                    <View style={{ width: ((((width * 0.9) - 20) - 10) / 2) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Product Total Amount</Text>
                      <TextInput
                        ref={(input) => { this.totalAmount = input; }}
                        editable={false}
                        keyboardType="number-pad"
                        defaultValue={this.state.requisitionFormObj.productTotal + ""}
                        value={this.state.requisitionFormObj.productTotal + ""}
                        placeholder="Product Total Amount"
                        placeholderTextColor="grey"
                        style={{ borderWidth: 1, width: "100%", height: 35, padding: 0, paddingLeft: 10, color: "black" }}
                        onSubmitEditing={(event) => this.discount.focus()}
                        returnKeyType="next" />
                    </View>
                  </View>

                  <View style={{ width: ((width * 0.9) - 20) - 10, flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
                    <View style={{ width: ((((width * 0.9) - 20) - 10) / 2) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>VAT(%) *</Text>
                      <TextInput
                        ref={(input) => { this.vat = input; }}
                        keyboardType="numeric"
                        defaultValue={this.state.requisitionFormObj?.vatPercentage + ""}
                        value={this.state.requisitionFormObj?.vatPercentage + ""}
                        onChangeText={(text) => this.handleVat(text)}
                        placeholder="Enter Vat"
                        placeholderTextColor="grey"
                        style={{ borderBottomWidth: 1, width: "100%", height: 35, color: "black" }}
                        onSubmitEditing={(event) => Keyboard.dismiss()}
                        returnKeyType="done" />
                    </View>

                    <View style={{ width: ((((width * 0.9) - 20) - 10) / 2) - 5, flexDirection: "column" }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Total Amount</Text>
                      <TextInput
                        ref={(input) => { this.totalAmount = input; }}
                        editable={false}
                        keyboardType="number-pad"
                        defaultValue={parseFloat(" " + this.state.requisitionFormObj.totalAmount).toFixed(3)}
                        value={parseFloat(" " + this.state.requisitionFormObj.totalAmount).toFixed(3)}
                        placeholder="Total Amount"
                        placeholderTextColor="grey"
                        style={{ borderWidth: 1, width: "100%", height: 35, padding: 0, paddingLeft: 10, color: "black" }}
                        onSubmitEditing={(event) => this.discount.focus()}
                        returnKeyType="next" />
                    </View>
                  </View>

                  <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", marginTop: 5, fontSize: 10, color: "black", fontStyle: "italic" }}>Note: All currencies are in {this.state.currencies[this.state.selectedCurrencyIndex]?.currencyShortName}</Text>

                  <TouchableOpacity onPress={() => this.validateRequisitionItemFormInput()} style={{ width: "80%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginTop: 10, alignSelf: "center", alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
                    <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal animationType="fade" transparent={true}
            visible={this.state.showApproverModal}
            onRequestClose={() => this.setState({ showApproverModal: false })}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity onPress={() => this.setState({ showApproverModal: false })} style={{ width: 30, height: 30, backgroundColor: "red", borderRadius: 15, position: "absolute", top: -10, right: -10, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={12} solid={true} name={'times'} color={"white"} />
                </TouchableOpacity>
                {this.state.approversList?.length > 1 ?
                  <View>
                    <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 15, color: "black", marginBottom: 10 }}>Select One Apporver</Text>
                    <View style={{ width: ((width * 0.9) - 20) - 20, marginTop: 5, flexDirection: "column", }}>
                      <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Approvers *</Text>
                      <View style={{ borderRadius: 15, borderWidth: 1, overflow: "hidden", width: ((width * 0.9) - 20) - 20, height: 35, padding: 0, backgroundColor: "#FFF" }}>
                        <Picker mode={"dropdown"} selectedValue={this.state.selectedApproverIndex} style={{ width: "100%", color: "black", height: 25, marginTop: -10, marginLeft: 10, borderWidth: 1, borderRadius: 10 }}
                          itemStyle={{ fontWeight: "bold" }} onValueChange={(itemValue, itemIndex) => this.onApproverChangeListener(itemIndex)}>
                          {this.state.approversList?.map((approverObj, index) => (
                            <Picker.Item label={approverObj.fullName} value={index} key={index} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View> :
                  <View>
                    <View style={{ width: ((width * 0.9) - 20) - 10, flexDirection: "row", marginTop: 0, justifyContent: "space-between" }}>
                      <View style={{ width: (((width * 0.9) - 20) - 10) - 5, flexDirection: "column" }}>
                        <Text numberOfLines={1} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 14, color: "black" }}>Note (if any)</Text>
                        <TextInput
                          ref={(input) => { this.notes = input; }}
                          keyboardType="default"
                          defaultValue={this.state.notes}
                          numberOfLines={4}
                          value={this.state.notes}
                          onChangeText={(text) => this.handleNotes(text)}
                          placeholder="Enter Notes (if any)"
                          placeholderTextColor="grey"
                          style={{ borderBottomWidth: 1, width: "100%", borderWidth: 1, color: "black" }}
                          onSubmitEditing={(event) => { Keyboard.dismiss() }}
                          returnKeyType="done" />
                      </View>
                    </View>
                  </View>}
                <TouchableOpacity onPress={() => this.submitAprover()} style={{ width: "80%", backgroundColor: bgColorCode, borderRadius: 10, padding: 10, marginTop: 10, alignSelf: "center", alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
                  {/* <Icon size={16} solid={true} name={'hand-pointer'} color={"white"} /> */}
                  <Text numberOfLines={2} style={{ fontFamily: "Calibre-Medium", fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center", marginLeft: 5 }}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal animationType="fade" transparent={true}
            visible={this.state.showSupplierModal}
            onRequestClose={() => this.setState({ showSupplierModal: false })}>
            <View style={[styles.centeredView, { width: width, height: height, alignItems: "center", justifyContent: "center" }]}>
              <View style={[styles.modalView, { width: "90%", height: "90%" }]}>
                {/* <View style={{ zIndex: 10, position: "absolute", top: 0, left: 0, width: width - 20, height: height - 20, alignSelf: "center" }}> */}
                <WebView
                  ref={ref => (this.webview = ref)}
                  source={{ uri: this.state.webViewURL }}
                  onNavigationStateChange={this.handleWebViewNavigationStateChange}
                  javaScriptEnabled={true}
                  allowFileAccess={true}
                  allowingReadAccessToURL={true}
                  allowFileAccessFromFileURLs={true}
                  allowsLinkPreview={true}
                  cacheEnabled={false}
                  style={{ width: "100%", height: "100%" }} />
                {/* </View> */}
              </View>
            </View>
          </Modal>

          <Modal animationType="fade" transparent={true} visible={this.state.showPDF}
            onRequestClose={() => this.setState({ showPDF: !this.state.showPDF })}>
            <View style={[styles.centeredView, { width: height, height: width, padding: 20 }]}>
              <View style={[styles.modalView, { width: height - 40, height: width - 40, transform: [{ rotateZ: "90deg" }], marginRight: width * 0.8 }]}>
                <TouchableOpacity onPress={() => this.setState({ showPDF: !this.state.showPDF })} style={{ position: "absolute", top: -15, left: -15, zIndex: 100, height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                  <Icon size={24} name={'times'} color={"white"} onPress={() => this.setState({ showPDF: !this.state.showPDF })} />
                </TouchableOpacity>
                <Pdf
                  source={{ uri: this.state.url }}
                  onLoadComplete={(numberOfPages, filePath) => { }}
                  onPageChanged={(page, numberOfPages) => { }}
                  onError={(error) => { }}
                  onPressLink={(uri) => { }}
                  style={{ flex: 1, width: height - 60, height: width - 60 }} />
              </View>
            </View>
          </Modal>
        </ScrollView>
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