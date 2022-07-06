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
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';

class CompaniesScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataList: [],
        dataObj: {
            companyName: "",
            companyAddress: "",
            vatNumber: "",
            contactPersonName: "",
            emailId: "",
            shortCode: "",
            mobileNumber: "",
            imageURL: "",
            logoBase64: "",
            shouldBypassPurchaseDepartment: null,
            statusObj: null,
            createdBy: null,
            createdDate: null
        },
        showAddForm: false,
        showDeleteForm: false,
        showDetails: false,
        isEdit: false,
        globalFilter: null,
        emptyDataObj: {
            companyName: "",
            companyAddress: "",
            vatNumber: "",
            contactPersonName: "",
            emailId: "",
            shortCode: "",
            mobileNumber: "",
            imageURL: "",
            logoBase64: "",
            shouldBypassPurchaseDepartment: null,
            statusObj: null,
            createdBy: null,
            createdDate: null
        },
        rolesList: [],
        employeeStatusList: [],
        activeTabIndex: 0,
        companyLogo: null,
        doesImageChoosen: false,
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
        ApiHelper2("getallcompanies", reqObj, "POST", false, false, false, false).then(data => {
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
        let emptyDataObj = this.state.emptyDataObj;
        emptyDataObj["shouldBypassPurchaseDepartment"] = true;
        this.setState({ dataObj: emptyDataObj, isEdit: false, showLoader: "flex" });
        setTimeout(() => {
            this.setState({ showLoader: "none", showAddForm: true, doesImageChoosen: false });
        }, 500);
    }

    hideDialog = () => {
        this.setState({ showAddForm: false, showDeleteForm: false, showDetails: false, dataObj: this.state.emptyDataObj });
    }

    validateInputs() {
        if (!this.state.isEdit) {
            if (this.validateFeild(this.state.dataObj?.logoBase64)) {
                this.validateRemainingInput();
            } else {
                // this.toast.show({ severity: 'error', summary: 'Select Valid Image', detail: '' });
                this.validateRemainingInput();
            }
        } else {
            if (this.state.doesImageChoosen) {
                if (this.validateFeild(this.state.dataObj?.files)) {
                    this.validateRemainingInput();
                } else {
                    this.toast.show({ severity: 'error', summary: 'Select Valid Image', detail: '' });
                }
            } else {
                this.validateRemainingInput();
            }
        }
    }

    validateRemainingInput() {
        if (this.validateFeild(this.state.dataObj?.companyAddress)) {
            if (this.validateFeild(this.state.dataObj?.companyName)) {
                if (this.validateFeild(this.state.dataObj?.vatNumber)) {
                    if (this.validateFeild(this.state.dataObj?.contactPersonName)) {
                        if (this.validateFeild(this.state.dataObj?.mobileNumber)) {
                            if (!isNaN(this.state.dataObj?.mobileNumber + "") && (this.state.dataObj?.mobileNumber + "").length === 8) {
                                if (this.validateFeild(this.state.dataObj?.emailId)) {
                                    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                                    if (re.test(this.state.dataObj?.emailId)) {
                                        if (undefined !== this.state.dataObj?.shortCode && null !== this.state.dataObj?.shortCode && (this.state.dataObj?.shortCode + "").length > 0) {
                                            if (undefined !== this.state.dataObj?.shouldBypassPurchaseDepartment && null !== this.state.dataObj?.shouldBypassPurchaseDepartment && (this.state.dataObj?.shouldBypassPurchaseDepartment + "").length > 0) {
                                                this.saveOrUpdateObject();
                                            } else {
                                                this.toast.show({ severity: 'error', summary: 'Select Should Bypass Department!', detail: '' });
                                            }
                                        } else {
                                            this.toast.show({ severity: 'error', summary: 'Enter Short Code', detail: '' });
                                        }
                                    } else {
                                        this.toast.show({ severity: 'error', summary: 'Enter Valid Email ID', detail: '' });
                                    }
                                } else {
                                    this.toast.show({ severity: 'error', summary: 'Enter Email ID', detail: '' });
                                }
                            } else {
                                this.toast.show({ severity: 'error', summary: 'Enter Valid 8 Digit Mobile Number', detail: '' });
                            }
                        } else {
                            this.toast.show({ severity: 'error', summary: 'Enter Mobile Number', detail: '' });
                        }
                    } else {
                        this.toast.show({ severity: 'error', summary: 'Enter Contact Person Name', detail: '' });
                    }
                } else {
                    this.toast.show({ severity: 'error', summary: 'Enter VAT Number', detail: '' });
                }
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter Company Name', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter Company Address', detail: '' });
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
        let logoImage = this.state.dataObj?.logoBase64;
        let dataObj = this.state.dataObj;
        dataObj["logoBase64"] = "";
        this.setState({ dataObj: dataObj })
        let reqObj = {
            reqObject: this.state.dataObj,
            extraVariable: logoImage
        }
        console.log("ReqObj ---> " + JSON.stringify(reqObj));
        // ApiHelper2(this.state.isEdit ? "updatecompany" : "createcompany", reqObj, "POST", false, false, false, false).then(data => {
        //     if (undefined !== data && null !== data) {
        //         switch (data.statusCode) {
        //             case 0:
        //                 this.setState({ dataObj: this.state.emptyDataObj, showAddForm: false });
        //                 this.loadData(this.state.activeTabIndex);
        //                 this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `Company ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
        //                 break;
        //             default:
        //                 this.setState({ showAddForm: true, showLoader: "none" });
        //                 this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} Company Details`, detail: data.statusDesc });
        //                 break;
        //         }
        //     } else {
        //         this.setState({ showLoader: "none", showAddForm: true });
        //         this.toast.show({ severity: 'error', summary: 'Something Went Wrong', detail: 'Please Try Again Later.' });
        //     }
        // }).catch(reason => {
        //     console.error("Error ---> " + reason);
        //     this.setState({ showLoader: "none", showAddForm: true });
        //     this.toast.show({ severity: 'error', summary: 'Server not reachable', detail: 'Please try after sometime.' });
        // });
    }

    onEdit = (dataObj) => {
        dataObj["shouldBypassPurchaseDepartment"] = true;
        if (!(undefined !== dataObj.shouldBypassPurchaseDepartment && null !== dataObj.shouldBypassPurchaseDepartment)) {
            let feildsList = this.state.fieldList;
            if ((dataObj.shouldBypassPurchaseDepartment + "").length > 0) {
                if (dataObj.shouldBypassPurchaseDepartment) {
                    feildsList[1].isSelected = true;
                    feildsList[1].feildValue = false;
                } else {
                    feildsList[1].isSelected = true;
                    feildsList[1].feildValue = true;
                }
            } else {
                feildsList[1].isSelected = true;
            }
            this.setState({ feildsList: feildsList })
        }
        this.setState({ isEdit: true, dataObj: dataObj, showLoader: "flex" });
        setTimeout(() => {
            this.setState({ showLoader: "none", showAddForm: true, doesImageChoosen: false });
        }, 500);
    }

    dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    onInputChange = (e, key) => {
        let val = (e.target && e.target.value) || '';
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        this.setState({ dataObj: dataObj });
    }

    onSelectButtonChange = (e, key) => {
        let dataObj = { ...this.state.dataObj };
        if (undefined !== !dataObj[`${key}`] && null !== !dataObj[`${key}`] && (dataObj[`${key}`] + "").length > 0) {
            if ((e.value + "").toLowerCase().trim() === "false") {
                dataObj[`${key}`] = false;
            } else {
                dataObj[`${key}`] = true;
            }
        } else {
            if ((e.value + "").toLowerCase().trim() === "false") {
                dataObj[`${key}`] = false;
            } else {
                dataObj[`${key}`] = true;
            }
        }
        this.setState({ dataObj: dataObj });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Companies <span style={{ fontSize: 11 }}>(Define companies in which requisition will happen.)</span></h5>
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2 p-mb-2" tooltip='Edit' onClick={() => this.onEdit(rowData)} />
                <Button icon={rowData.statusObj?.statusName === "Active" ? "pi pi-times-circle" : "pi pi-check"} tooltip={rowData.statusObj?.statusName === "Active" ? "Mark As Inactive" : "Mark As Active"} className="p-button-rounded p-button-warning p-mr-2 p-mb-2" onClick={() => this.onDelete(rowData)} />
                <Button icon={"pi pi-briefcase"} className="p-button-rounded p-button-secondary p-mr-2 p-mb-2" tooltip='Projects' onClick={() => this.onProjectButtonClicked(rowData)} />
                <Button icon={"pi pi-sitemap"} className="p-button-rounded p-button-info p-mr-2 p-mb-2" tooltip='Departments' onClick={() => this.onDepartmentButtonClicked(rowData)} />
                <Button icon={"pi pi-users"} className="p-button-rounded p-button-secondary p-mr-2" tooltip='Suppliers' onClick={() => this.onSupplierButtonClicked(rowData)} />
            </div>
        );
    }

    onSupplierButtonClicked = (dataObj) => {
        sessionStorage.setItem(sessionKeys.companyObj, JSON.stringify(dataObj));
        this.props.history.push("/suppliers");
    }

    onProjectButtonClicked = (dataObj) => {
        sessionStorage.setItem(sessionKeys.companyObj, JSON.stringify(dataObj));
        this.props.history.push("/projects");
    }

    onDepartmentButtonClicked = (dataObj) => {
        sessionStorage.setItem(sessionKeys.companyObj, JSON.stringify(dataObj));
        this.props.history.push("/departments");
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
                <h5 className="p-m-0">Companies</h5>
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
                let dataObj = { ...this.state.dataObj }
                dataObj.logoBase64 = null;
                this.setState({ showLoader: "none", dataObj: dataObj });
                clearInterval(base64interval);
            } else {
                let dataObj = { ...this.state.dataObj }
                dataObj.logoBase64 = base64;
                this.setState({ showLoader: "none", dataObj: dataObj, doesImageChoosen: true });
                clearInterval(base64interval);
            }
        }, 500);
    }

    clearUploadedImage = (event) => {
        this.setState({ companyLogo: null })
    }

    emptyTemplate = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label={this.state.isEdit ? "Update" : "Save"} icon="pi pi-check" className="p-button-text" onClick={() => this.validateInputs()} />
            </div>
        );
    }

    imageBodyTemplate(rowData) {
        // src={`data:image/jpeg;base64,${data}`} 
        return <img src={rowData.imageURL} alt={"No Image Found"} className="product-image" />;
    }

    companyNameTemplate(rowData) {
        return (
            <div className="actions">
                <p onClick={() => this.setState({ showDetails: true, dataObj: rowData })} style={{ color: "blue", textDecorationLine: "underline", cursor: "pointer" }}>{rowData.companyName + "(" + rowData.shortCode + ")"}</p>
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
        // let logoImage = this.state.dataObj?.logoBase64;
        // this.state.dataObj?.logoBase64 = "";
        let reqObj = {
            reqObject: this.state.dataObj,
            // extraVariable: logoImage
        }
        ApiHelper2("deletecompany", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: false });
                        this.loadData(this.state.activeTabIndex);
                        this.toast.show({ severity: 'success', summary: `Status updated Successfully`, detail: `Company status Updated Successfully` });
                        break;
                    default:
                        this.setState({ dataObj: this.state.emptyDataObj, showDeleteForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to Update Company Status`, detail: data.statusDesc });
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
                            <TabPanel header="Active Companies">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} companies" emptyMessage="No companies found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="imageURL" header="Image/Logo" body={this.imageBodyTemplate.bind(this)} />
                                    <Column field="companyName" header="Company Name" sortable body={this.companyNameTemplate.bind(this)} />
                                    <Column field="companyAddress" header="Company Address" sortable />
                                    <Column field="vatNumber" header="VAT Number" sortable />
                                    <Column header="Action" body={this.actionBodyTemplate} style={{ width: '20%' }} />
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Inactive Companies">
                                <DataTable ref={ref => this.dataTable = ref} value={this.state.dataList} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} companies templates" emptyMessage="No companies found."
                                    globalFilter={this.state.globalFilter} header={this.header}>
                                    <Column field="imageURL" header="Image/Logo" body={this.imageBodyTemplate.bind(this)} />
                                    <Column field="companyName" header="Company Name" sortable />
                                    <Column field="companyAddress" header="Company Address" sortable />
                                    <Column field="vatNumber" header="VAT Number" sortable />
                                    <Column header="Action" body={this.actionBodyTemplate} style={{ width: '20%' }} />
                                </DataTable>
                            </TabPanel>
                        </TabView>

                        <Dialog visible={this.state.showDetails} style={{ width: '60%' }} header={this.state.dataObj?.companyName + "'s Details"} modal className="p-fluid" onHide={this.hideDialog}>
                            <div className="p-field p-grid">
                                <div className="p-md-6">
                                    <label htmlFor="companyName">Company Name: <b>{this.state.dataObj?.companyName}</b></label>
                                </div>
                                <div className="p-md-6">
                                    <label htmlFor="vatNumber">Vat Number: <b>{this.state.dataObj?.vatNumber}</b></label>
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6">
                                    <label htmlFor="contactPersonName">Contact Person Name: <b>{this.state.dataObj?.contactPersonName}</b></label>
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="mobileNumber">Mobile Number: <b>{this.state.dataObj?.mobileNumber}</b></label>
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="emailId">Email ID: <b>{this.state.dataObj?.emailId}</b></label>
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="shortCode">Short Code: <b>{this.state.dataObj?.shortCode}</b></label>
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="shouldBypassPurchaseDepartment">Should Bypass Purchase Department: <b>{this.state.dataObj?.shouldBypassPurchaseDepartment ? "Yes" : "No"}</b></label>
                                </div>
                            </div>
                        </Dialog>

                        <Dialog visible={this.state.showAddForm} style={{ width: '60%' }} header={(this.state.isEdit ? "Edit " : "Add ") + "Company"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
                            {!this.state.isEdit ?
                                <div className="p-field p-grid">
                                    <div className="p-md-6" style={{ flexDirection: "column" }}>
                                        <label htmlFor="logoBase64">Company Image</label>
                                        <FileUpload id="logoBase64" name="demo" auto maxFileSize="1000000" accept="image/*" uploadHandler={this.myUploader} onRemove={this.clearUploadedImage} customUpload />
                                    </div>
                                    <div className="p-md-6" style={{ flexDirection: "column" }}>
                                        <label htmlFor="companyAddress">Company Address</label>
                                        <InputTextarea id="companyAddress" rows={5} cols={30} value={this.state.dataObj?.companyAddress} onChange={(e) => this.onInputChange(e, 'companyAddress')} autoResize />
                                        {/* <InputText id="companyAddress" value={this.state.dataObj?.companyAddress} onChange={(e) => this.onInputChange(e, 'companyAddress')} autoFocus /> */}
                                    </div>
                                </div>
                                :
                                <div className="p-field p-grid">
                                    <div className="p-md-3" style={{ flexDirection: "column" }}>
                                        <img src={this.state.dataObj?.imageURL} alt={"No Image Found"} className="product-image" style={{ height: 120, width: 120 }} />
                                    </div>
                                    <div className="p-md-4" style={{ flexDirection: "column" }}>
                                        <label htmlFor="logoBase64">Company Image</label>
                                        <FileUpload id="logoBase64" name="demo" auto maxFileSize="1000000" accept="image/*" uploadHandler={this.myUploader} onRemove={this.clearUploadedImage} customUpload />
                                    </div>
                                    <div className="p-md-5" style={{ flexDirection: "column" }}>
                                        <label htmlFor="companyAddress">Company Address</label>
                                        <InputTextarea id="companyAddress" rows={5} cols={30} value={this.state.dataObj?.companyAddress} onChange={(e) => this.onInputChange(e, 'companyAddress')} autoResize />
                                        {/* <InputText id="companyAddress" value={this.state.dataObj?.companyAddress} onChange={(e) => this.onInputChange(e, 'companyAddress')} autoFocus /> */}
                                    </div>
                                </div>
                            }
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="companyName">Company Name</label>
                                    <InputText id="companyName" value={this.state.dataObj?.companyName} onChange={(e) => this.onInputChange(e, 'companyName')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="vatNumber">Vat Number</label>
                                    <InputText id="vatNumber" value={this.state.dataObj?.vatNumber} onChange={(e) => this.onInputChange(e, 'vatNumber')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="contactPersonName">Contact Person Name</label>
                                    <InputText id="contactPersonName" value={this.state.dataObj?.contactPersonName} onChange={(e) => this.onInputChange(e, 'contactPersonName')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="mobileNumber">Mobile Number</label>
                                    <InputText id="mobileNumber" value={this.state.dataObj?.mobileNumber} onChange={(e) => this.onInputChange(e, 'mobileNumber')} />
                                </div>
                            </div>
                            <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="emailId">Email ID</label>
                                    <InputText id="emailId" value={this.state.dataObj?.emailId} onChange={(e) => this.onInputChange(e, 'emailId')} />
                                </div>
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="shortCode">Short Code</label>
                                    <InputText id="shortCode" value={this.state.dataObj?.shortCode} onChange={(e) => this.onInputChange(e, 'shortCode')} />
                                </div>
                            </div>
                            {false && <div className="p-field p-grid">
                                <div className="p-md-6" style={{ flexDirection: "column" }}>
                                    <label htmlFor="shouldBypassPurchaseDepartment">Bypass Purchase Department</label>
                                    <SelectButton id="shouldBypassPurchaseDepartment" optionLabel="fieldName" optionValue="feildValue" options={this.state.fieldList} onChange={(e) => this.onSelectButtonChange(e, "shouldBypassPurchaseDepartment")} />
                                </div>
                            </div>}
                        </Dialog>

                        <Dialog visible={this.state.showDeleteForm} style={{ width: '450px' }} header="Confirm" modal footer={this.deleteDialogFooter} onHide={this.hideDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to {(this.state.dataObj?.statusObj?.statusName + "") === "Active" ? "In-Active" : "Active"} <b>{this.state.dataObj?.companyName}</b>?</span>
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(CompaniesScreen);