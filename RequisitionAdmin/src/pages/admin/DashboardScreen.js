import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { withRouter } from 'react-router-dom';
import { sessionKeys } from '../../utilities/ConstantVariable';

class DashboardScreen extends React.Component {

    state = {
        showLoader: "none",
        dataList: [],
    }

    constructor(props) {
        super(props);
        let authToken = sessionStorage.getItem(sessionKeys.authToken);
        if (undefined !== authToken && null !== authToken && authToken.length > 0) {
        } else {
            this.props.history.push("/");
        }
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <h5>Reports <span style={{ fontSize: 11 }}>(Search requisition form as per below criterias.)</span></h5>
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
            </div>
        );
    }

    header = () => {
        return (
            <div className="table-header">
                <h5 className="p-m-0">Email Template</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
                </span>
            </div>
        );
    }

    render() {
        return (
            <div>            </div>
        );
    }
}

export default withRouter(DashboardScreen);