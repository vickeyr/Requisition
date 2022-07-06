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
import { Calendar } from 'primereact/calendar';
import { SelectButton } from 'primereact/selectbutton';
import moment from 'moment'

class ProjectsScreen extends React.Component {

    state = {
        showLoader: "flex",
        companyObj: null,
        dataList: [],
        dataObj: {
            id: null,
            projectTitle: '',
            projectCode: '',
            companyObj: null,
            statusObj: null,
            createdDate: null,
            completedDate: null,
            isRetention: null,
            retentionDate: null
        },
        showAddForm: false,
        showDeleteForm: false,
        showMarkCompleteForm: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            id: null,
            projectTitle: '',
            projectCode: '',
            companyObj: null,
            statusObj: null,
            createdDate: null,
            completedDate: null,
            isRetention: null,
            retentionDate: null
        },
        activeTabIndex: 0,
        codeInitials: "",
        initials: "",
        retensionList: [
            {
                fieldName: "NO",
                isSelected: false
            },
            {
                fieldName: "YES",
                isSelected: false
            }
        ],
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
            sessionStorage.removeItem(sessionKeys.companyObj);
            this.props.history.push("/");
        }
    }

    onTabChange(index) {
        this.setState({ showLoader: "flex", activeIndex: index }, () => this.loadData(index, this.state.companyObj));
    }

    loadData = async (index, companyObj) => {
        let reqObj = {
            extraVariable: (index === 0) ? "Active," + companyObj?.id : (index === 1) ? "InActive," + companyObj?.id : "Completed," + companyObj?.id
        };
        ApiHelper2("getallprojectsbycompanyid", reqObj, "POST", false, false, false, false).then(data => {
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

    onBack = () => {
        sessionStorage.removeItem(sessionKeys.companyObj);
        this.props.history.push("/companies");
    }

    getInitials() {
        let initialsList = (this.state.companyObj?.companyName + "").split(" ");
        let initials = "";
        for (let i = 0; i < initialsList.length; i++) {
            initials += initialsList[i].charAt(0).toUpperCase();
        }
        return initials;
    }

    upadateCodeInitials() {
        let initialsList = this.state.dataObj?.projectTitle?.split(" ");
        let initials = "";
        for (let i = 0; i < initialsList.length; i++) {
            initials += initialsList[i].charAt(0).toUpperCase();
        }
        this.setState({ codeInitials: this.getInitials() + initials + "-" })
    }

    onAdd = () => {
        this.setState({ dataObj: this.state.emptyDataObj, initials: this.getInitials() + "-", codeInitials: this.getInitials() + "-", isEdit: false, showLoader: "none", showAddForm: true });
    }

    hideDialog = () => {
        this.setState({ showAddForm: false, showDeleteForm: false, showMarkCompleteForm: false, });
    }

    validateInputs() {
        if (this.validateFeild(this.state.dataObj.projectTitle)) {
            if (this.validateFeild(this.state.dataObj.projectCode)) {
                this.saveOrUpdateObject();
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter Project Code', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Project Title', detail: '' });
        }
    }

    validateFeild(field) {
        if (undefined !== field && null !== field && (field + "") !== '' && field.length >= 0) {
            return true;
        } else {
            return false;
        }
    }

    saveOrUpdateObject = () => {
        this.setState({ showLoader: "flex", showAddForm: false });
        let dataObj = this.state.dataObj;
        dataObj.companyObj = this.state.companyObj;
        // if (this.state.isEdit) {
        //     dataObj.projectTitle = this.getInitials() + "-" + dataObj.projectTitle;
        //     dataObj.projectCode = this.state.codeInitials + dataObj.projectCode;
        // } else {
        //     dataObj.projectTitle = this.getInitials() + "-" + dataObj.projectTitle;
        //     dataObj.projectCode = this.state.codeInitials + dataObj.projectCode;
        //     dataObj.createdDate = new Date();
        // }
        let reqObj = {
            reqObject: dataObj,
        };
        ApiHelper2(this.state.isEdit ? "updateproject" : "createproject", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
                        this.loadData(this.state.activeTabIndex, this.state.companyObj);
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `Project ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    case 4:
                        this.setState({ showAddForm: false, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Duplicate Project`, detail: data.statusDesc });
                        break;
                    default:
                        this.setState({ showAddForm: false, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Project`, detail: data.statusDesc });
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
        this.setState({ dataObj: dataObj, isEdit: true, showAddForm: true });
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

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="back" icon="pi pi-chevron-left" className="p-button-secondary p-mr-2 p-mb-2" onClick={this.onBack} />
                <h5>{this.state.companyObj?.companyName}'s Projects <span style={{ fontSize: 11 }}>(Define Projects in which requisition will happen.)</span></h5>
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

    mainActionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" tooltip='Edit' onClick={() => this.onEdit(rowData)} />
                <Button icon={rowData.statusObj?.statusName === "Active" ? "pi pi-times-circle" : "pi pi-check"} tooltip={rowData.statusObj?.statusName === "Active" ? "Mark As Inactive" : "Mark As Active"} className="p-button-rounded p-button-warning p-mr-2" onClick={() => this.onDelete(rowData)} />
                <Button icon={"pi pi-check-circle"} className="p-button-rounded p-button-secondary p-mr-2" tooltip={"Mark As Complete"} onClick={() => this.onMarkComplete(rowData)} />
            </div>
        );
    }

    dateBody = (rowData, isCompletedDate, isRetension) => {
        return (
            <div className="actions">
                {isRetension ?
                    <label>Yes on {moment(rowData.retentionDate).format("DD-MM-YYYY")}</label>
                    : <label>{moment(isCompletedDate ? rowData.completedDate : rowData.createdDate).format("DD-MM-YYYY")}</label>}
            </div>
        );
    }

    onMarkComplete = (dataObj) => {
        this.setState({ dataObj: dataObj, showLoader: "none", showMarkCompleteForm: true });
        // setTimeout(() => {
        //     this.setState({ showLoader: "none", showDeleteForm: true });
        // }, 500);
    }

    markCompleteDialogFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.validateMCInputs} />
            </div>
        )
    };

    validateMCInputs = () => {
        if (undefined !== this.state.dataObj.completedDate && null !== this.state.dataObj.completedDate && (this.state.dataObj.completedDate + "").length > 0) {
            if (undefined !== this.state.dataObj.isRetention && null !== this.state.dataObj.isRetention) {
                if ((this.state.dataObj.isRetention + "").length > 0 && this.state.dataObj.isRetention) {
                    if (undefined !== this.state.dataObj.retentionDate && null !== this.state.dataObj.retentionDate && (this.state.dataObj.retentionDate + "").length > 0) {
                        this.markCompleteObject();
                    } else {
                        this.toast.show({ severity: 'error', summary: 'Select Retension Date', detail: '' });
                    }
                } else {
                    this.markCompleteObject();
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Select Is Retension!', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Select Completed Date', detail: '' });
        }
    }

    markCompleteObject = () => {
        this.setState({ showLoader: "flex", showDeleteForm: false });
        let reqObj = {
            reqObject: this.state.dataObj,
        }
        ApiHelper2("markprojectcomplate", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showMarkCompleteForm: false });
                        this.loadData(this.state.activeTabIndex, this.state.companyObj);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Project Completed Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Complete Project`, detail: data.statusDesc });
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
        ApiHelper2("deleteproject", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex, this.state.companyObj);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Project status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Project Status`, detail: data.statusDesc });
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
                <h5 className="p-m-0">Project</h5>
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

    onSelectButtonChange = (e, key) => {
        let val = e.value ? e.value : ""
        let dataObj = { ...this.state.dataObj };
        dataObj.isRetention = (val.fieldName === "YES");
        this.setState({ dataObj: dataObj });
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
                            <TabPanel header="Active Projects">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} projects" emptyMessage="No Projects found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="projectTitle" header="Title" sortable />
                                    <Column field="projectCode" header="Code" sortable />
                                    <Column field="createdDate" header="Created On" body={(rowData) => this.dateBody(rowData, false)} />
                                    <Column header="Action" body={this.mainActionBodyTemplate} />
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Projects">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} projects" emptyMessage="No projects found."
                                    globalFilter={this.state.globalFilter} header={this.header} responsiveLayout="scroll">
                                    <Column field="projectTitle" header="Title" sortable />
                                    <Column field="projectCode" header="Code" sortable />
                                    <Column field="createdDate" header="Created On" body={(rowData) => this.dateBody(rowData, false)} />
                                    <Column header="Action" body={this.actionBodyTemplate}></Column>
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Completed Projects">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} projects" emptyMessage="No project found."
                                    globalFilter={this.state.globalFilter} header={this.header} responsiveLayout="scroll">
                                    <Column field="projectTitle" header="Title" sortable />
                                    <Column field="projectCode" header="Code" sortable />
                                    <Column field="createdDate" header="Created On" body={(rowData) => this.dateBody(rowData, false, false)} />
                                    <Column field="completedDate" header="Completed On" body={(rowData) => this.dateBody(rowData, true, false)} />
                                    <Column field="completedDate" header="Retention" body={(rowData) => this.dateBody(rowData, false, true)} />
                                    {/* <Column header="Action" body={this.mainActionBodyTemplate}></Column> */}
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + this.state.companyObj?.companyName + "'s Project"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="projectTitle">Project Title</label>
                                    <InputText id="projectTitle" value={this.state.dataObj.projectTitle} onChange={(e) => this.onInputChange(e, 'projectTitle')} autoFocus />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="projectCode">Project Code</label>
                                    <InputText id="projectCode" value={this.state.dataObj.projectCode} onChange={(e) => this.onInputChange(e, 'projectCode')} />
                                </div>
                                {!this.state.isEdit &&
                                    <div className="p-md-6" style={{ flexDirection: "column" }}>
                                        <label htmlFor="createdDate">Created Date</label>
                                        <Calendar id="createdDate" maxDate={new Date()} readOnlyInput value={this.state.dataObj.createdDate} onChange={(e) => this.onInputChange(e, 'createdDate')}></Calendar>
                                    </div>}
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showDeleteForm} style={{ width: '450px' }} header="Confirm" modal footer={this.deleteDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to {(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} <b>{this.state.dataObj.projectTitle}</b>?</span>
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showMarkCompleteForm} style={{ width: '60%' }} header={"Complete " + this.state.dataObj?.projectTitle} modal className="p-fluid" footer={this.markCompleteDialogFooter} onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="completedDate">Completed Date</label>
                                    <Calendar id="completedDate" maxDate={new Date()} readOnlyInput value={this.state.dataObj.completedDate} onChange={(e) => this.onInputChange(e, 'completedDate')}></Calendar>
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="isRetention">Is Retension</label>
                                    <SelectButton id="isRetention" optionLabel="fieldName" value={this.state.dataObj.isRetention} options={this.state.retensionList} onChange={(e) => this.onSelectButtonChange(e, "isRetention")} />
                                </div>
                                {(undefined !== this.state.dataObj.isRetention && null !== this.state.dataObj.isRetention && ((this.state.dataObj.isRetention + "") === "true")) ?
                                    <div className="p-md-6" style={{ flexDirection: "column" }}>
                                        <label htmlFor="retentionDate">Retension Date</label>
                                        <Calendar id="retentionDate" minDate={new Date()} readOnlyInput value={this.state.dataObj.retentionDate} onChange={(e) => this.onInputChange(e, 'retentionDate')}></Calendar>
                                    </div> : null}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(ProjectsScreen);