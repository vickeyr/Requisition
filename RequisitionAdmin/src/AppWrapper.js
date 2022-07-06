import React, { useEffect } from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import App from "./App";
import LoginScreen from './pages/auth&Common/LoginScreen';
import NotFoundScreen from './pages/auth&Common/NotFoundScreen';
import NotAuthorisedScreen from './pages/auth&Common/NotAuthorisedScreen';
import { sessionKeys } from './utilities/ConstantVariable';

const AppWrapper = (props) => {
	let location = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [location]);

	switch (props.location.pathname) {
		case "/":
			return <LoginScreen />
		default:
			let menu = [
				{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
				// { label: 'System Config', icon: 'pi pi-fw pi-id-card', to: '/systemconfig' },
				{ label: 'Unit Of Measurement', icon: 'pi pi-fw pi-id-card', to: '/uom' },
				{ label: 'Payer\'s Bank Details', icon: 'pi pi-fw pi-id-card', to: '/payersbankdetails' },
				{ label: 'Currency', icon: 'pi pi-fw pi-id-card', to: '/currencies' },
				{ label: 'Companies', icon: 'pi pi-fw pi-id-card', to: '/companies' },
				{ label: 'Projects', icon: 'pi pi-fw pi-id-card', to: '/projects' },
				{ label: 'Departments', icon: 'pi pi-fw pi-id-card', to: '/departments' },
				{ label: 'Transfer Type', icon: 'pi pi-fw pi-id-card', to: '/transfertype' },
				{ label: 'Supplier', icon: 'pi pi-fw pi-bookmark', to: '/suppliers' },
				{ label: 'Mobile Supplier', icon: 'pi pi-fw pi-bookmark', to: '/mobilesuppliers' },
				{ label: 'Users', icon: 'pi pi-fw pi-mobile', className: 'rotated-icon', to: '/users' },
				{ label: 'Requisition', icon: 'pi pi-fw pi-id-card', to: '/requisition' },
				{ label: 'Partially Paid Requisition', icon: 'pi pi-fw pi-id-card', to: '/pprequisition' },
				{ label: 'Reports', icon: 'pi pi-fw pi-id-card', to: '/reports' }
			];
			let doesExist = false;
			for (let i = 0; i < menu.length; i++) {
				if (menu[i].to === props.location.pathname) {
					doesExist = true;
					break;
				} else {
					doesExist = false;
				}
			}
			if (doesExist) {
				let doesAuthorize = false;
				if ((props.location.pathname + "").includes('mobilesuppliers')) {
					doesAuthorize = true;
				} else {
					let loginUserObj = JSON.parse(sessionStorage.getItem(sessionKeys.loginUserObj));
					if (loginUserObj?.roleObj?.roleName.toLowerCase().trim().includes("finance")) {
						if (props.location.pathname === "/dashboard"
							|| props.location.pathname === "/payersbankdetails"
							|| props.location.pathname === "/requisition"
							|| props.location.pathname === "/pprequisition"
							|| props.location.pathname === "/reports") {
							doesAuthorize = true;
						} else {
							doesAuthorize = false;
						}
					} else if (loginUserObj?.roleObj?.roleName === "Super Admin") {
						doesAuthorize = true;
					} else if (loginUserObj?.roleObj?.roleName === "Requisition User") {
						doesAuthorize = false;
						sessionStorage.clear();
						props.history.push("/");
					} else {
						doesAuthorize = false;
						sessionStorage.clear();
						props.history.push("/");
					}
				}
				if (doesAuthorize) {
					return <App />;
				} else {
					return <NotAuthorisedScreen />;
				}
			} else {
				return <NotFoundScreen />
			}
	}

}
export default withRouter(AppWrapper);