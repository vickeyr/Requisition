import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom'
import AppTopbar from './AppTopbar';
import AppBreadcrumb from "./AppBreadcrumb";
import AppFooter from './AppFooter';
import AppMenu from './AppMenu';
import AppConfig from './AppConfig';
import AppRightMenu from './AppRightMenu';
import PrimeReact from 'primereact/api';
// import Dashboard from './pages/Dashboard';
import { Crud } from './pages/auth&Common/Crud';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.scss';
import UsersScreen from './pages/admin/UsersScreen';
import DashboardScreen from './pages/admin/DashboardScreen';
import CompaniesScreen from './pages/admin/CompaniesScreen';
import SuppliersScreen from './pages/admin/SuppliersScreen';
import MobileSuppliersScreen from './pages/admin/MobileSuppliersScreen';
import { sessionKeys } from './utilities/ConstantVariable';
import RequisitionScreen from './pages/admin/RequisitionScreen';
import PartiallyPaidRequisitionScreen from './pages/admin/PartiallyPaidRequisitionScreen';
import ReportsScreen from './pages/admin/ReportsScreen';
import TransferTypeScreen from './pages/admin/TransferTypeScreen';
import ProjectsScreen from './pages/admin/ProjectsScreen';
import DepartmentsScreen from './pages/admin/DepartmentScreen';
import UOMScreen from './pages/admin/UOMScreen';
// import SystemConfigScreen from './pages/admin/SystemConfigScreen';
import PayersBankDetails from './pages/admin/PayersBankDetailsScreen';
import CurrencyScreen from './pages/admin/CurrencyScreen';

export const RTLContext = React.createContext();

const App = () => {

    const [menuMode, setMenuMode] = useState('static');
    const [inlineMenuPosition, setInlineMenuPosition] = useState('bottom');
    const [desktopMenuActive, setDesktopMenuActive] = useState(true);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [activeTopbarItem, setActiveTopbarItem] = useState(null);
    const [colorMode, setColorMode] = useState('light');
    const [rightMenuActive, setRightMenuActive] = useState(false);
    const [menuActive, setMenuActive] = useState(false);
    const [inputStyle, setInputStyle] = useState('filled');
    const [isRTL, setRTL] = useState(false);
    const [ripple, setRipple] = useState(true);
    const [mobileTopbarActive, setMobileTopbarActive] = useState(false);
    const [menuTheme, setMenuTheme] = useState('light');
    const [topbarTheme, setTopbarTheme] = useState('blue');
    const [theme, setTheme] = useState('indigo');
    const [isInputBackgroundChanged, setIsInputBackgroundChanged] = useState(false);
    const [inlineMenuActive, setInlineMenuActive] = useState({});
    // const [newThemeLoaded, setNewThemeLoaded] = useState(false);
    const [searchActive, setSearchActive] = useState(false);

    let currentInlineMenuKey = useRef(null);

    // let firebaseConfig = {
    //     apiKey: "AIzaSyCrfcTvm3rNZxQvgpZ-SJRDi2Oss_llPmI",
    //     authDomain: "requisition-application-64780.firebaseapp.com",
    //     projectId: "requisition-application-64780",
    //     storageBucket: "requisition-application-64780.appspot.com",
    //     messagingSenderId: "1011394486154",
    //     appId: "1:1011394486154:web:eae8300f6b4c461126b273",
    //     measurementId: "G-PHEE571J00"
    // };

    PrimeReact.ripple = true;

    let searchClick;
    let topbarItemClick;
    let menuClick;
    let inlineMenuClick;

    const menu = [
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-star',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
                { label: 'Payer\'s Bank Details', icon: 'pi pi-fw pi-briefcase', to: '/payersbankdetails' },
                { label: 'Companies', icon: 'pi pi-fw pi-sitemap', to: '/companies' },
                { label: 'Users', icon: 'pi pi-fw pi-users', to: '/users' },
            ]
        },
        {
            label: 'Requisition',
            icon: 'pi pi-fw pi-star',
            items: [
                { label: 'Approved Requisitions', icon: 'pi pi-fw pi-paperclip', to: '/requisition' },
                { label: 'Partially Paid Requisitions', icon: 'pi pi-fw pi-paperclip', to: '/pprequisition' },
                { label: 'Reports', icon: 'pi pi-fw pi-id-card', to: '/reports' }
            ]
        },
        {
            label: 'Configuration',
            icon: 'pi pi-fw pi-star',
            items: [
                // { label: 'System Config', icon: 'pi pi-fw pi-desktop', to: '/systemconfig' },
                { label: 'Currency', icon: 'pi pi-fw pi-money-bill', to: '/currencies' },
                { label: 'Unit Of Measurement', icon: 'pi pi-fw pi-tags', to: '/uom' },//
                { label: 'Transfer Type', icon: 'pi pi-fw pi-angle-double-right', to: '/transfertype' },
            ]
        },
    ];

    const menu2 = [
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-star',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
                { label: 'Payer\'s Bank Details', icon: 'pi pi-fw pi-briefcase', to: '/payersbankdetails' },
            ]
        },
        {
            label: 'Requisition',
            icon: 'pi pi-fw pi-star',
            items: [
                { label: 'Approved Requisitions', icon: 'pi pi-fw pi-paperclip', to: '/requisition' },
                { label: 'Partially Paid Requisitions', icon: 'pi pi-fw pi-paperclip', to: '/pprequisition' },
                { label: 'Reports', icon: 'pi pi-fw pi-id-card', to: '/reports' }
            ]
        }
    ];

    const routes = [
        { parent: '', label: '' },
        { parent: 'Admin', label: 'Dashboard' },
        { parent: 'Admin', label: 'Companies' },
        { parent: 'Admin', label: 'Projects' },
        { parent: 'Admin', label: 'Transfer Type' },
        { parent: 'Admin', label: 'Supplier' },
        { parent: 'Admin', label: 'Users' },
        { parent: 'Requisition', label: 'Requisition' },
        { parent: 'Requisition', label: 'Reports' }
    ]

    useEffect(() => {
        if (menuMode === 'overlay') {
            hideOverlayMenu()
        }
        if (menuMode === 'static') {
            setDesktopMenuActive(true)
        }
    }, [menuMode])

    useEffect(() => {
        onColorModeChange(colorMode);
    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    const onMenuThemeChange = (theme) => {
        setMenuTheme(theme)
    }

    const onTopbarThemeChange = (theme) => {
        setTopbarTheme(theme);
    }

    useEffect(() => {
        const appLogoLink = document.getElementById('app-logo');

        if (topbarTheme === 'white' || topbarTheme === 'yellow' || topbarTheme === 'amber' || topbarTheme === 'orange' || topbarTheme === 'lime') {
            appLogoLink.src = 'assets/layout/images/logo-dark.svg';
        }
        else {
            // appLogoLink.src = 'assets/layout/images/logo-light.svg';
        }
    }, [topbarTheme])

    const onThemeChange = (theme) => {
        setTheme(theme);
        const themeLink = document.getElementById('theme-css');
        const themeHref = 'assets/theme/' + theme + '/theme-' + colorMode + '.css';
        replaceLink(themeLink, themeHref);
    }

    const onColorModeChange = (mode) => {
        setColorMode(mode);
        setIsInputBackgroundChanged(true);

        if (isInputBackgroundChanged) {
            if (mode === 'dark') {
                setInputStyle('filled');
            } else {
                setInputStyle('outlined')
            }
        }

        if (mode === 'dark') {
            setMenuTheme('dark');
            setTopbarTheme('dark');
        } else {
            setMenuTheme('light');
            setTopbarTheme('blue');

        }

        const layoutLink = document.getElementById('layout-css');
        const layoutHref = 'assets/layout/css/layout-' + mode + '.css';
        replaceLink(layoutLink, layoutHref);

        const themeLink = document.getElementById('theme-css');
        const urlTokens = themeLink.getAttribute('href').split('/');
        urlTokens[urlTokens.length - 1] = 'theme-' + mode + '.css';
        const newURL = urlTokens.join('/');

        replaceLink(themeLink, newURL, () => {
            // setNewThemeLoaded(true);
        });

    }

    const replaceLink = (linkElement, href, callback) => {
        if (isIE()) {
            linkElement.setAttribute('href', href);

            if (callback) {
                callback();
            }
        } else {
            const id = linkElement.getAttribute('id');
            const cloneLinkElement = linkElement.cloneNode(true);

            cloneLinkElement.setAttribute('href', href);
            cloneLinkElement.setAttribute('id', id + '-clone');

            linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

            cloneLinkElement.addEventListener('load', () => {
                linkElement.remove();
                cloneLinkElement.setAttribute('id', id);

                if (callback) {
                    callback();
                }
            });
        }
    }

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    }

    const onRipple = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    }

    const onInlineMenuPositionChange = (mode) => {
        setInlineMenuPosition(mode)
    }

    const onMenuModeChange = (mode) => {
        setMenuMode(mode);
    }

    const onRTLChange = () => {
        setRTL(prevState => !prevState);
    }

    const onMenuClick = (event) => {
        menuClick = true;
    }

    const onMenuButtonClick = (event) => {
        menuClick = true;

        if (isDesktop())
            setDesktopMenuActive((prevState) => !prevState);
        else
            setMobileMenuActive((prevState) => !prevState)

        event.preventDefault();

    }

    const onTopbarItemClick = (event) => {
        topbarItemClick = true;
        if (activeTopbarItem === event.item)
            setActiveTopbarItem(null)
        else {
            setActiveTopbarItem(event.item)
        }

        event.originalEvent.preventDefault();
    }

    const onSearch = (event) => {
        searchClick = true;
        setSearchActive(event);
    }

    const onMenuItemClick = (event) => {
        if (!event.item.items && (menuMode === 'overlay' || !isDesktop())) {
            hideOverlayMenu();
        }

        if (!event.item.items && (isHorizontal() || isSlim())) {
            setMenuActive(false)
        }
    }

    const onRootMenuItemClick = (event) => {
        setMenuActive((prevState) => !prevState);
    }

    const onRightMenuButtonClick = () => {
        setRightMenuActive((prevState) => !prevState)
    }

    const onMobileTopbarButtonClick = (event) => {
        setMobileTopbarActive((prevState) => !prevState);
        event.preventDefault();
    }

    const onDocumentClick = (event) => {
        if (!searchClick && event.target.localName !== 'input') {
            setSearchActive(false);
        }

        if (!topbarItemClick) {
            setActiveTopbarItem(null);
        }

        if (!menuClick && (menuMode === 'overlay' || !isDesktop())) {
            if (isHorizontal() || isSlim()) {
                setMenuActive(false)
            }
            hideOverlayMenu();
        }

        if (inlineMenuActive[currentInlineMenuKey.current] && !inlineMenuClick) {
            let menuKeys = { ...inlineMenuActive };
            menuKeys[currentInlineMenuKey.current] = false;
            setInlineMenuActive(menuKeys);
        }

        if (!menuClick && (isSlim() || isHorizontal())) {
            setMenuActive(false);
        }

        searchClick = false;
        topbarItemClick = false;
        inlineMenuClick = false;
        menuClick = false;
    }

    const hideOverlayMenu = () => {
        setMobileMenuActive(false)
        setDesktopMenuActive(false)
    }

    const isDesktop = () => {
        return window.innerWidth > 1024;
    }

    const isHorizontal = () => {
        return menuMode === 'horizontal';
    }

    const isSlim = () => {
        return menuMode === 'slim';
    }

    const isIE = () => {
        return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent)
    }

    // const onInlineMenuClick = (e, key) => {
    //     let menuKeys = { ...inlineMenuActive };
    //     if (key !== currentInlineMenuKey.current && currentInlineMenuKey.current) {
    //         menuKeys[currentInlineMenuKey.current] = false;
    //     }

    //     menuKeys[key] = !menuKeys[key];
    //     setInlineMenuActive(menuKeys);
    //     currentInlineMenuKey.current = key;
    //     inlineMenuClick = true;
    // }

    const layoutContainerClassName = classNames('layout-wrapper ', 'layout-menu-' + menuTheme + ' layout-topbar-' + topbarTheme, {
        'layout-menu-static': menuMode === 'static',
        'layout-menu-overlay': menuMode === 'overlay',
        'layout-menu-slim': menuMode === 'slim',
        'layout-menu-horizontal': menuMode === 'horizontal',
        'layout-menu-active': desktopMenuActive,
        'layout-menu-mobile-active': mobileMenuActive,
        'layout-topbar-mobile-active': mobileTopbarActive,
        'layout-rightmenu-active': rightMenuActive,
        'p-input-filled': inputStyle === 'filled',
        'p-ripple-disabled': !ripple,
        'layout-rtl': isRTL
    });

    return (

        <RTLContext.Provider value={isRTL}>
            <div className={layoutContainerClassName} onClick={onDocumentClick}>
                <AppTopbar horizontal={isHorizontal()}
                    activeTopbarItem={activeTopbarItem}
                    onMenuButtonClick={onMenuButtonClick}
                    onTopbarItemClick={onTopbarItemClick}
                    onRightMenuButtonClick={onRightMenuButtonClick}
                    onMobileTopbarButtonClick={onMobileTopbarButtonClick} mobileTopbarActive={mobileTopbarActive}
                    searchActive={searchActive} onSearch={onSearch} />

                <div className="menu-wrapper" onClick={onMenuClick}>
                    <div className="layout-menu-container">
                        {/* {(inlineMenuPosition === 'top' || inlineMenuPosition === 'both') && <AppInlineMenu menuKey="top" inlineMenuActive={inlineMenuActive} onInlineMenuClick={onInlineMenuClick} horizontal={isHorizontal()} menuMode={menuMode} />} */}
                        <AppMenu model={((JSON.parse(sessionStorage.getItem(sessionKeys.loginUserObj))?.roleObj?.roleName + "").toLowerCase().trim().includes("approver") || (JSON.parse(sessionStorage.getItem(sessionKeys.loginUserObj))?.roleObj?.roleName + "").toLowerCase().trim().includes("finance")) ? menu2 : ((JSON.parse(sessionStorage.getItem(sessionKeys.loginUserObj))?.roleObj?.roleName + "").toLowerCase().trim().includes("admin")) ? menu : null} onMenuItemClick={onMenuItemClick} onRootMenuItemClick={onRootMenuItemClick}
                            menuMode={menuMode} active={menuActive} />
                        {/* {(inlineMenuPosition === 'bottom' || inlineMenuPosition === 'both') && <AppInlineMenu menuKey="bottom" inlineMenuActive={inlineMenuActive} onInlineMenuClick={onInlineMenuClick} horizontal={isHorizontal()} menuMode={menuMode} />} */}
                    </div>
                </div>

                <div className="layout-main">
                    <AppBreadcrumb routes={routes} />
                    <div className="layout-content">
                        {/* admin pages starts here */}
                        <Route path="/dashboard" component={DashboardScreen} />
                        {/* <Route path="/systemconfig" component={SystemConfigScreen} /> */}
                        <Route path="/uom" component={UOMScreen} />
                        <Route path="/payersbankdetails" component={PayersBankDetails} />
                        <Route path="/currencies" component={CurrencyScreen} />
                        <Route path="/companies" component={CompaniesScreen} />
                        <Route path="/projects" component={ProjectsScreen} />
                        <Route path="/departments" component={DepartmentsScreen} />
                        <Route path="/transfertype" component={TransferTypeScreen} />
                        <Route path="/suppliers" component={SuppliersScreen} />
                        <Route path="/mobilesuppliers" component={MobileSuppliersScreen} />
                        <Route path="/users" component={UsersScreen} />
                        <Route path="/requisition" component={RequisitionScreen} />
                        <Route path="/pprequisition" component={PartiallyPaidRequisitionScreen} />
                        <Route path="/reports" component={ReportsScreen} />
                        {/* admin pages ends here */}
                        <Route path="/crud" component={Crud} />
                    </div>
                    <AppFooter colorMode={colorMode} />
                </div>
                {false &&
                    <AppConfig inputStyle={inputStyle} onInputStyleChange={onInputStyleChange}
                        rippleEffect={ripple} onRippleEffect={onRipple}
                        menuMode={menuMode} onMenuModeChange={onMenuModeChange}
                        inlineMenuPosition={inlineMenuPosition} onInlineMenuPositionChange={onInlineMenuPositionChange}
                        colorMode={colorMode} onColorModeChange={onColorModeChange}
                        menuTheme={menuTheme} onMenuThemeChange={onMenuThemeChange}
                        topbarTheme={topbarTheme} onTopbarThemeChange={onTopbarThemeChange}
                        theme={theme} onThemeChange={onThemeChange}
                        isRTL={isRTL} onRTLChange={onRTLChange} />
                }
                <AppRightMenu rightMenuActive={rightMenuActive} onRightMenuButtonClick={onRightMenuButtonClick} />

                {mobileMenuActive && <div className="layout-mask modal-in"></div>}
            </div>
        </RTLContext.Provider>
    );

}

export default App;
