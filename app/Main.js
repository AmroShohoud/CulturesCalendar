import React, {Component} from 'react'
import {Button, Platform, Text,
  View, ScrollView, StatusBar} from 'react-native'
import {Container, Header, Content, Footer, Title} from 'native-base'
import Cal from './components/Cal'
import Selection from './components/Selection'
import {_storeData, _retrieveData} from './utils/AsyncData'
import {mainStyles} from './utils/Styles'
import {countryCodeOptions, countryColors} from './utils/Options'



// Main is the container for our app pages
export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: 'https://calendarific.com/api/v2/holidays?',
      urlCache: {},
      api: '840729768871697006fe16d7b9292bdf83e0a658',
      countries: {},
      years: [],
      markers: {}
    };
  }

   // on mount pull our holiday data
  componentDidMount = async () => {
    // see if data is already stored on device
    var storedCountries = await _retrieveData('selected')
    var firstLaunch = await _retrieveData('firstLaunch')
    // cache so we don't have to send requests for urls already stored
    // used if user decides to select a new country in addition to keeping
    // older ones selected or if holidays are stored in persistent storage
    var urlCache = await _retrieveData('urlCache')
    this.getHolidayData(storedCountries, firstLaunch, urlCache)
  }

  // Calendar-specific functions for initial rendering -----------------------

  // parameters will be defined by user to narrow down holiday selection
  createWebAddresses = (countries, years) => {
    var urls = []
    var apiParam = "api_key=" + this.state.api
    var localCountries = Object.keys(countries)

    for (var i = 0; i < years.length; i++) {
      var yearParam = "&year=" + years[i]
      for (var j = 0; j < localCountries.length; j++) {
        var country = localCountries[j]
        var countryParam = "&country=" + country
        var types = countries[country]
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
  createDateMarkers = async (holidayArray) => {
    var localMarkers = {}

    // Format of objects to be passed into Calendar component's 'markedDates'
    // {'date': {dots: [{key: xxx, name: xxx, color: xxx, description: xxx},
    // {key: yyy, name: yyy, color: yyy, description: yyy}]}}

    for (var i = 0; i < holidayArray.length; i++) {
      for (var j = 0; j < holidayArray[i].holidays.length; j++) {
        var holiday = holidayArray[i].holidays[j]
        var markerObj = {
          key: i + "" + j,
          name: holiday.name,
          desc: holiday.description,
          countryLong: holidayArray[i].countryLong,
          color: countryColors[holidayArray[i].code]
          // color: countryColors[holidayArray[i].code]
        }
        // Be able to incorporate multiple holidays on same day
        if (holiday.date.iso in localMarkers) {
          // Do not save duplicates (API we are using has some)
          if (localMarkers[holiday.date.iso].dots[0].name != holiday.name ||
            localMarkers[holiday.date.iso].dots[0].description != holiday.desc) {
            localMarkers[holiday.date.iso].dots.push(markerObj)
          }
        }
        else {
          localMarkers[holiday.date.iso] = {dots: [markerObj]}
        }
      }
    }
    await this.setState({markers: localMarkers})
  }

  // Set the years to this year, previous year, and next year
  setYears = () => {
    var date = new Date()
    var cur = date.getFullYear()
    var prev = cur - 1
    var next = cur + 1
    this.setState({years: [prev, cur, next]})
    return [prev, cur, next]
  }

  // checks if holidays for a url are cached, if not makes API call
  makeAPICalls = async (countries, years, urlCache) => {
    var holidays = []
    var allHolidays = []
    var localCache = {}
    var urls = this.createWebAddresses(countries, years)
    for (var i = 0; i < urls.length; i++) {
      var url = urls[i].url
      console.log(url)
      var country = urls[i].country
      if (url in urlCache) {
        holidays = urlCache[url]
        allHolidays = allHolidays.concat({countryLong: countryCodeOptions[country], code: country,
          holidays: holidays})
        localCache[url] = holidays
      }
      else {
        holidays = await fetch(url)
          .then(response => {
            return response.json()
          })
          .then(myJson => {
            return myJson.response.holidays
          }).catch(err => {
            console.log(err) //TODO check this and add modal that shows error message
          })
        localCache[url] = holidays
        allHolidays = allHolidays.concat({countryLong: countryCodeOptions[country], code: country,
          holidays: holidays})
      }
    }
    this.setState({urlCache: localCache})
    _storeData('urlCache', JSON.stringify(localCache))
    return allHolidays
  }

  // this method hooks into all the processing that goes into building our
  // country holiday objects
  getHolidayData = async (selectedCountries = null, firstLaunch, urlCache = this.state.urlCache) => {
    // first time app is being launched
    // (want to have default holidays so user can see functionality)
    if (firstLaunch == null) {
      // set up our defaults
      var countries = {'US': ['religious'], 'EG': ['all']}
      this.setState({countries: countries})
      var years = this.setYears()

      // get data and
      var allHolidays = await this.makeAPICalls(countries, years)
      this.createDateMarkers(allHolidays)
      await _storeData('selected', JSON.stringify(countries))
      await _storeData('firstLaunch', JSON.stringify({first: false}))
    }
    // User has no countries selected and this is not the first launch
    // meaning user has deliberately selected no countries
    else if (selectedCountries == null) {
       // Set this empty value to avoid errors during rendering empty calendar
      this.setState({markers: {}})
      this.setState({curHolidays: {dots: [{key: ''}]}})
    }
    // User has selected countries, pull the data for those countries
    else
    {
      var countries = selectedCountries
      this.setState({countries: countries})
      this.setState({urlCache: urlCache})
      var years = this.setYears()

      // get data and
      var allHolidays = await this.makeAPICalls(countries, years, urlCache)
      this.createDateMarkers(allHolidays)
      await _storeData('selected', JSON.stringify(countries))
    }
  }

  //--------------------------------------------------------------------------

  render () {
    return (
      <Container>
        <Header style={mainStyles.colors}>
          <Selection countries = {this.state.countries}
            getHolidayData = {(selected, firstLaunch) => {
          this.getHolidayData(selected, firstLaunch) }} />
        </Header>
        <View style = {mainStyles.calContainer}>
          <Cal
            markers={this.state.markers} />
        </View>
        <Footer style={mainStyles.colors}>
          <Title></Title>
        </Footer>
      </Container>
    );
  }
}
