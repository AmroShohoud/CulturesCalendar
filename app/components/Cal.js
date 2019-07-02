import React, {Component} from 'react';
import {AsyncStorage,
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
      modalVisible: false,
      markers: {},
      curHolidays: {dots: [{key: ''}]},
      curDate: ''
    };
  }

  // Calendar-specific functions for initial rendering ---------------------

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
  createDateMarkers = (holidays) => {
    localMarkers = {}

    // Format of objects to be passed into Calendar component's 'markedDates'
    // {'date': {dots: [{key: xxx, color: xxx, description: xxx},
    // {key: yyy, color: yyy, description: yyy}]}}

    var holidaysLength = holidays.length;
    for (var i = 0; i < holidaysLength; i++) {
      holiday = holidays[i]
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
    this._storeData(JSON.stringify(localMarkers))
  }

  // on mount pull our holiday data
  componentDidMount = async () => {
    // see if data is already stored on device
    await this._retrieveData()

    // if not, pull the data using Calendarific API
    if (Object.keys(this.state.markers).length == 0) {
      webAddress = this.createWebAddress()
      fetch(webAddress)
        .then(response => {
          return response.json();
        })
        .then(myJson => {
          this.createDateMarkers(myJson.response.holidays)
      }).catch(err => {
        console.log(err) //TODO check this and add modal that shows error message
      });
    }
  }
  // -----------------------------------------------------------------------

  // AsyncStorage ----------------------------------------------------------

  // TODO: if user modifies settings, rerun fetch
  _storeData = async (input) => {
    try {
      await AsyncStorage.setItem('markers', input);
    } catch (error) {
      console.log(error)
    }
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('markers');
      this.setState({markers: JSON.parse(value)})
    } catch (error) {
      // Error retrieving data
      console.log(error)
    }
  }
  // -----------------------------------------------------------------------

  // Modal-specific Functions ----------------------------------------------
  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  }

  // Activate the modal and prepare the holiday data to be rendered
  showHolidayDetails = (day) => {
    if (day['dateString'] in this.state.markers) {
      this.setModalVisible(true)
      this.setState({curDate: day['dateString']})
      this.setState({curHolidays: this.state.markers[day['dateString']]})
    }
  }

  // Render holidays in the modal
  renderHolidays = () => {
    return this.state.curHolidays.dots.map((holidayInfo, i) => {
      return (
        <View key = {i}>
          <Text>{holidayInfo.key}</Text>
          <Text>{holidayInfo.desc}</Text>
          <Text></Text>
        </View>
      );
    });
  }

  //------------------------------------------------------------------------

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
              { this.renderHolidays() }
              <Button title="Close" onPress= {() =>
                {this.setModalVisible(false)}} />
            </View>
          </Modal>
        </View>
    );
  }
}

export default Cal;