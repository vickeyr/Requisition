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

class TransferTypeScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataList: [],
        dataObj: {
            id: null,
            transferTypeName: "",
            fieldsRequired: true,
            fields: [],
            statusObj: null,
            forReimbursment: false,
            forRequisition: false
        },
        forTypes: [
            {
                id: 0,
                title: "For Reimbursment",
                isSelected: false,
                key: "forReimbursment"
            },
            {
                id: 1,
                title: "For Requisition",
                isSelected: false,
                key: "forRequisition"
            }
        ],
        selectedForTypes: "",
        showAddForm: false,
        showDeleteForm: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            id: null,
            transferTypeName: "",
            fieldsRequired: true,
            fields: [],
            statusObj: null,
            forReimbursment: false,
            forRequisition: false
        },
        activeTabIndex: 0,
        fieldList: [
            {
                fieldName: "NO",
                isSelected: false
            },
            {
                fieldName: "YES",
                isSelected: true
            }
        ],
        fieldObj: {
            fieldName: "",
            isFieldMandatory: true
        },
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
            extraVariable: (index === 0) ? "Active,All" : "InActive,All"
        };
        ApiHelper2("getalltransfertype", reqObj, "POST", false, false, false, false).then(data => {
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
        this.setState({ dataObj: this.state.emptyDataObj, selectedForTypes: [], isEdit: false, showLoader: "none", showAddForm: true });
    }

    hideDialog = () => {
        this.setState({ showAddForm: false, showDeleteForm: false });
    }

    validateInputs() {
        if (this.validateFeild(this.state.dataObj.transferTypeName)) {
            // if (undefined !== this.state.dataObj.forReimbursment && null !== this.state.dataObj.forReimbursment && undefined !== this.state.dataObj.forRequisition && null !== this.state.dataObj.forRequisition) {
            //     if (this.state.dataObj.forReimbursment || this.state.dataObj.forRequisition) {
            if (this.state.selectedForTypes?.length > 0) {
                if (this.state.dataObj.fieldsRequired) {
                    if (this.state.dataObj.fields.length > 0) {
                        this.saveOrUpdateObject(this.state.dataObj);
                    } else {
                        this.toast.show({ severity: 'error', summary: 'Enter atleast a feilds ', detail: '' });
                    }
                } else {
                    this.saveOrUpdateObject(this.state.dataObj);
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Select One For Type', detail: '' });
            }
            //     } else {
            //         this.toast.show({ severity: 'error', summary: 'Select One For Type', detail: '' });
            //     }
            // } else {
            //     this.toast.show({ severity: 'error', summary: 'Select One For Type', detail: '' });
            // }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Transer Type', detail: '' });
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
        let reqObj = {
            reqObject: dataObj
        }
        ApiHelper2(this.state.isEdit ? "updatetransfertype" : "createtransfertype", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `Transfer Type ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    default:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Transfer Type`, detail: data.statusDesc });
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
        this.setState({ isEdit: true, showLoader: "flex" });
        let selectedForTypes = [];
        for (let i = 0; i < this.state.forTypes.length; i++) {
            if (dataObj[`${this.state.forTypes[i].key}`]) {
                selectedForTypes.push(this.state.forTypes[i]);
            }
        }
        // let selectedForTypesString = ""
        // for (let i = 0; i < selectedForTypes.length; i++) {
        //     if ((selectedForTypes.length - 1) === i) {
        //         selectedForTypesString += selectedForTypes[i];
        //     } else {
        //         selectedForTypesString += selectedForTypes[i] + ",";
        //     }
        // }
        this.setState({ dataObj: dataObj, selectedForTypes: selectedForTypes, showAddForm: true }, () => this.setState({ showLoader: "none" }));
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
        if ((val + "").trim() === "") {
            val = false;
        }
        dataObj[`${key}`] = val;
        console.log("val ---> " + val)
        if ((val + "") === "false") {
            dataObj.fields = [];
            this.setState({ dataObj: dataObj });
        } else {
            this.setState({ dataObj: dataObj });
        }
        console.log("dataObj ---> " + JSON.stringify(dataObj))
    }

    handleForSelection(value) {
        this.setState({ selectedForTypes: value });
        let dataObj = { ...this.state.dataObj };
        for (let i = 0; i < this.state.forTypes.length; i++) {
            dataObj[`${this.state.forTypes[i].key}`] = false;
        }
        for (let i = 0; i < value.length; i++) {
            dataObj[`${value[i].key}`] = true;
        }
        this.setState({ dataObj: dataObj });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Transfer Type <span style={{ fontSize: 11 }}>(Define Transfer Type with fields, where FD user can tranfer amount to appropiate type.)</span></h5>
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

    header = () => {
        return (
            <div className="table-header">
                <h5 className="p-m-0">Transfer Type</h5>
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

    forTypes(rowData) {
        let listOfFields = "";
        for (let i = 0; i < this.state.forTypes.length; i++) {
            if (undefined !== rowData[`${this.state.forTypes[i].key}`] && null !== rowData[`${this.state.forTypes[i].key}`] && rowData[`${this.state.forTypes[i].key}`]) {
                listOfFields += this.state.forTypes[i].title + ", ";
            }
        }
        listOfFields = listOfFields.substring(0, listOfFields.length - 2)
        return <span>{listOfFields}</span>;
    }

    displayFields(rowData) {
        let listOfFields = "";
        if (undefined !== rowData.fields && null !== rowData.fields && rowData.fields.length > 0) {
            for (let i = 0; i < rowData.fields.length; i++) {
                listOfFields += rowData.fields[i].fieldName + ", ";
                if ((i + 1) === rowData.fields.length) {
                    listOfFields = listOfFields.substring(0, listOfFields.length - 2);
                }
            }
        } else {
            listOfFields = "No fields added to " + rowData.transferTypeName;
        }
        return <span>{listOfFields}</span>;
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
        ApiHelper2("deletetransfertype", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Transfer Type status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Transfer Type Status`, detail: data.statusDesc });
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

    deleteField(fieldDataObj) {
        let indexToRemove = -1;
        let fields = this.state.dataObj.fields;
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].fieldName === fieldDataObj.fieldName) {
                indexToRemove = i;
                break;
            }
        }
        if (indexToRemove >= 0) {
            fields.splice(indexToRemove, 1);
            let dataObj = this.state.dataObj;
            dataObj["fields"] = fields;
            this.setState({ dataObj: dataObj });
        }
    }

    addField() {
        if (this.validateFeild(this.state.fieldObj.fieldName)) {
            if (this.validateFeild(this.state.fieldObj.isFieldMandatory + "")) {
                let fields = this.state.dataObj.fields;
                fields.push(this.state.fieldObj)
                let dataObj = this.state.dataObj;
                dataObj["fields"] = fields;
                this.setState({ dataObj: dataObj, fieldObj: { fieldName: "", isFieldMandatory: true } });
            } else {
                this.toast.show({ severity: 'error', summary: 'Select Is Field Mandatory', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Field Name', detail: '' });
        }
    }

    fieldActionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-times-circle" className="p-button-rounded p-button-warning p-mr-2" onClick={() => this.deleteField(rowData)} />
            </div>
        );
    }

    isFieldMandatoryBodyTemplate = (rowData) => {
        return (
            <span>{rowData.isFieldMandatory ? "YES" : "NO"}</span>
        );
    }

    updateForSelection(key) {
        let dataObj = { ...this.state.dataObj };
        if (key === "both") {
            dataObj.forReimbursment = true;
            dataObj.forRequisition = true;
        } else {
            dataObj.forReimbursment = false;
            dataObj.forRequisition = false;
            dataObj[`${key}`] = true;
        }
        this.setState({ dataObj: dataObj });
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
                            <TabPanel header="Active Transfer Type">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transfer type" emptyMessage="No transfer type found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="transferTypeName" header="Transfer Type Name" sortable />
                                    <Column header="Fields" body={this.displayFields.bind(this)} />
                                    <Column header="For Type" body={this.forTypes.bind(this)} />
                                    <Column header="Action" body={this.actionBodyTemplate} />
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Transfer Type">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transfer type" emptyMessage="No transfer type found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="transferTypeName" header="Transfer Type Name" sortable />
                                    <Column header="Fields" body={this.displayFields.bind(this)} />
                                    <Column header="Action" body={this.actionBodyTemplate} />
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + "Transfer Type"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="name">Transfer Type Name</label>
                                    <InputText id="name" value={this.state.dataObj.transferTypeName} onChange={(e) => this.onInputChange(e, 'transferTypeName')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "row" }}>
                                    <label htmlFor='forType' style={{ marginBottom: 10 }}>This type is <b>For</b></label>
                                    <MultiSelect id="forType" display="chip" optionLabel="title" value={this.state.selectedForTypes} options={this.state.forTypes} onChange={(e) => this.handleForSelection(e.value)} placeholder="Select One For Type" />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="status">Fields Required</label>
                                    <SelectButton id="status" optionLabel="fieldName" optionValue="isSelected" value={this.state.dataObj.fieldsRequired} options={this.state.fieldList} onChange={(e) => this.onSelectButtonChange(e, "fieldsRequired")} />
                                </div>
                            </div>
                            {this.state.dataObj.fieldsRequired ?
                                <div className="p-field p-grid" style={{ alignItems: "center", justifyContent: "center" }}>
                                    <div className="p-md-8">
                                        <label htmlFor="name">Field Name</label>
                                        <InputText id="name" value={this.state.fieldObj.fieldName} onChange={(e) => { let fieldObj = this.state.fieldObj; fieldObj.fieldName = (e.target && e.target.value) || ''; this.setState({ fieldObj: fieldObj }) }} />
                                    </div>
                                    <div className="p-md-3">
                                        <label htmlFor="fieldMandatory">Is Fields Mandatory</label>
                                        <SelectButton id="status" optionLabel="fieldName" optionValue="isSelected" value={this.state.fieldObj.isFieldMandatory} options={this.state.fieldList} onChange={(e) => { let fieldObj = this.state.fieldObj; fieldObj.isFieldMandatory = e.value; this.setState({ fieldObj: fieldObj }) }} />
                                    </div>
                                    <div className="p-md-1">
                                        <Button icon="pi pi-plus-circle" className="p-button-rounded p-button-success p-mr-2" onClick={() => this.addField()} />
                                    </div>
                                    <div className="p-md-12">
                                        <DataTable ref={ref => this.fieldDataTable = ref} value={this.state.dataObj.fields} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} field" emptyMessage="No fields found.">
                                            <Column field="fieldName" header="Field Name" sortable />
                                            <Column header="Is Mandatory" body={this.isFieldMandatoryBodyTemplate} />
                                            <Column header="Action" body={this.fieldActionBodyTemplate}></Column>
                                        </DataTable>
                                    </div>
                                </div>
                                : null}
                        </Dialog>

                        <Dialog visible={this.state.showDeleteForm} style={{ width: '450px' }} header="Confirm" modal footer={this.deleteDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to {(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} <b>{this.state.dataObj.fullName}</b>?</span>
                            </div>
                        </Dialog>
                    </div >
                </div >
            </div >
        );
    }
}

export default withRouter(TransferTypeScreen);