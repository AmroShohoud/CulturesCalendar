import React, {Component} from 'react'
import {AsyncStorage,
  Button,
  Text,
  TouchableHighlight,
  View} from 'react-native'
import {Calendar,
  CalendarList,
  Agenda} from 'react-native-calendars'
import Modal from "react-native-modal"
import {calStyles, calTheme} from '../utils/Colors'
import {_storeData, _retrieveData} from '../utils/AsyncData'
import Selection from './Selection'
import {countryCodeOptions} from '../utils/Options'

// Cal is the main calendar component that is central to the app
class Cal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: 'https://calendarific.com/api/v2/holidays?',
      api: '840729768871697006fe16d7b9292bdf83e0a658',
      countries: {},
      years: [],
      dayModalVisible: false,
      markers: {},
      curHolidays: {dots: [{key: ''}]},
      curDate: '',
      selModalVisible: false
    };
  }

  // Calendar-specific functions for initial rendering ---------------------

  // parameters will be defined by user to narrow down holiday selection
  createWebAddresses = () => {
    urls = []
    apiParam = "api_key=" + this.state.api
    var localCountries = Object.keys(this.state.countries)

    for (var i = 0; i < this.state.years.length; i++) {
      yearParam = "&year=" + this.state.years[i]
      for (var j = 0; j < localCountries.length; j++) {
        country = localCountries[j]
        countryParam = "&country=" + country
        var types = this.state.countries[country]
        for (var k = 0; k < types.length; k++) {
          var typeParam = ''
          if (types[k] != 'all') {
            typeParam = '&type=' + types[k]
          }
          var url = [this.state.url, apiParam, countryParam, yearParam, typeParam]
          urls = urls.concat({country: country, url: url.join('')})
        }
      }
    }
    return urls
  }

  // Put holidays into format to pass into the Calendar component for marking dates of holidays
  createDateMarkers = (holidayArray) => {
    localMarkers = {}

    // Format of objects to be passed into Calendar component's 'markedDates'
    // {'date': {dots: [{key: xxx, color: xxx, description: xxx},
    // {key: yyy, color: yyy, description: yyy}]}}

    for (var i = 0; i < holidayArray.length; i++) {
      for (var j = 0; j < holidayArray[i].holidays.length; j++) {
        holiday = holidayArray[i].holidays[j]
        markerObj = {
          key: holiday.name,
          desc: holiday.description,
          country: holidayArray[i].country,
          color: 'green'
        }
        // Be able to incorporate multiple holidays on same day
        if (holiday.date.iso in localMarkers) {
          // Do not save duplicates (API we are using has some)
          if (localMarkers[holiday.date.iso].dots[0].key != holiday.name) {
            localMarkers[holiday.date.iso].dots.push(markerObj)
          }
        }
        else {
          localMarkers[holiday.date.iso] = {dots: [markerObj]}
        }
      }
    }
    this.setState({markers: localMarkers})
    _storeData('markers', JSON.stringify(localMarkers))
  }

  // Set the years to this year, previous year, and next year
  setYears = () => {
    var date = new Date()
    var cur = date.getFullYear()
    var prev = cur - 1
    var next = cur + 1
    this.setState({years: [prev, cur, next]})
  }

  // on mount pull our holiday data
  componentDidMount = async () => {
    try {
      await AsyncStorage.removeItem('markers');
      await AsyncStorage.removeItem('params');
    }
    catch(exception) {
    }
    // see if data is already stored on device
    storedMarkers = await _retrieveData('markers')
    if (storedMarkers != null) {
      this.setState({markers: storedMarkers})
    }
    // if not, pull the data using Calendarific API
    else {
      storedParams = await _retrieveData('params')
      countries = {'US': ['religious'], 'EG': ['all']}

      // Setting default country and type if they haven't been set in AsyncStorage
      if (storedParams != null) {
        countries = storedParams.countries
      }

      await this.setState({countries: countries})
      await this.setYears()
      params = {
        countries: this.state.countries,
        years: this.state.years
      }
      _storeData('params', JSON.stringify(params))

      allHolidays = []
      urls = this.createWebAddresses()
      for (var i = 0; i < urls.length; i++) {
        url = urls[i].url
        holidays = await fetch(url)
          .then(response => {
            return response.json()
          })
          .then(myJson => {
            return myJson.response.holidays
          }).catch(err => {
            console.log(err) //TODO check this and add modal that shows error message
          });
        allHolidays = allHolidays.concat({country: countryCodeOptions[urls[i].country],
          holidays: holidays})
      }
      this.createDateMarkers(allHolidays)
    }
  }
  // -----------------------------------------------------------------------

  // Holiday Modal-specific Functions --------------------------------------
  setDayModalVisible = (visible) => {
    this.setState({dayModalVisible: visible})
  }

  // Activate the modal and prepare the holiday data to be rendered
  showHolidayDetails = (day) => {
    if (day['dateString'] in this.state.markers) {
      this.setDayModalVisible(true)
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
          <Text>{holidayInfo.country}</Text>
          <Text>{holidayInfo.desc}</Text>
          <Text></Text>
        </View>
      );
    });
  }

  //------------------------------------------------------------------------

  // User Selection Modal-specific Functions -------------------------------
  setSelModalVisible = (visible) => {
    this.setState({selModalVisible: visible})
  }
  // -----------------------------------------------------------------------

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
          <Button title = "mybuttin" onPress = {() => {
              this.setSelModalVisible(true) }}
          />
          <Modal isVisible={this.state.dayModalVisible}
            swipeDirection = 'down'>
            <View style={calStyles.modalContent}>
              <Text>{this.state.curDate}</Text>
              { this.renderHolidays() }
              <Button title="Close" onPress= {() =>
                {this.setDayModalVisible(false)}} />
            </View>
          </Modal>
          <Modal isVisible={this.state.selModalVisible}
            swipeDirection = 'down'>
            <View style = {calStyles.modalContent}>
              <Selection />
              <Button title="Close" onPress= {() =>
                {this.setSelModalVisible(false)}} />
            </View>
          </Modal>
        </View>
    );
  }
}

export default Cal;