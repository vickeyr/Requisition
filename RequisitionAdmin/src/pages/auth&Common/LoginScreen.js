import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import { ApiHelper2, isLocal, sessionKeys } from '../../utilities/ConstantVariable';
import { Dialog } from 'primereact/dialog';



class LoginScreen extends React.Component {

	state = {
		email: "",
		password: "",
		showLoader: "none",
		data: null,
		showPasswordForm: false,
		newPassword: ""
	}

	constructor(props) {
		super(props);
		let authToken = sessionStorage.getItem(sessionKeys.authToken);
		if (undefined !== authToken && null !== authToken && authToken.length > 0) {
			this.props.history.push("/dashboard");
		}
	}

	componentDidMount() { }

	validateInputs() {
		const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if (this.state.email !== '' && re.test(this.state.email)) {
			// const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
			// if (password !== '' && re.test(password)) {
			if (undefined !== this.state.password && null !== this.state.password && this.state.password !== '' && this.state.password.length >= 6) {
				this.setState({ showLoader: "flex" });
				this.validatelogin();
			} else {
				this.toast.show({ severity: 'error', summary: 'Invaild Password', detail: 'Password Should be min 6 characters long' });
			}
		} else {
			this.toast.show({ severity: 'error', summary: 'Invaild Email', detail: 'Enter Valid Email ID' });
		}
	}

	validatelogin() {
		let reqObj = {
			reqObject: {
				username: this.state.email,
				password: this.state.password,
				deviceToken: sessionStorage.getItem(sessionKeys.deviceToken)
			},
			extraVariable: "Web"
		}
		ApiHelper2("validatelogin", reqObj, "POST", false, false, false, false).then(data => {
			if (undefined !== data && null !== data
				&& undefined !== data.authToken && null !== data.authToken
				&& undefined !== data.respObject && null !== data.respObject
				&& undefined !== data.respList && null !== data.respList) {
				let doesAuthorize = false;
				if (data.respObject?.roleObj?.roleName.toLowerCase().trim().includes("finance") || data.respObject?.roleObj?.roleName.toLowerCase().trim().includes("approver")) {
					doesAuthorize = true;
				} else if (data.respObject?.roleObj?.roleName === "Super Admin") {
					doesAuthorize = true;
				} else if (data.respObject?.roleObj?.roleName === "Requisition User") {
					doesAuthorize = false;
				} else {
					doesAuthorize = false;
				}
				if (doesAuthorize) {
					switch (data.statusCode) {
						case 0:
							this.commonMethod(data);
							break;
						case 150:
							this.setState({ showLoader: "none", data: data, showPasswordForm: true })
							break;
						default:
							this.setState({ showLoader: "none" });
							this.toast.show({ severity: 'error', summary: data.statusDesc, detail: "" });
							break;
					}
				} else {
					this.setState({ showLoader: "none" });
					this.toast.show({ severity: 'warning', summary: `Restricted`, detail: `You re not authorized to login into this panel` });
				}
			} else {
				this.setState({ showLoader: "none" });
				this.toast.show({ severity: 'error', summary: 'Login Failed', detail: 'Username or password is invalid.' });
			}
		}).catch(reason => {
			this.setState({ showLoader: "none" });
			console.error("Error ---> " + reason)
		});
	}

	validatePasswordFormInputs() {
		if (undefined !== this.state.newPassword && null !== this.state.newPassword && this.state.newPassword !== '' && this.state.newPassword.length >= 6) {
			this.setState({ showLoader: "flex" });
			let userObj = this.state.data.respObject;
			userObj["password"] = this.state.newPassword;
			this.setState({ showPasswordForm: false })
			this.updatePassword(userObj);
		} else {
			this.toast.show({ severity: 'error', summary: 'Invaild Password', detail: 'Password Should be min 6 characters long' });
		}
	}

	updatePassword(userObj) {
		let reqObj = {
			reqObject: userObj
		}
		sessionStorage.setItem(sessionKeys.authToken, this.state.data.authToken);
		sessionStorage.setItem(sessionKeys.loginUserId, this.state.data.respObject.mobileNumber)
		ApiHelper2("updateuserpassword", reqObj, "POST", false, false, false, false).then(data => {
			if (undefined !== data && null !== data) {
				switch (data.statusCode) {
					case 0:
						this.commonMethod(this.state.data);
						break;
					default:
						this.setState({ showLoader: "none" });
						this.toast.show({ severity: 'error', summary: data.statusDesc, detail: "" });
						break;
				}
			} else {
				this.setState({ showLoader: "none" });
				this.toast.show({ severity: 'error', summary: 'Upadte Password Failed', detail: 'Please try again later.' });
			}
		}).catch(reason => {
			this.setState({ showLoader: "none" });
			console.error("Error ---> " + reason)
		});
	}

	commonMethod(data) {
		if (undefined !== data.authToken && null !== data.authToken
			&& undefined !== data.respObject && null !== data.respObject) {
			sessionStorage.setItem(sessionKeys.authToken, data.authToken);
			sessionStorage.setItem(sessionKeys.loginUserId, data.respObject.mobileNumber);
			sessionStorage.setItem(sessionKeys.loginUserObj, JSON.stringify(data.respObject));
			sessionStorage.setItem(sessionKeys.loginUserRoleList, JSON.stringify(data.respList));
			this.toast.show({ severity: 'success', summary: "Login Success", detail: "" });
			this.setState({ showLoader: "none" });
			this.props.history.push("/dashboard");
		} else {
			this.setState({ showLoader: "none" });
			this.toast.show({ severity: 'error', summary: 'Something went wrong', detail: 'Please try after sometime.' });
		}
	}

	changeCredintials = (role) => {
		if (isLocal) {
			switch (role) {
				case "Super":
					this.setState({ email: "mgd33359@gmail.com", password: "Dastagir@123" });
					break;
				case "Approver":
					this.setState({ email: "accts05@kecc.me", password: "12345678" });
					break;
				case "Requ":
					this.setState({ email: "shaukat@telenutrition.com", password: "39980414" });
					break;
				default:
					this.setState({ email: "", password: "" });
					break;
			}
		} else {

		}
	}

	objectDialogFooter = () => {
		return (
			<div>
				<Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
				<Button label={"Submit"} icon="pi pi-check" className="p-button-text" onClick={() => this.validatePasswordFormInputs()} />
			</div>
		);
	}

	hideDialog = () => {
		this.setState({ showPasswordForm: false });
	}

	render() {
		return (
			<div className="pages-body login-page p-d-flex p-flex-column" >
				<Toast ref={ref => this.toast = ref} />
				<div class="splash-screen" style={{ position: "absolute", top: 0, left: 0, zIndex: 10, display: this.state.showLoader, backgroundColor: "rgba(255, 87, 34, 0.2)" }}>
					<div class="splash-loader-container">
						<svg class="splash-loader" width="65px" height="65px" viewBox="0 0 66 66"
							xmlns="http://www.w3.org/2000/svg">
							<circle class="splash-path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" />
						</svg>
					</div>
				</div>
				<div className="p-as-center p-mt-auto p-mb-auto">
					<div className="pages-panel card p-d-flex p-flex-column">
						<div className="pages-header p-px-3 p-py-1" onClick={() => this.changeCredintials("Super")}>
							<h2>LOGIN</h2>
						</div>
						<h4 onClick={() => this.changeCredintials("Requ")}>Welcome</h4>
						<div className="pages-detail p-mb-6 p-px-6" onClick={() => this.changeCredintials("Approver")}>Please use the form to sign-in Requisition Admin</div>
						<div className="input-panel p-d-flex p-flex-column p-px-3 p-mb-6">
							<div className="p-inputgroup">
								<span className="p-inputgroup-addon">
									<i className="pi pi-envelope"></i>
								</span>
								<span className="p-float-label">
									<InputText type="text" id="inputgroup1" value={this.state.email} onChange={(e) => this.setState({ email: e.target.value })} />
									<label htmlFor="inputgroup1">Email</label>
								</span>
							</div>
							<div className="p-inputgroup p-mt-3">
								<span className="p-inputgroup-addon">
									<i className="pi pi-lock"></i>
								</span>
								<span className="p-float-label">
									<InputText type="password" id="inputgroup2" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} />
									<label htmlFor="inputgroup2">Password</label>
								</span>
							</div>
						</div>
						<Button className="login-button p-mb-6 p-px-3" onClick={() => this.validateInputs()} label="LOGIN" />
					</div>

					<Dialog visible={this.state.showPasswordForm} style={{ width: '60%' }} header={"Set Your Password"} modal className="p-fluid" footer={this.objectDialogFooter} onHide={this.hideDialog}>
						<div className="p-field p-grid">
							<div className="p-inputgroup p-mt-3">
								<span className="p-inputgroup-addon">
									<i className="pi pi-lock"></i>
								</span>
								<span className="p-float-label">
									<InputText type="password" id="inputgroup2" value={this.state.newPassword} onChange={(e) => this.setState({ newPassword: e.target.value })} />
									<label htmlFor="inputgroup2">Password</label>
								</span>
							</div>
						</div>
					</Dialog>
				</div>
			</div>
		);
	}
}

export default withRouter(LoginScreen);
