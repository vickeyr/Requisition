
import React from 'react';
import { Text, View, Modal, ActivityIndicator } from 'react-native';
import { bgColorCode } from './ConstVariables';

export default class Loader extends React.Component {

    render() {
        return (
            <Modal transparent={true} visible={this.props.isVisible}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: "absolute", width: "70%", height: 50, top: "50%", alignSelf: "center", alignItems: "center", justifyContent: "space-evenly", elevation: 10, flexDirection: "row", backgroundColor: "white", borderRadius: 20 }}>
                        <ActivityIndicator size="large" color={bgColorCode} />
                        <Text style={{ fontFamily: "Calibre-Medium", fontWeight: "bold", fontSize: 16, color: "black" }}>Please Wait.....</Text>
                    </View>
                </View>
            </Modal>
        );
    }
}
