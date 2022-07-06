import React from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { withRouter } from 'react-router-dom';
import { ApiHelper2, sessionKeys } from '../../utilities/ConstantVariable';

class UOMScreen extends React.Component {

    state = {
        showLoader: "flex",
        dataObj: {
            id: null,
            pathPrefix: "",
            fileUrlPrefix: "",
        },
        isEdit: false,
        globalFilter: null,
    }

    constructor(props) {
        super(props);
        let authToken = sessionStorage.getItem(sessionKeys.authToken);
        if (undefined !== authToken && null !== authToken && authToken.length > 0) {
            this.loadData();
        } else {
            this.props.history.push("/");
        }
    }

    loadData = async () => {
        let reqObj = {
            // extraVariable: (index === 0) ? "Active" : "InActive"
        };
        ApiHelper2("getsystemconfig", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data && undefined !== data.respObject && null !== data.respObject) {
                if (undefined !== data.respObject?.pathPrefix && null !== data.respObject?.pathPrefix
                    && undefined !== data.respObject?.fileUrlPrefix && null !== data.respObject?.fileUrlPrefix) {
                    this.setState({ dataObj: data.respObject, isEdit: true, showLoader: "none" });
                } else {
                    this.setState({ dataObj: data.respObject, isEdit: false, showLoader: "none" });
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

    validateInputs() {
        if (this.validateFeild(this.state.dataObj.pathPrefix)) {
            if (this.validateFeild(this.state.dataObj.fileUrlPrefix)) {
                this.saveOrUpdateObject(this.state.dataObj);
            } else {
                this.toast.show({ severity: 'error', summary: 'Enter File URL', detail: '' });
            }
        } else {
            this.toast.show({ severity: 'error', summary: 'Enter File Path', detail: '' });
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
        ApiHelper2(this.state.isEdit ? "createsystemconfig" : "createsystemconfig", reqObj, "POST", false, false, false, false).then(data => {
            if (undefined !== data && null !== data) {
                switch (data.statusCode) {
                    case 0:
                        this.loadData();
                        this.toast.show({ severity: 'success', summary: `${this.state.isEdit ? "Updated" : "Saved"} Successfully`, detail: `System Config ${this.state.isEdit ? "Updated" : "Saved"} Successfully` });
                        break;
                    case 4:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} System Config`, detail: "Duplicate Name" });
                        break;
                    default:
                        this.setState({ showAddForm: true, showLoader: "none" });
                        this.toast.show({ severity: 'error', summary: `Failed to ${this.state.isEdit ? "Update" : "Save"} System Config`, detail: data.statusDesc });
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

    onInputChange = (e, key) => {
        let val = (e.target && e.target.value) || '';
        let dataObj = { ...this.state.dataObj };
        dataObj[`${key}`] = val;
        this.setState({ dataObj: dataObj });
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>System Config <span style={{ fontSize: 11 }}>(Define System Config Fields, where requisition (or) LPO pdf/images/attachments will get stored.)</span></h5>
            </React.Fragment>
        )
    }

    header = () => {
        return (
            <div className="table-header">
                <h5 className="p-m-0">System Config</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
                </span>
            </div>
        );
    }

    render() {
        return (
            <div>
                <Toast ref={ref => this.toast = ref} />
                <div class="splash-screen" style={{ position: "absolute", top: 0, left: 0, zIndex: 10,  display: this.state.showLoader, backgroundColor: "rgba(255, 87, 34, 0.2)" }}>
                    <div class="splash-loader-container">
                        <svg class="splash-loader" width="65px" height="65px" viewBox="0 0 66 66"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle class="splash-path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" />
                        </svg>
                    </div>
                </div>

                <div className="p-grid crud-demo">
                    <div className="p-col-8">
                        <div className="card">
                            <Toolbar className="p-mb-4 p-toolbar" left={this.leftToolbarTemplate} right={this.rightToolbarTemplate}></Toolbar>
                            <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                <label htmlFor="name" style={{ marginBottom: 10 }}>File Path</label>
                                <InputText id="name" value={this.state.dataObj.pathPrefix} onChange={(e) => this.onInputChange(e, 'pathPrefix')} />
                            </div>
                            <div className="p-md-6" style={{ display: "flex", flexDirection: "column" }}>
                                <label htmlFor="name" style={{ marginBottom: 10 }}>File URL</label>
                                <InputText id="name" value={this.state.dataObj.fileUrlPrefix} onChange={(e) => this.onInputChange(e, 'fileUrlPrefix')} />
                            </div>
                            <div className="p-md-12" style={{ flexDirection: "column", display: "flex", }}>
                                <Button label={this.state.isEdit ? "Update" : "Save"} icon="pi pi-check" className="p-button-text" onClick={() => this.validateInputs()} style={{ alignSelf: "flex-end" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(UOMScreen);