import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { TabView, TabPanel } from 'primereact/tabview';
import { withRouter } from 'react-router-dom';
import { ApiHelper2, sessionKeys } from '../../utilities/ConstantVariable';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { FileUpload } from 'primereact/fileupload';

class SuppliersScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataList: [],
        dataObj: {
            id: null,
            supplierName: '',
            contactPersonName: '',
            emailId: "",
            mobileNumber: "",
            address: "",
            vatNumber: "",
            vendorCode: "",
            transferTypeObj: null,
            fields: [],
            markAsCommonSupplier: null,
            files: [],
            companyObj: null,
        },
        showAddForm: false,
        showDeleteForm: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            id: null,
            supplierName: '',
            contactPersonName: '',
            emailId: "",
            mobileNumber: "",
            address: "",
            vatNumber: "",
            vendorCode: "",
            transferTypeObj: null,
            fields: [],
            markAsCommonSupplier: null,
            files: [],
            companyObj: null,
        },
        transferTypeList: [],
        activeTabIndex: 0,
        companyObj: null,
        fieldList: [
            {
                fieldName: "NO",
                feildValue: "false",
                isSelected: true
            },
            {
                fieldName: "YES",
                feildValue: "true",
                isSelected: false
            }
        ],
        doesImageChoosen: false
    }

    constructor(props) {
        super(props);
        let authToken = sessionStorage.getItem(sessionKeys.authToken);
        if (undefined !== authToken && null !== authToken && authToken.length > 0) {
            let companyObj = sessionStorage.getItem(sessionKeys.companyObj);
            if (undefined !== companyObj && null !== companyObj && companyObj.length > 0) {
                this.loadData(this.state.activeTabIndex, JSON.parse(companyObj));
            } else {
                sessionStorage.removeItem(sessionKeys.companyObj);
                this.props.history.push("/companies");
            }
        } else {
            this.props.history.push("/");
        }
    }

    onTabChange(index) {
        this.setState({ showLoader: "flex", activeIndex: index });
        this.loadData(index, this.state.companyObj);
    }

    loadData = async (index, companyObj) => {
        let reqObj = {
            extraVariable: (index === 0) ? "Active," + companyObj?.id : "InActive" + companyObj?.id
        };
        ApiHelper2("getallsuppliersbyprojectid", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respList && null !== data.respList) {
                this.setState({ companyObj: companyObj, dataList: data.respList, activeTabIndex: index, showLoader: "none" });
            } else {
                this.setState({ companyObj: companyObj, showLoader: "none" });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ companyObj: companyObj, showLoader: "none" });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
    }

    onAdd = () => {
        this.setState({ dataObj: this.state.emptyDataObj, isEdit: false, doesImageChoosen: false, showLoader: "flex" });
        this.loadDependenciesData(false, this.state.emptyDataObj);
    }

    loadDependenciesData = (isEdit, dataObj) => {
        let reqObj = {
            extraVariable: "Active,forRequisition"
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
    }

    hideDialog = () => {
        this.setState({ showAddForm: false, showDeleteForm: false });
    }

    validateInputs() {
        if (this.validateFeild(this.state.dataObj.supplierName)) {
            if (this.validateFeild(this.state.dataObj.vatNumber)) {
                if (undefined !== this.state.dataObj.transferTypeObj && null !== this.state.dataObj.transferTypeObj && this.state.dataObj.transferTypeObj.length > 0) {
                    if (this.validateFeild(this.state.dataObj.contactPersonName)) {
                        if (this.validateFeild(this.state.dataObj.mobileNumber)) {
                            if (this.validateFeild(this.state.dataObj.emailId)) {
                                const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                                if (re.test(this.state.dataObj.emailId)) {
                                    // if (this.validateFeild(this.state.dataObj.code)) {
                                    if (this.validateFeild(this.state.dataObj.markAsCommonSupplier)) {
                                        if (this.validateFeild(this.state.dataObj.address)) {
                                            if (this.validateFeild(this.state.dataObj.files)) {
                                                if (this.state.dataObj.files.length > 0) {
                                                    this.validateDynamicInputs();
                                                } else {
                                                    this.toast.show({ severity: 'error', summary: 'Select Atleast One File', detail: '' });
                                                }
                                            } else {
                                                this.toast.show({ severity: 'error', summary: 'Select File', detail: '' });
                                            }
                                        } else {
                                            this.toast.show({ severity: 'error', summary: 'Add Attachement(s)', detail: '' });
                                        }
                                    } else {
                                        this.toast.show({ severity: 'error', summary: 'Answer Mark As Common Supplier?', detail: '' });
                                    }
                                    // } else {
                                    //     this.toast.show({ severity: 'error', summary: 'Enter Supplier Code', detail: '' });
                                    // }
                                } else {
                                    this.toast.show({ severity: 'error', summary: 'Enter Valid Email ID', detail: '' });
                                }
                            } else {
                                this.toast.show({ severity: 'error', summary: 'Enter Email ID', detail: '' });
                            }
                        } else {
                            this.toast.show({ severity: 'error', summary: 'Enter Mobile Number', detail: '' });
                        }
                    } else {
                        this.toast.show({ severity: 'error', summary: 'Enter Constact Person Name', detail: '' });
                    }
                } else {
                    this.toast.show({ severity: 'error', summary: 'Select Transfer Type', detail: '' });
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter VAT Number', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Supplier Name', detail: '' });
        }
    }

    validateDynamicInputs() {
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
            this.saveOrUpdateObject();
        } else {
            this.toast.show({ severity: 'error', summary: validationString, detail: '' });
        }
    }

    validateFeild(field) {
        if (undefined !== field && null !== field && (field + "") !== '' && (field + "").length >= 0) {
            return true;
        } else {
            return false;
        }
    }

    saveOrUpdateObject = () => {
        this.setState({ showLoader: "flex", showAddForm: false });
        let dataObj = this.state.dataObj;
        dataObj.companyObj = this.state.companyObj;
        let files = dataObj.files;
        dataObj.files = [];
        let reqObj = {
            reqObject: dataObj,
            reqList: files
        };
        ApiHelper2(this.state.isEdit ? "updatesupplier" : "createsupplier", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
                        this.loadData(this.state.activeTabIndex, this.state.companyObj);
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `Supplier ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    case 4:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Duplicate Supplier`, detail: data.statusDesc });
                        break;
                    default:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Supplier`, detail: data.statusDesc });
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
        this.setState({ isLoading: true, doesImageChoosen: false });
        if (undefined !== dataObj.transferTypeObj && null !== dataObj.transferTypeObj && dataObj.transferTypeObj.length > 0) {
            let transferTypeValues = []
            for (let i = 0; i < dataObj.transferTypeObj.length; i++) {
                transferTypeValues.push(dataObj.transferTypeObj[i].id)
            }
            dataObj["transferTypeValues"] = transferTypeValues;
        } else {
            dataObj["transferTypeValues"] = [];
        }
        this.setState({ dataObj: dataObj }, () => this.setState({ isEdit: true }));
        this.loadDependenciesData(true, dataObj);
    }

    onInputChange = (e, key) => {
        let val = (e.target && e.target.value) || '';
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        this.setState({ dataObj: dataObj });
    }

    updateValue = (itemValue, index) => {
        let dataObj = this.state.dataObj;
        let fields = dataObj.fields;
        fields[index].fieldValue = itemValue;
        dataObj.fields = fields;
        this.setState({ dataObj: dataObj });
    }

    onBack = () => {
        sessionStorage.removeItem(sessionKeys.companyObj);
        this.props.history.push("/companies");
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="back" icon="pi pi-chevron-left" className="p-button-secondary p-mr-2 p-mb-2" onClick={this.onBack} />
                <h5>{this.state.companyObj?.companyName}'s Suppliers <span style={{ fontSize: 11 }}>(Define Suppliers who can supply the items.)</span></h5>
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
            </div>
        );
    }

    onDelete = (dataObj) => {
        this.setState({ dataObj: dataObj, showLoader: "none", showDeleteForm: true });
        // setTimeout(() => {
        //     this.setState({ showLoader: "none", showDeleteForm: true });
        // }, 500);
    }

    deleteDialogFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.deleteObject} />
            </div>
        )
    };

    deleteObject = () => {
        this.setState({ showLoader: "flex", showDeleteForm: false });
        let reqObj = {
            reqObject: this.state.dataObj,
        }
        ApiHelper2("deletesupplier", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex, this.state.companyObj);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Supplier status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Supplier Status`, detail: data.statusDesc });
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

    header = () => {
        return (
            <div className="table-header">
                <h5 className="p-m-0">Supplier</h5>
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

    rowExpansionTemplate(data) {
        let paymentModes = "";
        for (let i = 0; i < data.transferTypeObj.length; i++) {
            paymentModes = paymentModes + data.transferTypeObj[i].transferTypeName + ",";
        }
        paymentModes = paymentModes.substring(0, paymentModes.length - 1)
        return (
            <div className="orders-subtable">
                {/* <center> */}
                <h5>Payment Details for {data.supplierName} ({paymentModes})</h5>
                {data.fields?.length > 0 ? <div><br /><br /></div> : null}
                {data.fields?.map((item, index) =>
                    <div key={index}>
                        <span>{item.fieldName + ": "}<b>{item.fieldValue}</b></span>
                        <br />
                        <br />
                    </div>
                )}
                {/* </center> */}
            </div>
        );
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
        dataObj.fields = feilds;
        dataObj["transferTypeValues"] = e.value;
        dataObj.transferTypeObj = transferTypeObj;
        this.setState({ dataObj: dataObj });
    }

    onSelectButtonChange = (e, key) => {
        let fieldList = this.state.fieldList;
        let dataObj = { ...this.state.dataObj };
        if (undefined !== !dataObj[`${key}`] && null !== !dataObj[`${key}`] && (dataObj[`${key}`] + "").length > 0) {
            if ((e.value + "").toLowerCase().trim() === "false") {
                dataObj[`${key}`] = false;
                fieldList[0].isSelected = true;
                fieldList[0].feildValue = "true";
                fieldList[1].isSelected = false;
                fieldList[1].feildValue = "false";
            } else {
                dataObj[`${key}`] = true;
                fieldList[0].isSelected = false;
                fieldList[0].feildValue = "false";
                fieldList[1].isSelected = true;
                fieldList[1].feildValue = "true";
            }
            this.setState({ dataObj: dataObj, fieldList: fieldList });
        }
        //  else {
        //     if ((e.value + "").toLowerCase().trim() === "false") {
        //         dataObj[`${key}`] = false;
        //     } else {
        //         dataObj[`${key}`] = true;
        //     }
        // }
        // this.setState({ dataObj: dataObj });
    }

    myUploader = (event) => {
        this.setState({ showLoader: "flex" });
        let files = [];
        for (let i = 0; i < event.files.length; i++) {
            let reader = new FileReader();
            reader.readAsDataURL(event.files[i]);
            reader.onload = function () {
                let attachmentObj = {
                    type: event.files[i].type,
                    fileName: event.files[i].name,
                    uri: event.files[i]?.objectURL,
                    base64: reader.result,
                    attachmentDate: new Date()
                }
                files.push(attachmentObj);
            };
            reader.onerror = function (error) {
                console.error('Error: ', error);
            };
        }
        setTimeout(() => {
            if (files.length > 0) {
                let dataObj = { ...this.state.dataObj }
                dataObj.files = files;
                this.setState({ showLoader: "none", dataObj: dataObj, doesImageChoosen: true });
            } else {
                this.setState({ showLoader: "flex" });
            }
        }, 1000);
    }

    clearUploadedImage = (event) => {
        let foundIndex = -1;
        for (let i = 0; i < this.state.dataObj.files.length; i++) {
            if (this.state.dataObj.files[i].fileName === event.file?.name) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex >= 0) {
            let dataObj = { ...this.state.dataObj };
            let files = [...dataObj.files];
            files.splice(foundIndex, 1);
            dataObj.files = files;
            this.setState({ dataObj: dataObj })
        }
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
                            <TabPanel header="Active Suppliers">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} suppliers" emptyMessage="No supplier found."
                                    globalFilter={this.state.globalFilter} header={this.header} rowExpansionTemplate={this.rowExpansionTemplate}
                                    expandedRows={this.state.expandedRows} onRowToggle={(e) => this.setState({ expandedRows: e.data })} responsiveLayout="scroll">
                                    <Column expander style={{ width: '3em' }} />
                                    <Column field="supplierName" header="Supplier Name" sortable />
                                    <Column field="vatNumber" header="VAT Number" sortable />
                                    <Column field="vendorCode" header="Code" sortable style={{ width: "8%" }} />
                                    <Column field="contactPersonName" header="Contact Person" sortable />
                                    {/* <Column field="mobileNumber" header="Mobile Number" sortable /> */}
                                    <Column field="emailId" header="Email ID" sortable />
                                    {/* <Column field="transerType" header="Transer Type" sortable /> */}
                                    <Column field="address" header="Address" />
                                    <Column header="Action" body={this.actionBodyTemplate}></Column>
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Suppliers">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} suppliers" emptyMessage="No supplier found."
                                    globalFilter={this.state.globalFilter} header={this.header} rowExpansionTemplate={this.rowExpansionTemplate}
                                    expandedRows={this.state.expandedRows} onRowToggle={(e) => this.setState({ expandedRows: e.data })} responsiveLayout="scroll">
                                    <Column expander style={{ width: '3em' }} />
                                    <Column field="supplierName" header="Supplier Name" sortable />
                                    <Column field="vatNumber" header="VAT Number" sortable />
                                    <Column field="vendorCode" header="Code" sortable />
                                    <Column field="contactPersonName" header="Contact Person Name" sortable />
                                    <Column field="mobileNumber" header="Mobile Number" sortable />
                                    <Column field="emailId" header="Email ID" sortable />
                                    {/* <Column field="transerType" header="Transer Type" sortable /> */}
                                    <Column field="address" header="Address" />
                                    <Column header="Action" body={this.actionBodyTemplate}></Column>
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + "Supplier"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="supplierName">Supplier Name</label>
                                    <InputText id="supplierName" value={this.state.dataObj.supplierName} onChange={(e) => this.onInputChange(e, 'supplierName')} autoFocus />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="vatNumber">VAT Number</label>
                                    <InputText id="vatNumber" value={this.state.dataObj.vatNumber} onChange={(e) => this.onInputChange(e, 'vatNumber')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="transferType">Transfer Type</label>
                                    {/* <InputText id="transferType" value={this.state.dataObj.transferTypeObj} onChange={(e) => this.onInputChange(e, 'transferTypeObj')}  /> */}
                                    {/* <Dropdown id="transferType" optionLabel="transferTypeName" optionValue="id" value={this.state.dataObj.transferTypeObj?.id} options={this.state.transferTypeList} onChange={(e) => this.onTransferTypeChange(e)} placeholder="Select On Transfer Type" /> */}
                                    <MultiSelect id="transferType" display="chip" optionLabel="transferTypeName" optionValue="id" value={this.state.dataObj.transferTypeValues} options={this.state.transferTypeList} onChange={(e) => this.onTransferTypeChange(e)} placeholder="Select On Transfer Type" />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="contactPersonName">Contact Person Name</label>
                                    <InputText id="contactPersonName" value={this.state.dataObj.contactPersonName} onChange={(e) => this.onInputChange(e, 'contactPersonName')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="mobileNumber">Mobile Number</label>
                                    <InputText id="mobileNumber" value={this.state.dataObj.mobileNumber} onChange={(e) => this.onInputChange(e, 'mobileNumber')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="emailId">Email ID</label>
                                    <InputText id="emailId" value={this.state.dataObj.emailId} onChange={(e) => this.onInputChange(e, 'emailId')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="vendorCode">Code</label>
                                    <InputText id="vendorCode" value={this.state.dataObj.vendorCode} onChange={(e) => this.onInputChange(e, 'vendorCode')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="markAsCommonSupplier">Mark as Common Supplier</label>
                                    <SelectButton id="markAsCommonSupplier" optionLabel="fieldName" optionValue="feildValue" options={this.state.fieldList} onChange={(e) => this.onSelectButtonChange(e, "markAsCommonSupplier")} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="address">Address</label>
                                    <InputTextarea id="address" rows={5} cols={30} value={this.state.dataObj.address} onChange={(e) => this.onInputChange(e, 'address')} autoResize />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="logoBase64">Supplier Attachments</label>
                                    <FileUpload id="logoBase64" name="demo" auto maxFileSize="1000000" multiple accept="*/*" uploadHandler={this.myUploader} onRemove={this.clearUploadedImage} customUpload />
                                </div>
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
                                <span>Are you sure you want to {(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} <b>{this.state.dataObj.supplierName}</b>?</span>
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(SuppliersScreen);