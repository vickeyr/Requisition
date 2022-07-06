import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { withRouter } from 'react-router-dom';
import { ApiHelper2, sessionKeys } from '../../utilities/ConstantVariable';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import moment from 'moment'
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { Accordion, AccordionTab } from 'primereact/accordion';

class RequisitionScreen extends React.Component {

    state = {
        showLoader: "flex",
        isFinanceLogin: false,
        shouldDisabledCompanyDropDown: false,
        companyObj: null,
        projectObj: null,
        departmentObj: null,
        fromDate: null,
        toDate: null,
        formTypeValues: [],
        projectsValues: [],
        departmentValues: [],
        supplierValues: [],
        projects: [],
        departments: [],
        suppliers: [],
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
        globalFilter: "",
        companies: [],
        dataList: [],
        payersBankDetailsList: [],
        payersBankDetailObj: null,
        paymentDate: null,
        txnOrChqNo: null,
        payingAmount: null,
        remarks: null,
        selectedRequisitionObj: null,
        showAttachmentForm: false,
        attachmentType: null,
        attachmentObj: null,
        showSettleForm: false,
        showPaymentForm: false,
        showExistingAttachments: false,
        selectedItem: null,
        showPaymentHistoryForm: false,
        paymentHistory: [],
        defaultLoadCond: true,
        activeIndex: [],
        loginUserObj: null
    }

    constructor(props) {
        super(props);
        let authToken = sessionStorage.getItem(sessionKeys.authToken);
        if (undefined !== authToken && null !== authToken && authToken.length > 0) {
            let lgnUrsObj = sessionStorage.getItem(sessionKeys.loginUserObj);
            if (undefined !== lgnUrsObj && null !== lgnUrsObj && lgnUrsObj.length > 0) {
                let prsdLgnUsrObj = JSON.parse(lgnUrsObj);
                if (undefined !== prsdLgnUsrObj && null !== prsdLgnUsrObj && prsdLgnUsrObj?.id?.length > 0) {
                    let conds = prsdLgnUsrObj?.roleObj?.roleName.toLowerCase().trim().includes("finance");
                    this.setState({ loginUserObj: prsdLgnUsrObj, isFinanceLogin: conds });
                    setTimeout(() => {
                        if (conds) {
                            let companies = prsdLgnUsrObj.companies;
                            if (null !== companies && undefined !== companies && companies.length > 0) {
                                this.setState({ companies: [...companies], loginUserObj: prsdLgnUsrObj, isFinanceLogin: conds });
                                setTimeout(() => {
                                    if (companies.length > 1) {
                                        this.setState({ shouldDisabledCompanyDropDown: false, showLoader: "none" })
                                        //new requirement as per disussion  
                                        {
                                            this.setState({ companyObj: companies[0], showLoader: "flex" });
                                            setTimeout(() => {
                                                this.loadProjects(companies[0], this.state.defaultLoadCond);
                                            }, 500);
                                        }
                                    } else {
                                        this.setState({ shouldDisabledCompanyDropDown: true, companyObj: companies[0], showLoader: "none" });
                                        setTimeout(() => {
                                            this.loadProjects(companies[0], this.state.defaultLoadCond);
                                        }, 500);
                                    }
                                }, 500);
                            } else {
                                sessionStorage.clear();
                                this.props.history.push("/");
                            }
                        } else {
                            this.setState({ companies: [], loginUserObj: prsdLgnUsrObj, isFinanceLogin: conds });
                            this.loadData();
                        }
                    }, 500);
                } else {
                    sessionStorage.clear();
                    this.props.history.push("/");
                }
            } else {
                sessionStorage.clear();
                this.props.history.push("/");
            }
        } else {
            sessionStorage.clear();
            this.props.history.push("/");
        }
    }

    loadProjects = async (companyObj, callCond) => {
        let reqObj = {
            extraVariable: "Active," + companyObj.id
        };
        ApiHelper2("getallprojectsbycompanyid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ projects: data.respList }, () => this.loadDepartments(companyObj, callCond));
            } else {
                this.loadDepartments(companyObj, callCond);
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.loadDepartments(companyObj, callCond);
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    loadDepartments = async (companyObj, callCond) => {
        let reqObj = {
            extraVariable: "Active," + companyObj.id
        };
        let companies = [];
        companies.push(companyObj);
        ApiHelper2("getalldepartmentsbycompanyid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ departments: data.respList }, () => this.loadSuppliers(companies, callCond));
            } else {
                this.loadSuppliers(companies, callCond);
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.loadSuppliers(companies, callCond);
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    loadData = async () => {
        let reqObj = {
            extraVariable: "Active"
        };
        ApiHelper2("getallcompanies", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                if (data.respList.length > 1) {
                    this.setState({ companies: data.respList, showLoader: "none" });
                } else {
                    this.setState({ companies: data.respList, showLoader: "flex" }, () => setTimeout(() => {
                        if (this.state.defaultLoadCond) {
                            this.setState({ companyObj: data.respList[0] })
                        }
                        this.loadProjects(data.respList[0], this.state.defaultLoadCond);
                    }, 500));
                }
            } else {
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Requisition Form <span style={{ fontSize: 11 }}>(Listing requisition/reimbursement form(s) requested by users which need to be settled.)</span></h5>
            </React.Fragment>
        )
    }

    rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" className="p-button-success p-mr-2 p-mb-2" onClick={this.onAdd} />
            </React.Fragment>
        )
    }

    onSettleRequisition(rowData) {
        this.setState({ showSettleForm: true, selectedRequisitionObj: rowData });
    }

    onMakingPayment(rowData) {
        this.setState({ showLoader: "none" })
        let reqObj = {
            extraVariable: "Active"
        };
        ApiHelper2("getallpayersbankdetails", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
                    if (rowData?.typeOfForm === "Reimbursment") {
                        this.setState({ payersBankDetailsList: data.respList, showLoader: "none", showPaymentForm: true, selectedRequisitionObj: rowData, payersBankDetailObj: null, paymentDate: new Date(), txnOrChqNo: "", payingAmount: rowData?.pendingAmount, remarks: "" });
                    } else {
                        this.setState({ payersBankDetailsList: data.respList, showLoader: "none", showPaymentForm: true, selectedRequisitionObj: rowData, payersBankDetailObj: null, paymentDate: new Date(), txnOrChqNo: "", payingAmount: null, remarks: "" });
                    }
                } else {
                    this.toast.show({ severity: 'error', summary: 'Payer\'s Bank Details Found', detail: 'Add it from the menu available at left.' });
                }
            } else {
                this.setState({ showLoader: "none", payersBankDetailsList: [], });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none", payersBankDetailsList: [], });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    lpoTemplate = (rowData) => {
        return (
            <div className="actions">
                <a href={rowData.lpoPdfUrl} target={"_blank"} style={{ color: "blue", textDecorationLine: "underline" }}>{rowData.lpoNumber}</a>
            </div>
        );
    }

    requisitionTemplate = (rowData) => {
        return (
            <div className="actions">
                <a href={rowData.pdfURL} target={"_blank"} style={{ color: "blue", textDecorationLine: "underline" }}>{rowData.requisitionId}</a>
            </div>
        );
    }

    paidAmountTemplate = (rowData) => {
        return (
            <div className="actions">
                <p onClick={() => this.getPaymentHistory(rowData)} style={{ color: "blue", textDecorationLine: "underline", cursor: "pointer" }}>{parseFloat(rowData.paidAmount).toFixed(3)}</p>
            </div>
        );
    }

    paidThroughTemplate = (rowData) => {
        return (
            <div className="actions">
                <p>{rowData.payersBankDetailObj.payersBankName + "(" + rowData.payersBankDetailObj.payersAccountNumber + ")"}</p>
            </div>
        );
    }

    paymentDateBody = (rowData) => {
        return (
            <div className="actions">
                <label>{moment(rowData?.paymentDate).format("DD-MM-YYYY")}</label>
            </div>
        );
    }

    paidToTemplate = (rowData) => {
        return (
            <div className="actions">
                {rowData?.fields?.map((item, index) =>
                    <>
                        <label>{rowData?.fields[index]?.fieldName + "(" + rowData?.fields[index]?.fieldValue + ")"}</label>
                        <br />
                    </>
                )}
            </div>
        );
    }

    getPaymentHistory(rowData) {
        if (rowData.paidAmount > 0) {
            this.setState({ showLoader: "flex" })
            let reqObj = {
                extraVariable: rowData.requisitionId
            };
            ApiHelper2("getallpaymenthistorybyrequisitionid", reqObj, "POST", false, false, false, false).then(data => {
                if (undefined !== data && null !== data) {
                    if (undefined !== data.respList && null !== data.respList && data.respList.length > 0) {
                        this.setState({ selectedRequisitionObj: rowData, paymentHistory: data.respList, showLoader: "none", showPaymentHistoryForm: true });
                    } else {
                        this.toast.show({ severity: 'error', summary: 'No Payment History Found', detail: 'Please Try After sometime.' });
                    }
                } else {
                    this.setState({ showLoader: "none", paymentHistory: [], });
                    this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
                }
            }).catch(reason => {
                console.error("Error ---> " + reason);
                this.setState({ showLoader: "none", paymentHistory: [], });
                this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
            });
        } else {
            this.toast.show({ severity: 'error', summary: 'Paid amount is zero', detail: 'Try making some payment.' });
        }
    }

    actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {/* <Button icon="pi pi-eye" className="p-button-rounded p-button-success p-mr-2" tooltip='View All Attachment' onClick={() => this.setState({ showExistingAttachments: true, selectedRequisitionObj: rowData })} /> */}
                <Button icon="pi pi-file" className="p-button-rounded p-button-success p-mr-2" tooltip='Add Attachment' onClick={() => this.setState({ showAttachmentForm: true, selectedRequisitionObj: rowData })} />
                {(rowData.pendingAmount > 0) ?
                    <Button icon="pi pi-money-bill" className="p-button-rounded p-button-warning p-mr-2" tooltip='Make Payment' onClick={() => this.onMakingPayment(rowData)} />
                    :
                    <Button icon="pi pi-power-off" className="p-button-rounded p-button-info p-mr-2" tooltip='Settle Requisition' onClick={() => this.onSettleRequisition(rowData)} />
                }
            </div>
        );
    }

    header = (
        <div className="table-header" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <Button icon="pi pi-file-excel" className="p-button-rounded p-button-success p-mr-2" tooltip='download data in excel' onClick={() => this.downloadTableDateExcel()} />
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
            </span>
        </div>
    )

    downloadTableDateExcel() {
        this.setState({ showLoader: "flex" });
        if (this.state.dataList.length > 0) {
            if (undefined !== this.state.dataList && null !== this.state.dataList && this.state.dataList.length > 0) {
                let reqObj = {
                    reqList: this.state.dataList
                };
                ApiHelper2("exportdatatoexcel", reqObj, "POST", false, false, false, false).then(data => {
                    if (undefined !== data && null !== data && undefined !== data.extraVariable && null !== data.extraVariable) {
                        this.setState({ showLoader: "none" });
                        window.open(data.extraVariable);
                    } else {
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
                    }
                }).catch(reason => {
                    console.error("Error ---> " + reason);
                    this.setState({ showLoader: "none" });
                    this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
                });
            } else {
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        } else {
            this.validateInputs();
        }
    }

    onPayersBankChange(e) {
        this.setState({ payersBankDetailObj: e.value });
    }

    onComapyChange(e) {
        this.setState({ companyObj: e.value, showLoader: "flex" });
        setTimeout(() => {
            this.loadProjects(e.value, this.state.defaultLoadCond);
        }, 500);
    }

    onProjectSelect(e) {
        this.setState({ projectsValues: e.value });
        // this.setState({ projectsValues: e.value, showLoader: "flex" });
        // this.loadSuppliers(e.value);
    }

    loadSuppliers(selectedCompanies, callCond) {
        let reqObj = {
            reqList: selectedCompanies
        };
        ApiHelper2("getallsuppliersbymultipleprojectid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                if (callCond) {
                    this.setState({ suppliers: data.respList }, () => {
                        let supplierValues = [];
                        if (undefined != this.state.suppliers && null != this.state.suppliers) {
                            supplierValues = this.state.suppliers;
                        } else {
                            supplierValues = [];
                        }
                        this.setState({
                            formTypeValues: this.state.formType,
                            departmentValues: this.state.departments,
                            projectsValues: this.state.projects,
                            supplierValues: supplierValues
                        }, () => this.validateInputs())
                    });
                } else {
                    this.setState({ suppliers: data.respList, showLoader: "none" });
                }
            } else {
                this.setState({ showLoader: "none", suppliers: [] });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none", suppliers: [] });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    validateInputs() {
        if (undefined !== this.state.formTypeValues && null !== this.state.formTypeValues && this.state.formTypeValues.length > 0) {
            if (undefined !== this.state.companyObj && null !== this.state.companyObj && this.state.companyObj?.id.length > 0) {
                if (undefined !== this.state.departmentValues && null !== this.state.departmentValues && this.state.departmentValues.length > 0) {
                    if (undefined !== this.state.projectsValues && null !== this.state.projectsValues && this.state.projectsValues?.length > 0) {
                        if ((undefined !== this.state.fromDate && null !== this.state.fromDate && (this.state.fromDate + "").length > 0) ||
                            (undefined !== this.state.toDate && null !== this.state.toDate && (this.state.toDate + "").length > 0)) {
                            if (undefined !== this.state.fromDate && null !== this.state.fromDate && (this.state.fromDate + "").length > 0) {
                                if (undefined !== this.state.toDate && null !== this.state.toDate && (this.state.toDate + "").length > 0) {
                                    this.getAllActiveRequisitionByConditions();
                                } else {
                                    this.setState({ showLoader: "none" });
                                    this.toast.show({ severity: 'info', summary: `Select To Date`, detail: "" });
                                }
                            } else {
                                if ((undefined !== this.state.toDate && null !== this.state.toDate && (this.state.toDate + "").length > 0)) {
                                    if (undefined !== this.state.fromDate && null !== this.state.fromDate && (this.state.fromDate + "").length > 0) {
                                        this.getAllActiveRequisitionByConditions();
                                    } else {
                                        this.setState({ showLoader: "none" });
                                        this.toast.show({ severity: 'info', summary: `Select From Date`, detail: "" });
                                    }
                                } else {
                                    this.getAllActiveRequisitionByConditions();
                                }
                            }
                        } else {
                            this.getAllActiveRequisitionByConditions();
                        }
                    } else {
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'info', summary: `Select Atleast One Project`, detail: "" });
                    }
                } else {
                    this.setState({ showLoader: "none" });
                    this.toast.show({ severity: 'info', summary: `Select Atleast One Department`, detail: "" });
                }
            } else {
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'info', summary: `Select One Company`, detail: "" });
            }
        } else {
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'info', summary: `Select Atleast One Form Type`, detail: "" });
        }
    }

    getAllActiveRequisitionByConditions = () => {
        this.setState({ showLoader: "flex" });
        this.onClick(-1);
        let reqObj = {
            reqObject: {
                formType: this.state.formTypeValues,
                companyObj: this.state.companyObj,
                departments: this.state.departmentValues,
                projects: this.state.projectsValues,
                suppliers: this.state.supplierValues,
                fromDate: this.state.fromDate,
                toDate: this.state.toDate,
                includeRaisedReq: false,
                isPartialPaymentScreen: true
            }
        }
        ApiHelper2("getallactiverequisitionbycondition", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        if (undefined !== data.respList && null !== data.respList) {
                            if (data.respList.length > 0) {
                                this.setState({ dataList: data.respList, showLoader: "none" });
                                this.dataTable.setState({ temp: (new Date().getMilliseconds()) })
                            } else {
                                this.setState({ dataList: [], showLoader: "none" });
                                this.dataTable.setState({ temp: (new Date().getMilliseconds()) })
                                this.toast.show({ severity: 'error', summary: `No records found`, detail: data.statusDesc });
                            }
                        } else {
                            this.setState({ dataList: [], showLoader: "none" });
                            this.dataTable.setState({ temp: (new Date().getMilliseconds()) })
                            this.toast.show({ severity: 'error', summary: `No records found`, detail: data.statusDesc });
                        }
                        break;
                    default:
                        this.setState({ dataList: [], showLoader: "none" });
                        this.dataTable.setState({ temp: (new Date().getMilliseconds()) })
                        this.toast.show({ severity: 'error', summary: `Failed to get requisition`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ dataList: [], showLoader: "none" });
                this.dataTable.setState({ temp: (new Date().getMilliseconds()) })
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ dataList: [], showLoader: "none" });
            this.dataTable.setState({ temp: (new Date().getMilliseconds()) })
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    onClick(itemIndex) {
        let activeIndex = this.state.activeIndex ? [...this.state.activeIndex] : [];

        if (activeIndex.length === 0) {
            activeIndex.push(itemIndex);
        }
        else {
            const index = activeIndex.indexOf(itemIndex);
            if (index === -1) {
                activeIndex.push(itemIndex);
            }
            else {
                activeIndex.splice(index, 1);
            }
        }
        this.setState({ activeIndex });
    }

    dateBody = (rowData) => {
        return (
            <div className="actions">
                <label>{moment(rowData?.approvedDate).format("DD-MM-YYYY")}</label>
            </div>
        );
    }

    objectDialogFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label={"Submit"} icon="pi pi-check" className="p-button-text" onClick={() => this.validateAttachmentInputs()} />
            </div>
        );
    }

    paymentDialogFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label={"Submit"} icon="pi pi-check" className="p-button-text" onClick={() => this.validatePaymentInputs()} />
            </div>
        );
    }

    hideDialog = () => {
        this.setState({ showAttachmentForm: false, showPaymentForm: false, showSettleForm: false, showExistingAttachments: false, showPaymentHistoryForm: false });
    }

    myUploader = (event) => {
        this.setState({ showLoader: "flex" });
        let base64 = "";
        let isError = false;
        let reader = new FileReader();
        reader.readAsDataURL(event.files[0]);
        reader.onload = function () {
            base64 = reader.result;
        };
        reader.onerror = function (error) {
            console.error('Error: ', error);
            isError = true;
        };
        let base64interval = setInterval(() => {
            if (isError) {
                this.setState({ showLoader: "none", attachmentObj: null });
                clearInterval(base64interval);
            } else {
                let attachmentObj = {
                    type: event.files[0].type,
                    fileName: event.files[0].name,
                    uri: event.files[0]?.objectURL,
                    base64: base64,
                    attachmentDate: new Date()
                }
                this.setState({ showLoader: "none", attachmentObj: attachmentObj, doesImageChoosen: true });
                clearInterval(base64interval);
            }
        }, 500);
    }

    clearUploadedImage = (event) => {
        this.setState({ attachmentObj: null, doesImageChoosen: false })
    }

    validateAttachmentInputs() {
        if (undefined !== this.state.attachmentType && null !== this.state.attachmentType) {
            if (undefined !== this.state.attachmentObj && null !== this.state.attachmentObj
                && undefined !== this.state.attachmentObj.base64 && null !== this.state.attachmentObj.base64 && this.state.attachmentObj.base64.length > 0
                && undefined !== this.state.attachmentObj.type && null !== this.state.attachmentObj.type && this.state.attachmentObj.type.length > 0) {
                if (undefined !== this.state.selectedRequisitionObj && null !== this.state.selectedRequisitionObj
                    && undefined !== this.state.selectedRequisitionObj.id && null !== this.state.selectedRequisitionObj.id && this.state.selectedRequisitionObj.id.length > 0) {
                    let attachmentObj = this.state.attachmentObj;
                    attachmentObj["attachmentType"] = this.state.attachmentType;
                    this.addAttachmentToRequisition(attachmentObj);
                } else {
                    this.toast.show({ severity: 'error', summary: 'Something went wrong', detail: '' });
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Upload Image', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Attachment Type', detail: '' });
        }
    }

    addAttachmentToRequisition = (attachmentObj) => {
        this.setState({ showLoader: "flex", showAttachmentForm: false });
        let reqObj = {
            reqObject: attachmentObj,
            extraVariable: this.state.selectedRequisitionObj.id
        }
        ApiHelper2("addattachmenttorequisition", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'success', summary: `Attachment successfully added`, detail: "" });
                        break;
                    default:
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to attachment`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    validatePaymentInputs() {
        if (undefined !== this.state.payersBankDetailObj && null !== this.state.payersBankDetailObj
            && undefined !== this.state.payersBankDetailObj.id && null !== this.state.payersBankDetailObj.id && (this.state.payersBankDetailObj.id + "").length > 0) {
            if (undefined !== this.state.paymentDate && null !== this.state.paymentDate && (this.state.paymentDate + "").length > 0) {
                if (undefined !== this.state.txnOrChqNo && null !== this.state.txnOrChqNo && (this.state.txnOrChqNo + "").length > 0) {
                    if (undefined !== this.state.payingAmount && null !== this.state.payingAmount && (this.state.payingAmount + "").length > 0) {
                        if (this.state.selectedRequisitionObj?.typeOfForm === "Reimbursment") {
                            this.createObjectAndCallAPI();
                        } else {
                            if (undefined !== this.state.remarks && null !== this.state.remarks && (this.state.remarks + "").length > 0) {
                                this.createObjectAndCallAPI();
                            } else {
                                this.toast.show({ severity: 'error', summary: 'Enter Remarks', detail: '' });
                            }
                        }
                    } else {
                        this.toast.show({ severity: 'error', summary: 'Enter Paying Amount', detail: '' });
                    }
                } else {
                    this.toast.show({ severity: 'error', summary: 'Enter Cheque No / Txn ID', detail: '' });
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Select Transaction Date', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Select One Bank Details', detail: '' });
        }
    }

    createObjectAndCallAPI() {
        let actualFeilds = [];
        let allFeilds = this.state.selectedRequisitionObj?.fields;
        let selectedFeilds = this.state.selectedRequisitionObj?.transferTypeObj?.fields;
        for (let i = 0; i < selectedFeilds.length; i++) {
            for (let j = 0; j < allFeilds.length; j++) {
                if (allFeilds[j].fieldName === selectedFeilds[i].fieldName) {
                    actualFeilds.push(allFeilds[j]);
                    break;
                }
            }
        }
        let paymentHistoryObj = {
            requisitionId: this.state.selectedRequisitionObj?.requisitionId,
            typeOfForm: this.state.selectedRequisitionObj?.typeOfForm,
            requisitionCreatedOn: this.state.selectedRequisitionObj?.requisitionCreatedOn,
            transferTypeid: this.state.selectedRequisitionObj?.transferTypeObj?.id,
            transferTypeName: this.state.selectedRequisitionObj?.transferTypeObj?.transferTypeName,
            fields: actualFeilds,
            createdById: this.state.selectedRequisitionObj?.createdBy?.id,
            createdBy: this.state.selectedRequisitionObj?.createdBy?.fullName,
            approverId: this.state.selectedRequisitionObj?.preferedApprover?.id,
            approverName: this.state.selectedRequisitionObj?.preferedApprover?.fullName,
            lpoNumber: this.state.selectedRequisitionObj?.lpoNumber,
            finalAmount: this.state.selectedRequisitionObj?.finalAmount,
            paidAmount: this.state.payingAmount,
            balanceAmount: parseFloat(this.state.selectedRequisitionObj?.pendingAmount).toFixed(3) - parseFloat(this.state.payingAmount).toFixed(3),
            paymentDate: this.state.paymentDate,
            chqNumberOrTxnId: this.state.txnOrChqNo,
            payersBankDetailObj: this.state.payersBankDetailObj,
            paidByObj: this.state.loginUserObj
        }
        this.makePayment(paymentHistoryObj);
    }

    makePayment = (paymentHistoryObj) => {
        this.setState({ showLoader: "flex", showPaymentForm: false });
        let reqObj = {
            reqObject: paymentHistoryObj
        }
        ApiHelper2("makepayment", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ showLoader: "flex" });
                        this.validateInputs();
                        this.toast.show({ severity: 'success', summary: `Payment record added successfully`, detail: "" });
                        break;
                    default:
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to add payment record`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    settleDialogFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.settleObject} />
            </div>
        )
    };

    settleObject = () => {
        // this.toast.show({ severity: 'info', summary: 'Done', detail: '' });
        this.setState({ showLoader: "flex", showSettleForm: false });
        let requisitionObj = this.state.selectedRequisitionObj;
        requisitionObj["settledBy"] = this.state.loginUserObj;
        let reqObj = {
            reqObject: requisitionObj
        }
        ApiHelper2("updaterequisitionstatus", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ showLoader: "flex" });
                        this.validateInputs();
                        this.toast.show({ severity: 'success', summary: `Requisition #${this.state.selectedRequisitionObj?.requisitionId} settled successfully`, detail: "" });
                        break;
                    default:
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to settle requisition #${this.state.selectedRequisitionObj?.requisitionId}`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    rowExpansionTemplate(data) {
        let attachments = [];
        for (let i = 0; i < data?.attachments?.length; i++) {
            data.attachments[i]["attachmentType"] = "Attachments";
            attachments.push(data?.attachments[i]);
        }
        if (undefined !== data?.rejectedVoiceNote && null !== data?.rejectedVoiceNote) {
            data.rejectedVoiceNote["attachmentType"] = "Rejected Voice Note";
            attachments.push(data.rejectedVoiceNote);
        }
        for (let i = 0; i < data?.additionalInfo?.length; i++) {
            data.additionalInfo[i]["attachmentType"] = "Additional Info";
            attachments.push(data?.additionalInfo[i]);
        }
        for (let i = 0; i < data?.additionalAttachments?.length; i++) {
            data.additionalAttachments[i]["attachmentType"] = "Finance Attachments";
            attachments.push(data?.additionalAttachments[i]);
        }
        for (let i = 0; i < data?.deliveryAttachments?.length; i++) {
            data.deliveryAttachments[i]["attachmentType"] = "Finance Attachments 2";
            attachments.push(data?.deliveryAttachments[i]);
        }
        return (
            <div className="orders-subtable">
                <h5>Attachments</h5>
                <DataTable resizableColumns columnResizeMode="fit" showGridlines responsiveLayout="scroll" value={attachments} dataKey="id" className="datatable-responsive"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} attachments" emptyMessage="No attachments found."
                    selectionMode="single" selection={this.state?.selectedItem} onSelectionChange={e => window.open(e.value?.uri, "_blank")}>
                    <Column field="fileName" header="File Name" />
                    <Column field="type" header="File Type" />
                    <Column field="attachmentType" header="Attachment Type" />
                </DataTable>
            </div>
        );
    }

    render() {
        return (
            <div>
                <h5>Requisition Form <span style={{ fontSize: 11 }}>(Listing requisition/reimbursement form(s) requested by users which need to settle.)</span></h5>
                <div class="splash-screen" style={{ position: "absolute", top: 0, left: 0, zIndex: 10,  display: this.state.showLoader, backgroundColor: "rgba(255, 87, 34, 0.2)" }}>
                    <div class="splash-loader-container">
                        <svg class="splash-loader" width="65px" height="65px" viewBox="0 0 66 66"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle class="splash-path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" />
                        </svg>
                    </div>
                </div>
                <Toast ref={ref => this.toast = ref} />

                <div className="p-col-12">
                    <Accordion activeIndex={this.state.activeIndex} onTabChange={(e) => this.setState({ activeIndex: e.index })}>
                        <AccordionTab header="Filter">
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="formType" style={{ marginBottom: 10 }}>Form Type</label>
                                    <MultiSelect id="formType" display="chip" optionLabel="title" value={this.state.formTypeValues} options={this.state.formType} onChange={(e) => this.setState({ formTypeValues: e.value })} placeholder="Select Form Type" />
                                </div>

                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="companies" style={{ marginBottom: 10 }}>Companies</label>
                                    <Dropdown id="companies" disabled={this.state.shouldDisabledCompanyDropDown} value={this.state.companyObj} options={this.state.companies} optionLabel="companyName" onChange={(e) => this.onComapyChange(e)} placeholder="Select a Company" />
                                </div>
                            </div>

                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="departments" style={{ marginBottom: 10 }}>Departments</label>
                                    {/* <Dropdown id="departments" value={this.state.departmentObj} options={this.state.departments} optionLabel="departmentName" onChange={(e) => { this.setState({ departmentObj: e.value }); }} placeholder="Select a Department" /> */}
                                    <MultiSelect id="departments" display="chip" optionLabel="departmentName" value={this.state.departmentValues} options={this.state.departments} onChange={(e) => this.setState({ departmentValues: e.value })} placeholder="Select Department" />
                                </div>

                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="projects" style={{ marginBottom: 10 }}>Projects</label>
                                    {/* <Dropdown id="projects" value={this.state.projectObj} options={this.state.projects} optionLabel="projectTitle" onChange={(e) => { this.setState({ projectObj: e.value }); }} placeholder="Select a Project" /> */}
                                    <MultiSelect id="projects" display="chip" optionLabel="projectTitle" value={this.state.projectsValues} options={this.state.projects} onChange={(e) => this.onProjectSelect(e)} placeholder="Select Project" />
                                </div>
                            </div>

                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="supplier" style={{ marginBottom: 10 }}>Supplier</label>
                                    {/* <Dropdown id="supplier" value={this.state.projectObj} options={this.state.projects} optionLabel="projectTitle" onChange={(e) => { this.setState({ projectObj: e.value }); }} placeholder="Select a Project" /> */}
                                    <MultiSelect id="supplier" display="chip" optionLabel="supplierName" value={this.state.supplierValues} options={this.state.suppliers} onChange={(e) => this.setState({ supplierValues: e.value })} placeholder="Select Supplier" />
                                </div>

                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="fromDate" style={{ marginBottom: 10 }}>From Date</label>
                                    <Calendar id="fromDate" maxDate={new Date()} readOnlyInput value={this.state.fromDate} onChange={(e) => this.setState({ fromDate: (e.target && e.target.value) ? e.target.value : "" })} />
                                </div>
                            </div>

                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="toDate" style={{ marginBottom: 10 }}>To Date</label>
                                    <Calendar id="toDate" maxDate={new Date()} readOnlyInput value={this.state.toDate} onChange={(e) => this.setState({ toDate: (e.target && e.target.value) ? e.target.value : "" })} />
                                </div>
                            </div>

                            <div className="p-md-12" style={{ flexDirection: "column", display: "flex" }}>
                                <Button label="Search" icon="pi pi-check" className="p-button-raised p-button-info p-mr-2 p-mb-2" onClick={() => this.validateInputs()} style={{ alignSelf: "flex-end" }} />
                            </div>
                        </AccordionTab>
                    </Accordion>
                </div>

                <div className="p-col-12">
                    <div className="card">
                        <DataTable resizableColumns columnResizeMode="expand" showGridlines responsiveLayout="scroll" ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowHover
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} requisition(s)" emptyMessage="No requisition found."
                            globalFilter={this.state.globalFilter} header={this.header} rowExpansionTemplate={this.rowExpansionTemplate} expandedRows={this.state.expandedRows} onRowToggle={(e) => this.setState({ expandedRows: e.data })}
                            scrollable scrollHeight="400px" scrollDirection="both">
                            <Column expander style={{ width: '3em' }} />
                            <Column field="approvedDate" header="PO Date" sortable body={this.dateBody} style={{ width: '150px' }} />
                            <Column header="LPO NO" sortable body={this.lpoTemplate} style={{ width: '200px' }} />
                            <Column field="companyObj.companyName" header="Company Name" sortable style={{ width: '250px' }} />
                            <Column field="supplierObj.supplierName" header="Supplier" sortable style={{ width: '250px' }} />
                            <Column field="projectObj.projectTitle" header="Project" sortable style={{ width: '150px' }} />
                            <Column field="finalAmount" header="Total" sortable style={{ width: '150px' }} />
                            <Column header="Paid" sortable body={this.paidAmountTemplate} style={{ width: '150px' }} />
                            <Column field="pendingAmount" header="Pending" sortable style={{ width: '150px' }} />
                            <Column header="Action" body={this.actionBodyTemplate} style={{ width: '200px' }} />
                        </DataTable>
                    </div>
                </div>

                <Dialog visible={this.state.showPaymentHistoryForm} style={{ width: '85%' }} header={"Payment History #" + this.state.selectedRequisitionObj?.requisitionId} modal className="p-fluid" onHide={this.hideDialog}>
                    <div className="p-field p-grid">
                        <div className="p-md-12" style={{ flexDirection: "column" }}>
                            <DataTable resizableColumns columnResizeMode="fit" showGridlines responsiveLayout="scroll" value={this.state.paymentHistory} dataKey="id" className="datatable-responsive"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} attachments" emptyMessage="No payment history found.">
                                <Column field="paymentDate" header="Payment Date" body={this.paymentDateBody} />
                                <Column field="chqNumberOrTxnId" header="Cheque / TXN Id" />
                                <Column field="transferTypeName" header="Payment Type" />
                                <Column header="Paid Through" body={this.paidThroughTemplate} />
                                <Column header="Paid To" body={this.paidToTemplate} />
                                <Column field="paidAmount" header="Paid Amount" />
                                <Column field="paidByObj?.fullName" header="Paid By" />
                            </DataTable>
                        </div>
                    </div>
                </Dialog>

                <Dialog visible={this.state.showAttachmentForm} style={{ width: '60%' }} header={"Add Attachment"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                    <div className="p-field p-grid">
                        <div className="p-md-6" style={{ flexDirection: "column" }}>
                            <label htmlFor="emailId">Comments</label>
                            <InputText id="emailId" value={this.state.attachmentType} onChange={(e) => this.setState({ attachmentType: (e.target && e.target.value) || '' })} />
                        </div>

                        <div className="p-md-6" style={{ flexDirection: "column" }}>
                            <label htmlFor="logoBase64">Company Image</label>
                            <FileUpload id="logoBase64" name="demo" auto maxFileSize="1000000" accept="*/*" mode="advanced" uploadHandler={this.myUploader} onRemove={this.clearUploadedImage} customUpload />
                        </div>
                    </div>
                </Dialog>

                <Dialog visible={this.state.showPaymentForm} style={{ width: '60%' }} header={this.state.selectedRequisitionObj?.lpoNumber + "'s Payment Form"} modal className="p-fluid" footer={this.paymentDialogFooter} onHide={this.hideDialog}>
                    <div className="p-field p-grid">
                        <div className="p-md-4" style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ marginBottom: 5 }}>Total Amount</label>
                            <label style={{ fontWeight: "bold" }}>{this.state.selectedRequisitionObj?.currencyObj?.currencyShortName} {parseFloat(this.state.selectedRequisitionObj?.finalAmount).toFixed(2)}</label>
                        </div>

                        <div className="p-md-4" style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ marginBottom: 5 }}>Paid Amount</label>
                            <label style={{ fontWeight: "bold" }}>{this.state.selectedRequisitionObj?.currencyObj?.currencyShortName} {(undefined !== this.state.selectedRequisitionObj?.paidAmount && null !== this.state.selectedRequisitionObj?.paidAmount) ? parseFloat(this.state.selectedRequisitionObj?.paidAmount).toFixed(2) : 0}</label>
                        </div>

                        <div className="p-md-4" style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ marginBottom: 5 }}>Pending Amount</label>
                            <label style={{ fontWeight: "bold" }}>{this.state.selectedRequisitionObj?.currencyObj?.currencyShortName} {(undefined !== this.state.selectedRequisitionObj?.pendingAmount && null !== this.state.selectedRequisitionObj?.pendingAmount) ? parseFloat(this.state.selectedRequisitionObj?.pendingAmount).toFixed(2) : 0}</label>
                        </div>
                    </div>

                    <div className="p-field p-grid">
                        <div className="p-md-6" style={{ flexDirection: "column" }}>
                            <label htmlFor="payersbank" style={{ marginBottom: 10 }}>Payer's Bank Details</label>
                            <Dropdown id="payersbank" value={this.state.payersBankDetailObj} options={this.state.payersBankDetailsList} optionLabel="payersBankName" onChange={(e) => this.onPayersBankChange(e)} placeholder="Select a Payers Bank" />
                        </div>

                        <div className="p-md-6" style={{ flexDirection: "column" }}>
                            <label htmlFor="paymentDate" style={{ marginBottom: 10 }}>Transaction Date</label>
                            <Calendar id="paymentDate" maxDate={new Date()} readOnlyInput value={this.state.paymentDate} onChange={(e) => this.setState({ paymentDate: (e.target && e.target.value) ? e.target.value : "" })} />
                        </div>
                    </div>

                    <div className="p-field p-grid">
                        <div className="p-md-6" style={{ flexDirection: "column" }}>
                            <label htmlFor="txnOrChqNo">Cheque No / Txn Id</label>
                            <InputText id="txnOrChqNo" value={this.state.txnOrChqNo} onChange={(e) => this.setState({ txnOrChqNo: e.target.value })} />
                        </div>

                        <div className="p-md-6" style={{ flexDirection: "column" }}>
                            <label htmlFor="payingAmount">Enter Paying Amount</label>
                            <InputNumber disabled={this.state.selectedRequisitionObj?.typeOfForm === "Reimbursment"} id="payingAmount" value={this.state.payingAmount} onValueChange={(e) => this.setState({ payingAmount: e.value })} mode="currency" currency={this.state.selectedRequisitionObj?.currencyObj?.currencyShortName} currencyDisplay="code" locale="en-IN" max={this.state.selectedRequisitionObj?.pendingAmount} />
                        </div>

                        {!(this.state.selectedRequisitionObj?.typeOfForm === "Reimbursment") &&
                            <div className="p-md-6" style={{ flexDirection: "column" }}>
                                <label htmlFor="remarks">Remarks</label>
                                <InputText id="remarks" value={this.state.remarks} onChange={(e) => this.setState({ remarks: e.target.value })} />
                            </div>}
                    </div>
                </Dialog>

                <Dialog visible={this.state.showSettleForm} style={{ width: '60%' }} header="Confirm" modal footer={this.settleDialogFooter} onHide={this.hideDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                        <span>Are you sure you want to settle requisition with number #<b>{this.state.selectedRequisitionObj?.requisitionId}</b>?</span>
                    </div>
                </Dialog>

                <Dialog visible={this.state.showExistingAttachments} style={{ width: '60%' }} header="Confirm" modal onHide={this.hideDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                        <span>Are you sure you want to settle requisition with number #<b>{this.state.selectedRequisitionObj?.requisitionId}</b>?</span>
                    </div>
                </Dialog>
            </div>
        );
    }
}

export default withRouter(RequisitionScreen);