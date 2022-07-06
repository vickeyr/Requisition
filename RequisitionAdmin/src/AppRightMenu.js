import React, { useContext } from 'react';
import classNames from 'classnames';
import { Sidebar } from 'primereact/sidebar';
import { RTLContext } from './App';

const AppRightMenu = (props) => {

    const isRTL = useContext(RTLContext);

    return <Sidebar appendTo="self" visible={props.rightMenuActive} onHide={props.onRightMenuButtonClick} position={isRTL ? 'left' : 'right'} blockScroll={true} showCloseIcon={false} baseZIndex={1000} className={classNames('layout-rightmenu p-sidebar-sm fs-small p-py-3', isRTL ? 'p-pl-0 p-pr-3' : 'p-pl-3 p-pr-0')}></Sidebar>

}

export default AppRightMenu;
