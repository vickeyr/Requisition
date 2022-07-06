import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import { withRouter } from 'react-router-dom';
import { ApiHelper2, sessionKeys } from '../../utilities/ConstantVariable';

class UOMScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataList: [],
        dataObj: {
            id: null,
            uomNameShort: "",
            uomNameLong: "",
            statusObj: null,
        },
        showAddForm: false,
        showDeleteForm: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            id: null,
            uomNameShort: "",
            uomNameLong: "",
            statusObj: null,
        },
        activeTabIndex: 0,
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
        ApiHelper2("getalluoms", reqObj, "POST", false, false, false, false).then(data => {
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
        if (this.validateFeild(this.state.dataObj.uomNameLong)) {
            if (this.validateFeild(this.state.dataObj.uomNameShort)) {
                this.saveOrUpdateObject(this.state.dataObj);
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter Short Unit Of Measurement', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Long Unit Of Measurement', detail: '' });
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
        ApiHelper2(this.state.isEdit ? "updateuom" : "createuom", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `Unit Of Measurement ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    case 4:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Unit Of Measurement`, detail: "Duplicate Name" });
                        break;
                    default:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Unit Of Measurement`, detail: data.statusDesc });
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
        this.setState({ isEdit: true, dataObj: dataObj, showAddForm: true }, () => this.setState({ showLoader: "none" }));
    }

    onInputChange = (e, key) => {
        let val = (e.target && e.target.value) || '';
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        this.setState({ dataObj: dataObj });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Unit Of Mesurement <span style={{ fontSize: 11 }}>(Define Unit OF Measuremnt, where end-user can select uom to his requisition items.)</span></h5>
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
    }

    header = () => {
        return (
            <div className="table-header">
                <h5 className="p-m-0">Unit Of Measurement</h5>
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
        ApiHelper2("deleteuom", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Unit Of Measurement status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Unit Of Measurement Status`, detail: data.statusDesc });
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

    render() {
        return (
            <div className="p-grid crud-demo">
                <div className="p-col-12">
                    <div className="card">
                        <Toast ref={ref => this.toast = ref} />
                        <div class="splash-screen" style={{ position: "absolute", top: 0, left: 0, zIndex: 10,  display: this.state.showLoader, backgroundColor: "rgba(255, 87, 34, 0.2)" }}>
                            <div class="splash-loader-container">
                                <svg class="splash-loader" width="65px" height="65px" viewBox="0 0 66 66"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle class="splash-path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" />
                                </svg>
                            </div>
                        </div>
                        <Toolbar className="p-mb-4 p-toolbar" left={this.leftToolbarTemplate} right={this.rightToolbarTemplate}></Toolbar>

                        <TabView activeIndex={this.state.activeTabIndex} onTabChange={(e) => this.onTabChange(e.index)}>
                            <TabPanel header="Active Unit Of Measurement">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Unit Of Measurement" emptyMessage="No Unit Of Measurement(s) Found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="uomNameShort" header="Short Name" sortable />
                                    <Column field="uomNameLong" header="Long Name" sortable />
                                    <Column header="Action" body={this.actionBodyTemplate} />
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Unit Of Measurement">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Unit Of Measurement" emptyMessage="No Unit Of Measurement(s) Found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="uomNameShort" header="Short Name" sortable />
                                    <Column field="uomNameLong" header="Long Name" sortable />
                                    <Column header="Action" body={this.actionBodyTemplate} />
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + "Unit Of Measurement"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="uomNameShort">Short Name</label>
                                    <InputText id="uomNameShort" value={this.state.dataObj.uomNameShort} onChange={(e) => this.onInputChange(e, 'uomNameShort')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="uomNameLong">Long Name</label>
                                    <InputText id="uomNameLong" value={this.state.dataObj.uomNameLong} onChange={(e) => this.onInputChange(e, 'uomNameLong')} />
                                </div>
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showDeleteForm} style={{ width: '450px' }} header="Confirm" modal footer={this.deleteDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to {(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} <b>{this.state.dataObj?.uomNameLong}</b>?</span>
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(UOMScreen);