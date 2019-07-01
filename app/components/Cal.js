import React, {Component} from 'react';
import {StyleSheet,
  Button,
  Text,
  TouchableHighlight,
  View} from 'react-native';
import {Calendar,
  CalendarList,
  Agenda} from 'react-native-calendars';
import Modal from "react-native-modal";
import {calStyles, calTheme} from '../utils/Colors';

// Cal is the main calendar component that is central to the app
class Cal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: 'https://calendarific.com/api/v2/holidays?',
      api: '840729768871697006fe16d7b9292bdf83e0a658',
      country: 'US',
      year: '2019',
      type: 'religious',
      storedData: false,
      holidays: {},
      markers: {},
      modalVisible: false,
      curHolidays: {dots: [{key: ''}]},
      curDate: ''
    };
  }

  // Calendar-specific functions for initial rendering ---------------------
  // check if data has already been fetched and stored
  // TODO: if have persistent data storage just pull this (no fetch required)
  // TODO: if user modifies settings, rerun fetch
  checkStoredData = () => {
    return this.state.storedData
  }

  // parameters will be defined by user to narrow down holiday selection
  createWebAddress = () => {
    apiParam = ''
    countryParam = ''
    yearParam = ''
    typeParam = ''
    if (this.state.type) { apiParam = "api_key=" + this.state.api }
    if (this.state.country) { countryParam = "country=" + this.state.country }
    if (this.state.year) { yearParam = "year=" + this.state.year }
    if (this.state.type) { typeParam = "type=" + this.state.type }
    const ret = [this.state.url, apiParam, countryParam, yearParam, typeParam]
    return ret.join('&');
  }

  // Put holidays into format to pass into the Calendar component for marking dates of holidays
  createDateMarkers = () => {
    localMarkers = {}

    // Format of objects to be passed into Calendar component's 'markedDates'
    // {'date': {dots: [{key: xxx, color: xxx, description: xxx},
    // {key: yyy, color: yyy, description: yyy}]}}

    var holidaysLength = this.state.holidays.length;
    for (var i = 0; i < holidaysLength; i++) {
      holiday = this.state.holidays[i]
      markerObj = {key: holiday.name, desc: holiday. description, color: 'green'}
      if (holiday.date.iso in localMarkers) {
        // Be able to incorporate multiple holidays on same day
        localMarkers[holiday.date.iso].dots.push(markerObj)
      }
      else {
        localMarkers[holiday.date.iso] = {dots: [markerObj]}
      }
    }
    this.setState({markers: localMarkers})
  }

  // on mount pull our holiday data
  componentDidMount = () => {
    if (!this.checkStoredData()) {
      webAddress = this.createWebAddress()
     fetch(webAddress)
        .then(response => {
          return response.json();
        })
        .then(myJson => {
          this.setState({holidays: myJson.response.holidays})
          this.createDateMarkers()
      }).catch(err => {
        console.log(err) //TODO check this and add modal that shows error message
      });
    }
  }

  // Modal-specific Functions ----------------------------------------------
  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  }

  showHolidayDetails = (day) => {
    if (day['dateString'] in this.state.markers) {
      this.setModalVisible(true)
      this.setState({curDate: day['dateString']})
      this.setState({curHolidays: this.state.markers[day['dateString']]})
    }
  }

  //-------------------------------------------------------------------------

  render() {
    return (
      <View>
          <Calendar
            style = {calStyles.background}
            theme = {calTheme}
            markedDates = {this.state.markers}
            markingType = {'multi-dot'}
            onDayPress = {(day) => {
              this.showHolidayDetails(day) }}
          />
          <Modal isVisible={this.state.modalVisible}
            swipeDirection = 'down'>
            <View style={calStyles.modalContent}>
              <Text>{this.state.curDate}</Text>
              <Text>{this.state.curHolidays.dots[0].key}</Text>
              <Text>{this.state.curHolidays.dots[0].desc}</Text>
              <Button title="Close" onPress= {() =>
                {this.setModalVisible(false)}} />
            </View>
          </Modal>
        </View>
    );
  }
}

export default Cal;