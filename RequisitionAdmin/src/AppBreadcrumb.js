import React from 'react';
import { Button } from 'primereact/button'
import { BreadCrumb } from 'primereact/breadcrumb';
import { useLocation, withRouter } from 'react-router-dom';
import { sessionKeys } from './utilities/ConstantVariable';
import { Dropdown } from 'primereact/dropdown';

const AppBreadcrumb = (props) => {

    const location = useLocation()
    const pathname = location.pathname === '/' ? ['', ''] : location.pathname.split('/').slice(1);

    const activeRoute = props.routes.filter((route) => {
        return route.parent.replace(/\s/g, '').toLowerCase() === pathname[0] && route.label.replace(/\s/g, '').toLowerCase() === pathname[1];
    })

    let model;

    if (!activeRoute.length) {
        model = [{ label: '' }];
    } else {
        model = activeRoute[0].parent === '' && activeRoute[0].label === '' ? [{ label: 'Dashboard' }] : [{ label: activeRoute[0].parent }, { label: activeRoute[0].label }]
    }

    const home = { icon: 'pi pi-home', url: '/#/dashboard' }
    return (
        <div className="layout-breadcrumb-container p-d-flex p-jc-between p-ai-center p-shadow-1">
            <BreadCrumb model={model} home={home} className="layout-breadcrumb p-pl-4 p-py-2" />
            <div className="layout-breadcrumb-buttons p-d-flex p-ai-center p-pr-3">
                {/* <Button type="button" icon="pi pi-cloud-upload" className="p-button p-button-rounded p-button-text p-button-plain p-mr-1"></Button> */}
                {/* <Button type="button" icon="pi pi-bookmark" className="p-button p-button-rounded p-button-text p-button-plain p-mr-1"></Button> */}
                {JSON.parse(sessionStorage.getItem(sessionKeys.loginUserRoleList))?.length > 1 ?
                    <div>
                        <span style={{ marginRight: 10 }}><b>Change Role</b></span>
                        <Dropdown value={JSON.parse(sessionStorage.getItem(sessionKeys.loginUserObj))?.roleObj} options={JSON.parse(sessionStorage.getItem(sessionKeys.loginUserRoleList))} optionLabel="roleName"
                            onChange={(e) => {
                                let lgnUsrObj = sessionStorage.getItem(sessionKeys.loginUserObj);
                                let lgnUsrObjParsed = JSON.parse(lgnUsrObj);
                                if (undefined !== lgnUsrObjParsed && null !== lgnUsrObjParsed) {
                                    lgnUsrObjParsed.roleObj = e.value;
                                    sessionStorage.setItem(sessionKeys.loginUserObj, JSON.stringify(lgnUsrObjParsed));
                                    window.location.reload();
                                }
                            }} placeholder="Select a Role" />
                    </div> : null}
                <Button type="button" onClick={() => { sessionStorage.clear(); props.history.push("/"); }} icon="pi pi-power-off" className="p-button p-button-rounded p-button-text p-button-plain p-mr-1"></Button>
            </div>
        </div>
    );

}

export default withRouter(AppBreadcrumb);
