import React, {Component, PureComponent} from 'react'
import {
  AsyncStorage,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View} from 'react-native'
import {Button, CheckBox, ThemeProvider} from 'react-native-elements'
import CustomMultiPicker from "react-native-multiple-select-list"
import {Ionicons} from '@expo/vector-icons'
import ModalWrapper from 'react-native-modal-wrapper'
import DateTimePicker from "react-native-modal-datetime-picker"

import Selection from './Selection'
import {_storeData, _retrieveData, _deleteData} from '../utils/AsyncData'
import {countryOptions} from '../utils/Options'
import {selStyles, buttonColor, menuStyles} from '../utils/Styles'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes'
import {HasPermissions, GetHolidayData} from '../utils/DataFunctions'


class Menu extends React.Component {
   constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
    }
  }

  // Modal-specific methods ------------------------------------------------
  setVisible = (visible) => {
    this.setState({isVisible: visible})
  }

  openModal = async () => {
    //await this.setState({selectedCountries: this.props.selectedCountries})
    this.setVisible(true)
  }

  exitModal = async () => {
    this.setVisible(false)
    this.saveSelected()
    //await this.props.getHolidayData(this.state.selectedCountries, false)
  }

  // ----------------------------------------------------------------------

  // -----------------------------------------------------------------------

  render() {
    return (
      <View>
        <View>
          <TouchableOpacity
            onPress = {() => {
            this.openModal() }}>
            <Ionicons name = "ios-menu" size = {44} color = {buttonColor} />
          </TouchableOpacity>
        </View>
        <ModalWrapper style = {menuStyles.container}
          containerStyle={{ flexDirection: 'row', justifyContent: 'flex-end' }}
          onRequestClose={() => this.setState({ isVisible: false })}
          position="left"
          visible={this.state.isVisible}>
          <View style = {menuStyles.menu}>
            <Selection selectedCountries = {this.props.selectedCountries}
              getHolidayData = {(selectedCountries, firstLaunch) => {
            this.props.getHolidayData(selectedCountries, firstLaunch) }} />
            <TouchableOpacity>
              <Text>{"Set Notification Time"}</Text>
            </TouchableOpacity>
          </View>
        </ModalWrapper>
      </View>
    );
  }
}

export default Menu;