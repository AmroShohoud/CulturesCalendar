import React, {Component, PureComponent} from 'react'
import {
  AsyncStorage,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
StyleSheet} from 'react-native'
import {Button, CheckBox, ThemeProvider} from 'react-native-elements'
import CustomMultiPicker from "react-native-multiple-select-list"
import {Ionicons} from '@expo/vector-icons'
import ModalWrapper from 'react-native-modal-wrapper'
import DateTimePicker from "react-native-modal-datetime-picker"

import {_storeData, _retrieveData} from '../utils/AsyncData'
import {countryOptions} from '../utils/Options'
import {menuStyles, selStyles, buttonColor} from '../utils/Styles'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes'
import {GetHolidayData, dateToUTC, ScheduleAllNotifications} from '../utils/DataFunctions'


class Menu extends React.Component {
   constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      isTimeVisible: false,
      selectedCountries: {}
    }
  }

  componentDidMount = async () => {
    await this.getSavedTime()
  }

  // Modal-specific methods ------------------------------------------------
  setVisible = (visible) => {
    this.setState({isVisible: visible})
  }

  openModal = async () => {
    // Set selectedCountries as a copy of the selectedCountries object from Main component
    await this.setState({selectedCountries: JSON.parse(JSON.stringify(this.props.selectedCountries))})
    this.setVisible(true)
  }

  exitModal = async () => {
    this.setVisible(false)
  }

  // -----------------------------------------------------------------------

  // TimePicker specific functions------------------------------------------

  getSavedTime = () => {
    var notifTime = this.props.notifTime
    if (notifTime == null) {
      notifTime = 'T00:00'
    }
    else {
      notifTime = notifTime
    }
    var dateUTC = dateToUTC('2018-12-31', notifTime)
    return dateUTC
  }

  showTimePicker = async () => {
    await this.getSavedTime()
    this.setState({isTimeVisible: true})
  }

  cancelTimePicker = () => {
    this.setState({isTimeVisible: false})
  }

  scheduleNotifications = async (timeStr) => {
    // Schedule our next 50 notifications
    this.props.scheduleNotifications(timeStr)
  }

  // Store the time in AsyncStorage, schedule all notifications with new time, and close the modal
  confirmTimePicker = (time) => {
    var hours = time.getHours()
    var minutes = time.getMinutes()
    var timeStr = 'T'
    if (hours < 10) { timeStr += '0' }
    timeStr = timeStr + hours + ':'
    if (minutes < 10) { timeStr += '0' }
    timeStr += minutes
    _storeData('notifTime', JSON.stringify({'time':timeStr}))
    this.scheduleNotifications(timeStr)
    this.props.setNotifTime(timeStr)
    this.setState({isTimeVisible: false})
  }

  // -----------------------------------------------------------------------

  // Selection Processing methods ------------------------------------------
  isSelectedCountry = (country) => {
    if (country in this.state.selectedCountries) {
      return true
    }
    return false
  }

  isSelectedType = (country, type) => {
    if (this.isSelectedCountry(country) && this.state.selectedCountries[country].includes(type)) {
        return true
    }
    return false
  }
  // executed every time a country checkbox is clicked on
  setSelectedCountry = async (country, types = ['all']) => {
    var localSelected = this.state.selectedCountries
    // Country is not checked, check it and associated type checkboxes
    if (!this.isSelectedCountry(country)) {
      localSelected[country] = types
    }
    // Country is checked, uncheck it along with associated type checkboxes
    else {
      delete localSelected[country]
    }
    await this.setState({selectedCountries: localSelected})
  }

  // executed every time a type checkbox is clicked on
  setSelectedType = async (country, type) => {
    var localSelected = this.state.selectedCountries
    // Type checkbox is unchecked
    if (!this.isSelectedCountry(country)) {
      localSelected[country] = [type]
    }
    else if (!this.isSelectedType(country, type)) {
      localSelected[country].push(type)
    }
    // Type checkbox is checked, uncheck it and possibly uncheck country
    else {
      var filteredArr = localSelected[country].filter(function(e) { return e !== type })
      localSelected[country] = filteredArr
      // if no other types checked, uncheck country
      if (filteredArr.length == 0) {
        delete localSelected[country]
      }
    }
    await this.setState({selectedCountries: localSelected})
  }

  clearSelected = async () => {
    await this.setState({selectedCountries: {}})
  }

  saveSelected = async () => {
    this.exitModal()
    await this.props.setSelectedCountriesTemp(this.state.selectedCountries)
    await this.props.getHolidaysAndStoreData(this.state.selectedCountries)
  }

  // -----------------------------------------------------------------------

  // For scrolling ---------------------------------------------------------
  handleOnScroll = (event) => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    })
  }

  handleScrollTo = (p) => {
    if (this.scrollViewRef) {
      this.scrollViewRef.scrollTo(p);
    }
  }
  // -----------------------------------------------------------------------

  // For rendering country list---------------------------------------------
  // type list under countries where type of holiday selection is allowed
  buildTypeList = (countryInfo) => {
    types = ['religious', 'observance', 'national']
    return types.map((type, i) => {
      return (
        <CheckBox key = {countryInfo.name.concat(type)}
          checkedColor = {buttonColor}
          containerStyle = {selStyles.typeCheckboxes}
          title={type}
          checked={this.isSelectedType(countryInfo.code, type)}
          onPress = {() => {
            this.setSelectedType(countryInfo.code, type)
          }}
          onIconPress = {() => {
            this.setSelectedType(countryInfo.code, type)
          }}
        />
      )
    })
  }
  // the country list for user selection
  buildCountryList = (countryInfo) => {
    if (countryInfo.code == 'US' ||
      countryInfo.code == 'GB' ||
      countryInfo.code == 'CA' ||
      countryInfo.code == 'AU') {
      return (
        <View key = {countryInfo.code}>
          <CheckBox key = {countryInfo.name}
            containerStyle = {selStyles.countryCheckboxes}
            checkedColor = {buttonColor}
            title={countryInfo.name}
            checked={this.isSelectedCountry(countryInfo.code)}
            onPress = {() => {
              this.setSelectedCountry(countryInfo.code, ['religious', 'national', 'observance'])
            }}
            onIconPress = {() => {
              this.setSelectedCountry(countryInfo.code, ['religious', 'national', 'observance'])

            }}
          />
          {this.buildTypeList(countryInfo)}
        </View>
      )
    }
    else {
      return (
        <View key = {countryInfo.code}>
          <CheckBox key = {countryInfo.name}
            containerStyle = {selStyles.countryCheckboxes}
            checkedColor = {buttonColor}
            title={countryInfo.name}
            checked={this.isSelectedCountry(countryInfo.code)}
            onPress = {() => {
              this.setSelectedCountry(countryInfo.code)
            }}
            onIconPress = {() => {
              this.setSelectedCountry(countryInfo.code)
            }}
          />
        </View>
      )
    }
  }
  // -----------------------------------------------------------------------

  render() {
    return (
      <View>
        <View>
          <TouchableOpacity style = {{paddingTop: 5}}
            onPress = {() => {
            this.openModal() }}>
            <Ionicons name = "ios-menu" size = {40} color = {buttonColor} />
          </TouchableOpacity>
        </View>
        <ModalWrapper style = {menuStyles.container}
          onRequestClose={() => this.exitModal()}
          shouldAnimateOnRequestClose={true}
          position="left"
          visible={this.state.isVisible}>
          <DateTimePicker
              cancelTextStyle = {{color: buttonColor}}
              confirmTextStyle = {{color: buttonColor}}
              confirmTextIOS = 'Save'
              titleIOS = 'Select a Time'
              mode = "time"
              date = {this.getSavedTime()}
              isVisible = {this.state.isTimeVisible}
              onConfirm = {(time) => {this.confirmTimePicker(time)}}
              onCancel =  {this.cancelTimePicker}
          />
          <View style = {{height: '5%'}}>
          <Text>{" "}</Text>
          </View>
          <View style = {[{height: '7%'}, menuStyles.notifButtonView]}>
            <TouchableHighlight
              underlayColor = 'lightgrey'
              style={menuStyles.notifButton}
              onPress= {() => {this.showTimePicker()}}>
              <Text style = {menuStyles.notifText}> Set Notification Time </Text>
            </TouchableHighlight>
          </View>
          <View style = {{height: '78%'}}>
            <FlatList data = {countryOptions}
              extraData = {this.state}
              initialNumToRender={20}
              renderItem = {(feedItem) => {
                return(this.buildCountryList(feedItem.item)) }}
              keyExtractor={(item, index) => index.toString()} />
          </View>
          <View style = {{height: '10%'}}>
            <View style={selStyles.buttonsView}>
              <View style={{flex:1}}>
                <Button titleStyle = {selStyles.clearButtonTitle}
                  buttonStyle={selStyles.clearButtonStyle}
                  raised = {true}
                  title="Clear"
                  type = "outline"
                  onPress= {() => {
                    this.clearSelected()}} />
              </View>
              <Text>{" "}</Text>
              <View style={{flex:1}}>
                <Button buttonStyle={selStyles.buttonStyle}
                  raised = {true}
                  title="Save"
                  onPress= {() => {
                    this.saveSelected()}} />
              </View>
            </View>
          </View>
        </ModalWrapper>
      </View>
    );
  }
}


export default Menu;