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
import { Dialog } from 'primereact/dialog';
import moment from 'moment';
import { Accordion, AccordionTab } from 'primereact/accordion';

class ReportsScreen extends React.Component {

    state = {
        showLoader: "flex",
        isFinanceLogin: false,
        shouldDisabledCompanyDropDown: false,
        companyObj: null,
        projectObj: null,
        departmentObj: null,
        statusObj: null,
        fromDate: null,
        toDate: null,
        formTypeValues: [],
        projectsValues: [],
        departmentValues: [],
        supplierValues: [],
        statusValues: [],
        projects: [],
        departments: [],
        suppliers: [],
        statusList: [],
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
        selectedRequisitionObj: null,
        showAttachmentForm: false,
        attachmentType: null,
        attachmentObj: null,
        showSettleForm: false,
        showPaymentForm: false,
        showExistingAttachments: false,
        activeIndex: [],
        showPaymentHistoryForm: false,
        paymentHistory: []
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
                    this.setState({ loginUserObj: JSON.parse(lgnUrsObj), isFinanceLogin: conds });
                    setTimeout(() => {
                        if (conds) {
                            let companies = prsdLgnUsrObj.companies;
                            if (null !== companies && undefined !== companies && companies.length > 0) {
                                this.setState({ companies: [...companies] });
                                setTimeout(() => {
                                    if (companies.length > 1) {
                                        this.setState({ shouldDisabledCompanyDropDown: false, showLoader: "none" })
                                    } else {
                                        this.setState({ shouldDisabledCompanyDropDown: true, companyObj: companies[0] });
                                        setTimeout(() => {
                                            this.loadProjects(companies[0]);
                                        }, 500);
                                    }
                                }, 500);
                            } else {
                                sessionStorage.clear();
                                this.props.history.push("/");
                            }
                        } else {
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

    loadProjects = async (companyObj) => {
        let reqObj = {
            extraVariable: "Active," + companyObj.id
        };
        ApiHelper2("getallprojectsbycompanyid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ projects: data.respList }, () => this.loadDepartments(companyObj));
            } else {
                this.loadDepartments(companyObj);
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong 1', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.loadDepartments(companyObj);
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    loadDepartments = async (companyObj) => {
        let reqObj = {
            extraVariable: "Active," + companyObj.id
        };
        ApiHelper2("getalldepartmentsbycompanyid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ departments: data.respList, showLoader: "flex" }, () => this.getAllStatusByActivityName(companyObj));
            } else {
                this.getAllStatusByActivityName(companyObj);
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong 2', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.getAllStatusByActivityName(companyObj);
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    getAllStatusByActivityName(companyObj) {
        let reqObj = {
            extraVariable: "forRequisition"
        };
        let companies = [];
        companies.push(companyObj)
        ApiHelper2("getallstatusbyactivity", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                // this.setState({ statusList: data.respList, showLoader: "none" });
                this.setState({ statusList: data.respList, showLoader: "flex" }, () => this.loadSuppliers(companies));
            } else {
                this.setState({ statusList: [], showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong 3', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ statusList: [], showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    loadData = async () => {
        let reqObj = {
            extraVariable: "Active"
        };
        ApiHelper2("getallcompanies", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                if (data.respList.length > 0) {
                    if (data.respList.length > 1) {
                        this.setState({ companies: data.respList, showLoader: "none" });
                    } else {
                        this.setState({ companies: data.respList, showLoader: "flex" }, () => this.getAllStatusByActivityName(data.respList[0]));
                    }
                } else {
                    this.setState({ companies: [], showLoader: "none" });
                }
            } else {
                this.setState({ companies: [], showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ companies: [], showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    // loadData = async () => {
    //     let reqObj = {
    //         extraVariable: "Active"
    //     };
    //     ApiHelper2("getallcompanies", reqObj, "POST", false, false, false, false).then(data => {
    //         if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
    //             this.setState({ companies: data.respList, showLoader: "flex" }, () => this.getAllStatusByActivityName());
    //         } else {
    //             this.getAllStatusByActivityName();
    //             this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
    //         }
    //     }).catch(reason => {
    //         console.error("Error ---> " + reason);
    //         this.getAllStatusByActivityName();
    //         this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
    //     });


    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Requisition Report <span style={{ fontSize: 11 }}>(Requisition/Reimbursement form(s) requested by users will be listed here based upon filter below.)</span></h5>
            </React.Fragment>
        )
    }

    header = (
        <div className="table-header" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <Button icon="pi pi-file-excel" className="p-button-rounded p-button-success p-mr-2" tooltip='download data in excel' onClick={() => this.downloadTableDateExcel()} />
            <h5 className="p-m-0"></h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
            </span>
        </div>
    )

    downloadTableDateExcel() {
        if (this.state.dataList.length > 0) {
            if (undefined !== this.state.dataList && null !== this.state.dataList && this.state.dataList.length > 0) {
                this.setState({ showLoader: "flex" });
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

    onCompanyChange(e) {
        this.setState({ companyObj: e.value, showLoader: "flex" });
        setTimeout(() => {
            this.loadProjects(e.value);
        }, 500);
    }

    onProjectSelect(e) {
        this.setState({ projectsValues: e.value, showLoader: "none" });
        // this.loadSuppliers(e.value);
    }

    loadSuppliers(selectedCompanies) {
        let reqObj = {
            reqList: selectedCompanies
        };
        ApiHelper2("getallsuppliersbymultipleprojectid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ suppliers: data.respList, showLoader: "none" });
            } else {
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong 4', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    validateInputs() {
        if (undefined !== this.state.formTypeValues && null !== this.state.formTypeValues && this.state.formTypeValues.length > 0) {
            if (undefined !== this.state.companyObj && null !== this.state.companyObj && this.state.companyObj?.id.length > 0) {
                if (undefined !== this.state.departmentValues && null !== this.state.departmentValues && this.state.departmentValues.length > 0) {
                    if (undefined !== this.state.projectsValues && null !== this.state.projectsValues && this.state.projectsValues?.length > 0) {
                        if (undefined !== this.state.statusValues && null !== this.state.statusValues && this.state.statusValues?.length > 0) {
                            if ((undefined !== this.state.fromDate && null !== this.state.fromDate && (this.state.fromDate + "").length > 0) ||
                                (undefined !== this.state.toDate && null !== this.state.toDate && (this.state.toDate + "").length > 0)) {

                                if (undefined !== this.state.fromDate && null !== this.state.fromDate && (this.state.fromDate + "").length > 0) {
                                    if (undefined !== this.state.toDate && null !== this.state.toDate && (this.state.toDate + "").length > 0) {
                                        this.getAllRequisitionByConditions();
                                    } else {
                                        this.toast.show({ severity: 'success', summary: `Select To Date`, detail: "" });
                                    }
                                } else {
                                    if ((undefined !== this.state.toDate && null !== this.state.toDate && (this.state.toDate + "").length > 0)) {
                                        if (undefined !== this.state.fromDate && null !== this.state.fromDate && (this.state.fromDate + "").length > 0) {
                                            this.getAllRequisitionByConditions();
                                        } else {
                                            this.toast.show({ severity: 'success', summary: `Select From Date`, detail: "" });
                                        }
                                    } else {
                                        this.getAllRequisitionByConditions();
                                    }
                                }

                            } else {
                                this.getAllRequisitionByConditions();
                            }
                        } else {
                            this.toast.show({ severity: 'success', summary: `Select Atleast One Status`, detail: "" });
                        }
                    } else {
                        this.toast.show({ severity: 'success', summary: `Select Atleast One Project`, detail: "" });
                    }
                } else {
                    this.toast.show({ severity: 'success', summary: `Select Atleast One Department`, detail: "" });
                }
            } else {
                this.toast.show({ severity: 'success', summary: `Select One Company`, detail: "" });
            }
        } else {
            this.toast.show({ severity: 'success', summary: `Select Atleast One Form Type`, detail: "" });
        }
    }

    getAllRequisitionByConditions = () => {
        this.setState({ showLoader: "flex" });
        let reqObj = {
            reqObject: {
                formType: this.state.formTypeValues,
                companyObj: this.state.companyObj,
                departments: this.state.departmentValues,
                projects: this.state.projectsValues,
                suppliers: this.state.supplierValues,
                statuses: this.state.statusValues,
                fromDate: this.state.fromDate,
                toDate: this.state.toDate
            }
        }
        ApiHelper2("getallrequisitionbycondition", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                this.onClick(-1);
                switch (data.statusCode) {
                    case 0:
                        if (undefined !== data.respList && null !== data.respList) {
                            if (data.respList.length > 0) {
                                this.setState({ dataList: data.respList, showLoader: "none" });
                            } else {
                                this.setState({ dataList: [], showLoader: "none" });
                                this.toast.show({ severity: 'error', summary: `No records found 1`, detail: data.statusDesc });
                            }
                        } else {
                            this.setState({ dataList: [], showLoader: "none" });
                            this.toast.show({ severity: 'error', summary: `No records found 2`, detail: data.statusDesc });
                        }
                        break;
                    default:
                        this.setState({ showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to get requisition`, detail: data.statusDesc });
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

    statusNameBody(rowData) {
        return (
            <React.Fragment>
                <span className="image-text" style={{ verticalAlign: 'middle' }}>{rowData.statusObj.statusName}</span>
            </React.Fragment>
        )
    }

    hideDialog = () => {
        this.setState({ showAttachmentForm: false, showPaymentForm: false, showSettleForm: false, showExistingAttachments: false, showPaymentHistoryForm: false });
    }

    commonREQorLPOTemplate = (rowData) => {
        return (
            <div className="actions">
                <a href={rowData.lpoPdfUrl} target={"_blank"} style={{ color: "blue", textDecorationLine: "underline" }}>{rowData.lpoNumber}</a>
                <br />
                <a href={rowData.pdfURL} target={"_blank"} style={{ color: "blue", textDecorationLine: "underline" }}>{rowData.requisitionId}</a>
            </div>
        );
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
            </div >
        );
    }

    paidAmountTemplate = (rowData) => {
        return (
            <div className="actions">
                <p onClick={() => this.getPaymentHistory(rowData)} style={{ color: "blue", textDecorationLine: "underline", cursor: "pointer" }}>{parseFloat(rowData.paidAmount).toFixed(3)}</p>
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

    paymentDateBody = (rowData) => {
        return (
            <div className="actions">
                <label>{moment(rowData?.paymentDate).format("DD-MM-YYYY")}</label>
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

    render() {
        return (
            <div>
                <h5>Reports<span style={{ fontSize: 11 }}>(Listing settled requisition/riembursment requested by users.)</span></h5>
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
                    <Accordion ref={ref => this.accRef = ref} activeIndex={this.state.activeIndex} onTabChange={(e) => this.setState({ activeIndex: e.index })}>
                        <AccordionTab header="Filter">
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="formType" style={{ marginBottom: 10 }}>Form Type</label>
                                    <MultiSelect id="formType" display="chip" optionLabel="title" value={this.state.formTypeValues} options={this.state.formType} onChange={(e) => this.setState({ formTypeValues: e.value })} placeholder="Select Form Type" />
                                </div>

                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="companies" style={{ marginBottom: 10 }}>Companies</label>
                                    <Dropdown id="companies" disabled={this.state.shouldDisabledCompanyDropDown} value={this.state.companyObj} options={this.state.companies} optionLabel="companyName" onChange={(e) => this.onCompanyChange(e)} placeholder="Select a Company" />
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
                                    <label htmlFor="status" style={{ marginBottom: 10 }}>Status</label>
                                    {/* <Dropdown id="supplier" value={this.state.projectObj} options={this.state.projects} optionLabel="projectTitle" onChange={(e) => { this.setState({ projectObj: e.value }); }} placeholder="Select a Project" /> */}
                                    <MultiSelect id="status" display="chip" optionLabel="statusName" value={this.state.statusValues} options={this.state.statusList} onChange={(e) => this.setState({ statusValues: e.value })} placeholder="Select Status" />
                                </div>

                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="supplier" style={{ marginBottom: 10 }}>Supplier</label>
                                    {/* <Dropdown id="supplier" value={this.state.projectObj} options={this.state.projects} optionLabel="projectTitle" onChange={(e) => { this.setState({ projectObj: e.value }); }} placeholder="Select a Project" /> */}
                                    <MultiSelect id="supplier" display="chip" optionLabel="supplierName" value={this.state.supplierValues} options={this.state.suppliers} onChange={(e) => this.setState({ supplierValues: e.value })} placeholder="Select Supplier" />
                                </div>

                            </div>

                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                    <label htmlFor="fromDate" style={{ marginBottom: 10 }}>From Date</label>
                                    <Calendar id="fromDate" maxDate={new Date()} readOnlyInput value={this.state.fromDate} onChange={(e) => this.setState({ fromDate: (e.target && e.target.value) ? e.target.value : "" })} />
                                </div>

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
                            // rowGroupMode="rowspan" groupRowsBy="statusObj.statusName" sortMode="single" sortField="statusObj.statusName" sortOrder={1}
                            globalFilter={this.state.globalFilter} header={this.header} rowExpansionTemplate={this.rowExpansionTemplate} expandedRows={this.state.expandedRows} onRowToggle={(e) => this.setState({ expandedRows: e.data })}>
                            <Column expander style={{ width: '3em' }} />
                            {/* <Column header="#" headerStyle={{ width: '3em' }} body={(data, options) => options.rowIndex + 1} /> */}
                            <Column field="statusObj.statusName" header="Status" style={{ width: '8%' }} />
                            {/* <Column field="statusObj.statusName" header="Status" body={this.statusNameBody} style={{ width: '8%' }} /> */}
                            <Column field="approvedDate" header="PO Date" sortable body={this.dateBody} style={{ width: '10%' }} />
                            <Column header="LPO/MR NO" sortable style={{ width: '15%' }} body={this.commonREQorLPOTemplate} />
                            {/* <Column field="requisitionId" header="MR NO" sortable style={{ width: '15%' }} body={this.requisitionTemplate} /> */}
                            <Column field="companyObj.companyName" header="Company Name" sortable style={{ width: '20%' }} />
                            <Column field="supplierObj.supplierName" header="Supplier" sortable style={{ width: '20%' }} />
                            <Column field="projectObj.projectTitle" header="Project" sortable style={{ width: '20%' }} />
                            <Column field="projectObj.projectCode" header="P. Code" sortable style={{ width: '10%' }} />
                            <Column field="finalAmount" header="Total" sortable style={{ width: '10%' }} />
                            <Column header="Paid" sortable style={{ width: '15%' }} body={this.paidAmountTemplate} />
                            <Column field="pendingAmount" header="Pending" sortable style={{ width: '10%' }} />
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
                            </DataTable>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

export default withRouter(ReportsScreen);