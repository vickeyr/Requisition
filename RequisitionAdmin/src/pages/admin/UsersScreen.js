import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { TabView, TabPanel } from 'primereact/tabview';
import { withRouter } from 'react-router-dom';
import { ApiHelper2, sessionKeys } from '../../utilities/ConstantVariable';
import { MultiSelect } from 'primereact/multiselect';

class UsersScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataList: [],
        transferTypeList: [],
        dataObj: {
            id: null,
            fullName: "",
            mobileNumber: "",
            emailId: "",
            deviceID: "",
            password: "",
            isFirstTimeUser: true,
            statusObj: null,
            roleObj: null,
            isVisible: true,
            companies: null,
            transferTypeObj: null,
            fields: []
        },
        showAddForm: false,
        showDeleteForm: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            id: null,
            fullName: "",
            mobileNumber: "",
            emailId: "",
            deviceID: "",
            password: "",
            isFirstTimeUser: true,
            statusObj: null,
            roleObj: null,
            isVisible: true,
            companies: null,
            transferTypeObj: null,
            fields: []
        },
        rolesList: [],
        companies: [],
        activeTabIndex: 0,
        selectedCompanyId: null,
        showTransferType: false
    }

    constructor(props) {
        super(props);
        let authToken = sessionStorage.getItem(sessionKeys.authToken);
        if (undefined !== authToken && null !== authToken && authToken.length > 0) {
            this.loadData(this.state.activeTabIndex);
        } else {
            this.props.history.push("/");
        }
    }

    onTabChange(index) {
        this.setState({ showLoader: "flex", activeIndex: index });
        this.loadData(index);
    }

    loadData = async (index) => {
        let reqObj = {
            extraVariable: (index === 0) ? "Active" : "InActive"
        };
        ApiHelper2("getallusers", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ dataList: data.respList, activeTabIndex: index, showLoader: "none" });
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

    onAdd = () => {
        this.setState({ dataObj: this.state.emptyDataObj, isEdit: false, selectedCompanyId: null, showLoader: "flex" });
        this.loadDependenciesData(false, this.state.emptyDataObj);
    }

    loadDependenciesData = (isEdit, dataObj) => {
        let reqObj = {
            extraVariable: "Active"
        };
        ApiHelper2("getallroles", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                this.setState({ rolesList: data.respList });
                ApiHelper2("getallcompanies", reqObj, "POST", false, false, false, false).then(data => {
                    if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                        this.setState({ companies: data.respList, dataObj: dataObj });
                        let reqObj = {
                            extraVariable: "Active,forReimbursment"
                        };
                        ApiHelper2("getalltransfertype", reqObj, "POST", false, false, false, false).then(data => {
                            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                                this.setState({ transferTypeList: data.respList });
                                setTimeout(() => {
                                    this.setState({ showLoader: "none", showAddForm: true });
                                }, 500);
                            } else {
                                this.setState({ showLoader: "none" });
                                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
                            }
                        }).catch(reason => {
                            console.error("Error ---> " + reason);
                            this.setState({ showLoader: "none" });
                            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
                        });
                        // if (isEdit) {
                        //     for (let i = 0; i < this.state.rolesList.length; i++) {
                        //         if (this.state.rolesList[i].roleName === dataObj.rolename) {
                        //             dataObj["roles"] = this.state.rolesList[i];
                        //             for (let j = 0; j < this.state.employeeStatusList.length; j++) {
                        //                 if (this.state.employeeStatusList[j].statusname === dataObj.statusname) {
                        //                     dataObj["status"] = this.state.employeeStatusList[j];
                        //                     setTimeout(() => {
                        //                         this.setState({ showLoader: "none", showAddForm: true });
                        //                     }, 500);
                        //                     break;
                        //                 }
                        //             }
                        //             break;
                        //         }
                        //     }
                        // } else {
                        //     setTimeout(() => {
                        //         this.setState({ showLoader: "none", showAddForm: true });
                        //     }, 500);
                        // }
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
                this.setState({ showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    hideDialog = () => {
        this.setState({ showAddForm: false, showDeleteForm: false, showResetPasswordForm: false });
    }

    validateInputs() {
        if (this.validateFeild(this.state.dataObj.fullName)) {
            if (this.validateFeild(this.state.dataObj.mobileNumber)) {
                if (!isNaN(this.state.dataObj.mobileNumber) && !isNaN(this.state.dataObj.mobileNumber + "") && (this.state.dataObj.mobileNumber + "").length === 8) {
                    if (this.validateFeild(this.state.dataObj.emailId)) {
                        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                        if (re.test(this.state.dataObj.emailId)) {
                            if (this.validateFeild(this.state.dataObj.roleObj?.id)) {
                                if (this.validateFeild(this.state.selectedCompanyId.length + "")) {
                                    let dataObj = this.state.dataObj;
                                    if (!this.state.isEdit) {
                                        dataObj["isFirstTimeUser"] = true;
                                    }
                                    dataObj["companies"] = this.state.selectedCompanyId;
                                    if (undefined !== dataObj.roleName && null !== dataObj.roleName && (dataObj.roleName + "").toLowerCase().trim().includes("requisition")) {
                                        this.setState({ dataObj: dataObj }, () => { this.validateDynamicInputs(dataObj); })
                                    } else {
                                        this.setState({ dataObj: dataObj }, () => { this.saveOrUpdateObject(dataObj); })
                                    }
                                } else {
                                    this.toast.show({ severity: 'error', summary: 'Select Atleast One Company', detail: '' });
                                }
                            } else {
                                this.toast.show({ severity: 'error', summary: 'Select A Role', detail: '' });
                            }
                        } else {
                            this.toast.show({ severity: 'error', summary: 'Enter Valid Email ID', detail: '' });
                        }
                    } else {
                        this.toast.show({ severity: 'error', summary: 'Enter Email ID', detail: '' });
                    }
                } else {
                    this.toast.show({ severity: 'error', summary: 'Enter 8 digit valid mobile number', detail: '' });
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter Mobile Number', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Full Name', detail: '' });
        }
    }

    validateDynamicInputs(dataObj) {
        let validationListCount = 0;
        let validationString = "";
        for (let i = 0; i < this.state.dataObj?.fields?.length; i++) {
            if (this.state.dataObj.fields[i].isFieldMandatory) {
                if (this.validateFeild(this.state.dataObj?.fields[i]?.fieldValue)) {
                    // --validationListCount;
                } else {
                    ++validationListCount;
                    validationString = `Enter ${this.state.dataObj.fields[i].fieldName}`
                    break;
                }
            }
        }
        if (validationListCount <= 0) {
            this.saveOrUpdateObject(dataObj);
        } else {
            this.toast.show({ severity: 'error', summary: validationString, detail: '' });
        }
    }

    validateFeild(field) {
        if (undefined !== field && null !== field && (field + "") !== '' && field.length >= 0) {
            return true;
        } else {
            return false;
        }
    }

    saveOrUpdateObject = (dataObj) => {
        this.setState({ showLoader: "flex", showAddForm: false });
        if (!this.state.isEdit) {
            dataObj["isFirstTimeUser"] = true;
            dataObj["password"] = dataObj.mobileNumber;
        }
        dataObj.emailId = (dataObj.emailId + "").toLowerCase().trim();
        let reqObj = {
            reqObject: dataObj
        }
        ApiHelper2(this.state.isEdit ? "updateuser" : "createuser", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `User ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    case 4:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Duplicate Detailes`, detail: data.statusDesc });
                        break;
                    default:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} User`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ showLoader: "none", showAddForm: true });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none", showAddForm: true });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    onEdit = (dataObj) => {
        dataObj["rolename"] = dataObj.roleObj.roleName;
        let showTransferType = false;
        if (undefined !== dataObj.roleObj.roleName && null !== dataObj.roleObj.roleName && (dataObj.roleObj.roleName + "").toLowerCase().trim().includes("requisition")) {
            showTransferType = true;
        }
        if (undefined !== dataObj.transferTypeObj && null !== dataObj.transferTypeObj && dataObj.transferTypeObj.length > 0) {
            let transferTypeValues = []
            for (let i = 0; i < dataObj.transferTypeObj.length; i++) {
                transferTypeValues.push(dataObj.transferTypeObj[i].id)
            }
            dataObj["transferTypeValues"] = transferTypeValues;
            // dataObj["transferTypeValues"] = ""
        } else {
            dataObj["transferTypeValues"] = [];
        }
        this.setState({ showTransferType: showTransferType, isEdit: true, dataObj: dataObj, selectedCompanyId: dataObj.companies });
        this.loadDependenciesData(true, dataObj);
    }

    onInputChange = (e, key) => {
        let val = (e.target && e.target.value) || '';
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        this.setState({ dataObj: dataObj });
    }

    onSelectButtonChange = (e, key) => {
        let val = e.value ? e.value : ""
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        switch (key) {
            case "rolename":
                let showTransferType = false;
                for (let i = 0; i < this.state.rolesList.length; i++) {
                    if (this.state.rolesList[i].roleName === dataObj.rolename) {
                        dataObj["roleObj"] = this.state.rolesList[i];
                        if (undefined !== this.state.rolesList[i].roleName && null !== this.state.rolesList[i].roleName && (this.state.rolesList[i].roleName + "").toLowerCase().trim().includes("requisition")) {
                            showTransferType = true;
                        }
                        break;
                    }
                }
                this.setState({ showTransferType: showTransferType })
                break;
            default:
                break;
        }
        this.setState({ dataObj: dataObj });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Users <span style={{ fontSize: 11 }}>(Define Users who can operate the system based upon their roles.)</span></h5>
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

    actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" tooltip='Edit' onClick={() => this.onEdit(rowData)} />
                <Button icon={rowData.statusObj?.statusName === "Active" ? "pi pi-times-circle" : "pi pi-check"} tooltip={rowData.statusObj?.statusName === "Active" ? "Mark As Inactive" : "Mark As Active"} className="p-button-rounded p-button-warning p-mr-2" onClick={() => this.onDelete(rowData)} />
                <Button icon={"pi pi-unlock"} className="p-button-rounded p-button-danger p-mr-2" tooltip='Reset Password' onClick={() => this.onResetPassword(rowData)} />
            </div>
        );
    }

    onResetPassword = (dataObj) => {
        this.setState({ dataObj: dataObj, showLoader: "none", showResetPasswordForm: true });
    }

    onDelete = (dataObj) => {
        this.setState({ dataObj: dataObj, showLoader: "none", showDeleteForm: true });
        // setTimeout(() => {
        //     this.setState({ showLoader: "none", showDeleteForm: true });
        // }, 500);
    }

    header = () => {
        return (
            <div className="table-header">
                <h5 className="p-m-0">Users</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
                </span>
            </div>
        );
    }

    objectDialogFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label={this.state.isEdit ? "Update" : "Save"} icon="pi pi-check" className="p-button-text" onClick={() => this.validateInputs()} />
            </div>
        );
    }

    displayCompanies(rowData) {
        let listOfCompanies = "";
        if (undefined !== rowData.companies && null !== rowData.companies && rowData.companies.length > 0) {
            for (let i = 0; i < rowData.companies.length; i++) {
                listOfCompanies += rowData.companies[i].companyName + ", ";
                if ((i + 1) === rowData.companies.length) {
                    listOfCompanies = listOfCompanies.substring(0, listOfCompanies.length - 2);
                }
            }
        } else {
            listOfCompanies = "No companies added to this user"
        }
        return <span>{listOfCompanies}</span>;
    }

    deleteDialogFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.deleteObject} />
            </div>
        )
    };

    resetPasswordDialogFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.resetPassword} />
            </div>
        )
    };

    deleteObject = () => {
        this.setState({ showLoader: "flex", showDeleteForm: false });
        let reqObj = {
            reqObject: this.state.dataObj,
        }
        ApiHelper2("deleteuser", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `User status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update User Status`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ showLoader: "none", showDeleteForm: true });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none", showDeleteForm: true });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    resetPassword = () => {
        this.setState({ showLoader: "flex", showResetPasswordForm: false });
        let reqObj = {
            reqObject: this.state.dataObj,
        }
        ApiHelper2("resetpassword", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showResetPasswordForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Password Reset Successfully`, detail: `User's password reset successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showResetPasswordForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to reset user's password`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ showLoader: "none", showResetPasswordForm: true });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ showLoader: "none", showResetPasswordForm: true });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    onTransferTypeChange(e) {
        let dataObj = this.state.dataObj;
        let ttIds = (e.value + "").split(",");

        let feilds = [];
        let transferTypeObj = [];
        for (let k = 0; k < ttIds.length; k++) {
            for (let m = 0; m < this.state.transferTypeList.length; m++) {
                if (ttIds[k] === this.state.transferTypeList[m].id) {
                    feilds = feilds.concat(this.state.transferTypeList[m].fields);
                    transferTypeObj.push(this.state.transferTypeList[m])
                    break;
                }
            }
        }

        if (undefined !== feilds && null !== feilds && feilds.length > 0) {
            let matchingFeilds = [];
            for (let i = 0; i < feilds.length; i++) {
                for (let j = 0; j < dataObj.fields.length; j++) {
                    if (feilds[i].fieldName === dataObj.fields[j].fieldName) {
                        matchingFeilds.push(dataObj.fields[j]);
                        break;
                    }
                }
            }
            if (matchingFeilds.length <= 0 && feilds.length > 0) {
                dataObj.fields = feilds;
            } else {
                dataObj.fields = matchingFeilds;
            }
        } else {
            dataObj.fields = [];
        }

        dataObj["transferTypeValues"] = e.value;
        dataObj.transferTypeObj = transferTypeObj;
        this.setState({ dataObj: dataObj });
    }

    updateValue = (itemValue, index) => {
        let dataObj = this.state.dataObj;
        let fields = dataObj.fields;
        fields[index].fieldValue = itemValue;
        dataObj.fields = fields;
        this.setState({ dataObj: dataObj });
    }

    rowExpansionTemplate(data) {
        return (
            <div className="orders-subtable">
                {/* <center> */}
                {(undefined !== data.roleObj.roleName && null !== data.roleObj.roleName && (data.roleObj.roleName + "").toLowerCase().trim().includes("requisition")) ?
                    <div>
                        <h5>Payment Details for {data.fullName}</h5>
                        {data.fields?.length > 0 ? <div><br /><br /></div> : null}
                        {data.fields?.map((item, index) =>
                            <div key={index}>
                                <span>{item.fieldName + ": "}<b>{item.fieldValue}</b></span>
                                <br />
                                <br />
                            </div>
                        )}
                    </div> :
                    <div>
                        <h5>No Payment Details for {data.fullName}</h5>
                    </div>}
                {/* </center> */}
            </div>
        );
    }

    render() {
        return (
            <div className="p-grid crud-demo">
                <div className="p-col-12">
                    <div className="card">
                        <Toast ref={ref => this.toast = ref} />
                        <div class="splash-screen" style={{ position: "absolute", top: 0, left: 0, zIndex: 10, display: this.state.showLoader, backgroundColor: "rgba(255, 87, 34, 0.2)" }}>
                            <div class="splash-loader-container">
                                <svg class="splash-loader" width="65px" height="65px" viewBox="0 0 66 66"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle class="splash-path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" />
                                </svg>
                            </div>
                        </div>
                        <Toolbar className="p-mb-4 p-toolbar" left={this.leftToolbarTemplate} right={this.rightToolbarTemplate}></Toolbar>

                        <TabView activeIndex={this.state.activeTabIndex} onTabChange={(e) => this.onTabChange(e.index)}>
                            <TabPanel header="Active Users">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users" emptyMessage="No users found."
                                    globalFilter={this.state.globalFilter} header={this.header} rowExpansionTemplate={this.rowExpansionTemplate}
                                    expandedRows={this.state.expandedRows} onRowToggle={(e) => this.setState({ expandedRows: e.data })} responsiveLayout="scroll">
                                    <Column expander style={{ width: '3em' }} />
                                    <Column field="fullName" header="Full Name" sortable />
                                    <Column field="mobileNumber" header="Mobile Number" sortable />
                                    <Column field="emailId" header="Email ID" sortable />
                                    <Column field="roleObj.roleName" header="Role" sortable />
                                    <Column field="companies" header="Companies" body={this.displayCompanies.bind(this)} sortable />
                                    <Column header="Action" body={this.actionBodyTemplate}></Column>
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Users">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users" emptyMessage="No users found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="fullName" header="Full Name" sortable />
                                    <Column field="mobileNumber" header="Mobile Number" sortable />
                                    <Column field="emailId" header="Email ID" sortable />
                                    <Column field="roleObj.roleName" header="Role" sortable />
                                    <Column field="companies" header="Companies" body={this.displayCompanies.bind(this)} sortable />
                                    <Column header="Action" body={this.actionBodyTemplate}></Column>
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + "User"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="name">Full Name</label>
                                    <InputText id="name" value={this.state.dataObj.fullName} onChange={(e) => this.onInputChange(e, 'fullName')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="mobileNumber">Mobile Number</label>
                                    <InputText id="mobileNumber" value={this.state.dataObj.mobileNumber} onChange={(e) => this.onInputChange(e, 'mobileNumber')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="name">Email id</label>
                                    <InputText id="emailId" value={this.state.dataObj.emailId} onChange={(e) => this.onInputChange(e, 'emailId')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="status">Role</label>
                                    <SelectButton id="status" optionLabel="roleName" optionValue="roleName" value={this.state.dataObj.rolename} options={this.state.rolesList} onChange={(e) => this.onSelectButtonChange(e, "rolename")} />
                                </div>
                            </div>
                            <div className="p-field  p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <div className="p-inputgroup" style={{ marginTop: 10 }}>
                                        <span className="p-inputgroup-addon">
                                            <i className="pi pi-user"></i>
                                        </span>
                                        <span className="p-float-label">
                                            {/* <Dropdown id="selectCompany" optionLabel="companyName" optionValue="id" value={this.state.selectedCompanyId} options={this.state.companies} onChange={(e) => this.setState({ selectedCompanyId: e.value })} placeholder="" /> */}
                                            <MultiSelect id="selectCompany" display="chip" optionLabel="companyName" value={this.state.selectedCompanyId} options={this.state.companies} onChange={(e) => this.setState({ selectedCompanyId: e.value })} placeholder="" />
                                            <label htmlFor="selectCompany">Select Company</label>
                                        </span>
                                    </div>
                                </div>
                                {this.state.showTransferType ?
                                    <div className="p-md-6" style={{ flexDirection: "column" }}>
                                        <label htmlFor="transferType">Transfer Type</label>
                                        {/* <InputText id="transferType" value={this.state.dataObj.transferTypeObj} onChange={(e) => this.onInputChange(e, 'transferTypeObj')}  /> */}
                                        {/* <Dropdown id="transferType" optionLabel="transferTypeName" optionValue="id" value={this.state.dataObj.transferTypeObj?.id} options={this.state.transferTypeList} onChange={(e) => this.onTransferTypeChange(e)} placeholder="Select On Transfer Type" /> */}
                                        <MultiSelect id="transferType" display="chip" optionLabel="transferTypeName" optionValue="id" value={this.state.dataObj.transferTypeValues} options={this.state.transferTypeList} onChange={(e) => this.onTransferTypeChange(e)} placeholder="Select On Transfer Type" />
                                    </div> : null}
                            </div>
                            <div className="p-field p-grid">
                                {this.state.dataObj.fields?.map((item, index) =>
                                    <div className="p-md-6" style={{ flexDirection: "column" }}>
                                        <label htmlFor={(item.fieldName + "").toLowerCase().trim()}>{item.fieldName}</label>
                                        <InputText id={(item.fieldName + "").toLowerCase().trim()} value={item.fieldValue} onChange={(e) => this.updateValue(e.target.value, index)} />
                                    </div>)}
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showDeleteForm} style={{ width: '450px' }} header="Confirm" modal footer={this.deleteDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to {(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} <b>{this.state.dataObj.fullName}</b>?</span>
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showResetPasswordForm} style={{ width: '450px' }} header="Confirm" modal footer={this.resetPasswordDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to reset password for the user named <b>{this.state.dataObj.fullName}</b>?</span>
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(UsersScreen);