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
import { ApiHelper2, currencies, sessionKeys } from '../../utilities/ConstantVariable';
import { InputNumber } from 'primereact/inputnumber';

class CurrencyScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataList: [],
        dataObj: {
            id: null,
            currencyShortName: "",
            currencyLongName: "",
            noOfdecimals: 0,
            decimalName: "",
            statusObj: null,
        },
        showAddForm: false,
        showDeleteForm: false,
        showCurrencyPreferenceForm: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            id: null,
            currencyShortName: "",
            currencyLongName: "",
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
        ApiHelper2("getallcurrencies", reqObj, "POST", false, false, false, false).then(data => {
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
        this.setState({ showAddForm: false, showDeleteForm: false, showCurrencyPreferenceForm: false });
    }

    validateInputs() {
        if (this.validateFeild(this.state.dataObj.currencyLongName)) {
            if (this.validateFeild(this.state.dataObj.currencyShortName)) {
                this.saveOrUpdateObject(this.state.dataObj);
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter Currency Short Name', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Currency Long Name', detail: '' });
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
        ApiHelper2(this.state.isEdit ? "updatecurrency" : "createcurrency", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `Currency ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    case 4:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Currency`, detail: "Duplicate Name" });
                        break;
                    default:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Currency`, detail: data.statusDesc });
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

    onInputNumberChange = (e, key) => {
        let val = (e && e.value) || '';
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        this.setState({ dataObj: dataObj });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Currencies <span style={{ fontSize: 11 }}>(Define Currencies, where end-user can select to his requisition items.)</span></h5>
            </React.Fragment>
        )
    }

    rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" className="p-button-success p-mr-2 p-mb-2" onClick={this.onAdd} />
                {/* <Button label="Test" icon="pi pi-plus" className="p-button-success p-mr-2 p-mb-2" onClick={this.testApi} /> */}
            </React.Fragment>
        )
    }

    testApi = () => {
        let currenciesList = [];
        for (let i = 0; i < Object.keys(currencies).length; i++) {
            currenciesList.push({
                currencyShortName: Object.keys(currencies)[i],
                currencyLongName: currencies[Object.keys(currencies)[i]],
                isPrefered: false
            })
        }
        let reqObj = {
            reqList: currenciesList
        };
        ApiHelper2("testapi", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.message && null !== data.message) {
                this.toast.show({ severity: 'error', summary: data.message, detail: '' });
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

    actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" tooltip='Edit' onClick={() => this.onEdit(rowData)} />
                <Button icon={rowData.statusObj?.statusName === "Active" ? "pi pi-times-circle" : "pi pi-check"} tooltip={rowData.statusObj?.statusName === "Active" ? "Mark As Inactive" : "Mark As Active"} className="p-button-rounded p-button-warning p-mr-2" onClick={() => this.onDelete(rowData)} />
                {!rowData?.isPrefered &&
                    <Button icon={"pi pi-shield"} className="p-button-rounded p-button-info p-mr-2" tooltip='Mark As Preferred Currency' onClick={() => this.onChangeCurrencyPreference(rowData)} />}
            </div>
        );
    }

    inactiveActionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" tooltip='Edit' onClick={() => this.onEdit(rowData)} />
                <Button icon={rowData.statusObj?.statusName === "Active" ? "pi pi-times-circle" : "pi pi-check"} tooltip={rowData.statusObj?.statusName === "Active" ? "Mark As Inactive" : "Mark As Active"} className="p-button-rounded p-button-warning p-mr-2" onClick={() => this.onDelete(rowData)} />
            </div>
        );
    }

    currencyBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <label>{rowData?.isPrefered ? "Yes" : "No"}</label>
            </div>
        );
    }

    onDelete = (dataObj) => {
        if (undefined !== dataObj.noOfdecimals && null !== dataObj.noOfdecimals
            && undefined !== dataObj.decimalName && null !== dataObj.decimalName) {
            this.setState({ dataObj: dataObj, showLoader: "none", showDeleteForm: true });
        } else {
            this.toast.show({ severity: 'info', summary: `Add Missing Feilds to Activate`, detail: `No of Feilds & Decimal Name` });
        }
    }

    header = (
        <div className="table-header">
            <h5 className="p-m-0">Currency</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
            </span>
        </div>
    );

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
        ApiHelper2("deletecurrency", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Currency status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Currency Status`, detail: data.statusDesc });
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

    onChangeCurrencyPreference = (dataObj) => {
        this.setState({ dataObj: dataObj, showLoader: "none", showCurrencyPreferenceForm: true });
    }

    currencyPreferenceDialogFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.changeCurrencyPreferenceFormObject} />
            </div>
        )
    };

    changeCurrencyPreferenceFormObject = () => {
        this.setState({ showLoader: "flex", showCurrencyPreferenceForm: false });
        let reqObj = {
            reqObject: this.state.dataObj,
        }
        ApiHelper2("makepreferedcurrency", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showCurrencyPreferenceForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Currency Preference Updated Successfully`, detail: `` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showCurrencyPreferenceForm: false, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Currency Preference`, detail: data.statusDesc });
                        break;
                }
            } else {
                this.setState({ dataObj: this.state.emptyDataObj, showLoader: "none", showCurrencyPreferenceForm: false });
                this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
            }
        }).catch(reason => {
            console.error("Error ---> " + reason);
            this.setState({ dataObj: this.state.emptyDataObj, showLoader: "none", showCurrencyPreferenceForm: false });
            this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        });
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
                            <TabPanel header="Active Currencies">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} currenc(ies)" emptyMessage="No Currency(ies) Found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="currencyShortName" header="Short Name" sortable style={{ width: '10%' }} />
                                    <Column field="currencyLongName" header="Long Name" sortable style={{ width: '25%' }} />
                                    <Column field="noOfdecimals" header="No of Decimals" sortable style={{ width: '15%' }} />
                                    <Column field="decimalName" header="Decimal Name" sortable style={{ width: '20%' }} />
                                    <Column field="isPrefered" header="Is Prefered Currency" sortable body={this.currencyBodyTemplate} style={{ width: '10%' }} />
                                    <Column header="Action" body={this.actionBodyTemplate} style={{ width: '20%' }} />
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Currency">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} currenc(ies)" emptyMessage="No Currenc(ies) Found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="currencyShortName" header="Short Name" sortable style={{ width: '10%' }} />
                                    <Column field="currencyLongName" header="Long Name" sortable style={{ width: '25%' }} />
                                    <Column field="noOfdecimals" header="No of Decimals" sortable style={{ width: '15%' }} />
                                    <Column field="decimalName" header="Decimal Name" sortable style={{ width: '20%' }} />
                                    <Column field="isPrefered" header="Is Prefered Currency" sortable body={this.currencyBodyTemplate} style={{ width: '10%' }} />
                                    <Column header="Action" body={this.inactiveActionBodyTemplate} style={{ width: '20%' }} />
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + "Currency"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="currencyShortName">Short Name</label>
                                    <InputText id="currencyShortName" value={this.state.dataObj?.currencyShortName} onChange={(e) => this.onInputChange(e, 'currencyShortName')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="currencyLongName">Long Name</label>
                                    <InputText id="currencyLongName" value={this.state.dataObj?.currencyLongName} onChange={(e) => this.onInputChange(e, 'currencyLongName')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="noOfdecimals">No Of Decimals</label>
                                    <InputNumber id="noOfdecimals" value={this.state.dataObj?.noOfdecimals} onValueChange={(e) => this.onInputNumberChange(e, 'noOfdecimals')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="decimalName">Decimal Name</label>
                                    <InputText id="decimalName" value={this.state.dataObj?.decimalName} onChange={(e) => this.onInputChange(e, 'decimalName')} />
                                </div>
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showDeleteForm} style={{ width: '450px' }} header="Confirm" modal footer={this.deleteDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to <b>{(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} {this.state.dataObj?.currencyLongName} ({this.state.dataObj?.currencyShortName})</b>?</span>
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showCurrencyPreferenceForm} style={{ width: '450px' }} header="Confirm" modal footer={this.currencyPreferenceDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to make <b>{this.state.dataObj?.currencyLongName + "(" + this.state.dataObj?.currencyShortName + ") as a prefered currency"}</b>?</span>
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(CurrencyScreen);