import React, {Component} from 'react'
import {
  ActivityIndicator,
  Text,
  View
  } from 'react-native'
import {Container, Header, Content, Footer, Title} from 'native-base'
import {Button, Icon} from 'react-native-elements'
import Modal from 'react-native-modal'
import { Ionicons } from '@expo/vector-icons'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

import Menu from './components/Menu'
import Cal from './components/Cal'
import {_storeData, _retrieveData, _deleteData} from './utils/AsyncData'
import {mainStyles, buttonColor} from './utils/Styles'

import {HasPermissions, ScheduleAllNotifications, CreateWebAddresses, CreateDateMarkers, MakeAPICall, GetHolidayData} from './utils/DataFunctions'

import {AdMobBanner} from 'expo-ads-admob';

const UPDATE_HOLIDAYS_TASK_NAME = 'updateHolidays'

// Main is the container for our app pages
export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      markers: {},
      selectedCountries: {},
      urlCache: {},
      allHolidaysArray: [],
      loading: false,
      errorModalVisible: false,
      firstLaunch: null,
      notifTime: '',
      selectedCountriesTemp: null,
      shouldContinueGettingHolidays: true,
      closeIconColor: '#FAFAD2',
      menuIconColor: buttonColor
    }
  }

  // on mount pull our holiday data
  componentDidMount = async () => {
    // First check if we have permissions for notifications (prompt user if not)
    await HasPermissions()

    // see if notification data is already stored on device
    var notifTime = await _retrieveData('notifTime')
    // if notification time is null (should only happen on first launch)
    // set the notification time to 12 AM UTC time
    if (notifTime == null) {
      notifTime = 'T00:00'
    }
    else {
      notifTime = notifTime.time
    }
    var storedCountries = await _retrieveData('selectedCountries')
    var firstLaunch = await _retrieveData('firstLaunch')
    var storedUrlCache = await _retrieveData('urlCache')
    if (storedUrlCache == null) {
      storedUrlCache = {}
    }
    // first time app is launched
    if (firstLaunch == null) {
      // set updated date to today
      var d = new Date()
      var lastUpdated = {date: d}
      _storeData('lastUpdate', JSON.stringify(lastUpdated))
    }

    // sets all our states up
    returnValue = await this.getHolidaysAndStoreData(storedCountries, firstLaunch, notifTime, storedUrlCache)
    if (returnValue == "error") {
      this.showErrorModal()
    }
    // For testing
    //TaskManager.unregisterAllTasksAsync()

    // Check if background task already registered
    var isRegistered = await TaskManager.isTaskRegisteredAsync(
      UPDATE_HOLIDAYS_TASK_NAME
    )
    if (!isRegistered) {
      // Set background task for updating data
      var seconds = 604800 // Check once a week if an update is necessary
      //var seconds = 10 // For testing
      await BackgroundFetch.registerTaskAsync(UPDATE_HOLIDAYS_TASK_NAME, {minimumInterval: seconds}) //TODO change interval
    }
    await BackgroundFetch.setMinimumIntervalAsync(seconds);
    // TODO delete these lines after done testing
    //var tasks = await TaskManager.getRegisteredTasksAsync()
  }

  getHolidaysAndStoreData = async (selectedCountries = selectedCountries, firstLaunch = this.state.firstLaunch, notifTime = this.state.notifTime, urlCache = this.state.urlCache) => {
    this.startLoading()
    this.setState({menuIconColor: '#B2E0B2'})

    // These are used to allow user to cancel fetching new holidays
    await this.setState({shouldContinueGettingHolidays: true})
    var finishedSelectedCountries = {}

    // Set these empty values to avoid errors during rendering empty calendar
    var localMarkers = {}
    var allHolidaysArray = []

    // first time app is being launched
    // (want to have default holidays so user can see functionality)
    if (firstLaunch == null) {
      // set up our defaults
      selectedCountries = {'US': ['religious'], 'EG': ['all']}
    }

    if (selectedCountries == null || Object.keys(selectedCountries).length == 0) {
      this.setState({markers: {}})
      this.setState({selectedCountries: {}})
      this.setState({allHolidaysArray: []})
      this.setState({urlCache: {}})
      this.setState({firstLaunch: false})
      _storeData('urlCache', JSON.stringify(urlCache))
      _storeData('selectedCountries', JSON.stringify(selectedCountries))
      _storeData('firstLaunch', JSON.stringify({firstLaunch: false}))
    }
    else {
      // get data and create markers for calendar object
      var urls = CreateWebAddresses(selectedCountries)
      var allHolidays = []
      for (i = 0; i < urls.length; i++) {
        if (this.state.shouldContinueGettingHolidays) {
          var result = await MakeAPICall(urls[i].country, urls[i].url, urlCache)
          if (result == "error") {
            return "error"
          }
          urlCache = result.urlCache
          allHolidaysArray.push(result.holidaysObj)
          localMarkers = CreateDateMarkers(allHolidaysArray)
          finishedSelectedCountries[urls[i].country] = selectedCountries[urls[i].country]
          this.setState({markers: localMarkers})
        }
        else {
          this.setState({markers: {}})
          finishedSelectedCountries = {}
          allHolidaysArray = []
        }
      }

      // Set state variables
      this.setState({selectedCountries: finishedSelectedCountries})
      this.setState({allHolidaysArray: allHolidaysArray})
      this.setState({urlCache: urlCache})
      this.setState({firstLaunch: false})

      // Store data in async storage
      _storeData('urlCache', JSON.stringify(urlCache))
      _storeData('selectedCountries', JSON.stringify(finishedSelectedCountries))
      _storeData('firstLaunch', JSON.stringify({firstLaunch: false}))
    }

    // schedule notifications for next 50 holidays
    ScheduleAllNotifications([], notifTime)
    _storeData('notifTime', JSON.stringify({'time':notifTime}))
    this.setState({notifTime: notifTime})

    this.setState({menuIconColor: buttonColor})
    this.stopLoading()
    return "success"
  }

  startLoading = () => {
    this.setState({loading: true})
    this.setState({closeIconColor: 'red'})
  }

  stopLoading = () => {
    this.setState({loading: false})
    this.setState({closeIconColor: '#FAFAD2'})
  }

  cancelGetHolidays = () => {
    this.setState({shouldContinueGettingHolidays: false})
  }
  // Child methods ----------------------------------------------------------------------
  setNotifTime = async (notifTimeParam) => {
    this.setState({notifTime: notifTimeParam})
  }

  setSelectedCountriesTemp = (selectedCountries) => {
    this.setState({selectedCountriesTemp: selectedCountries})
  }

  setShouldContinueGettingHolidays = async (shouldContinue) => {
    this.setState({shouldContinueGettingHolidays: shouldContinue})
  }

  childGetHolidaysAndStoreData = async (selectedCountries) => {
    returnValue = await this.getHolidaysAndStoreData(selectedCountries)
    if (returnValue == "error") {
      this.showErrorModal()
    }
  }

  childScheduleNotifications = async (timeString) => {
    ScheduleAllNotifications(this.state.allHolidaysArray, timeString)
  }

  // Error modal functions -------------------------------------------------------------

  showErrorModal = () => {
    setTimeout(() => {
      this.setState({errorModalVisible: true})
      this.stopLoading()
    }, 1000)
  }

  closeErrorModal = async (tryAgain)  => {
    if (tryAgain) {
      returnValue = await this.getHolidaysAndStoreData(
        this.state.selectedCountriesTemp,
        this.state.firstLaunch,
        this.state.notifications,
        this.state.urlCache)
      if (returnValue == "error") {
        this.showErrorModal()
      }
    }
    this.setState({errorModalVisible: false})
  }

  renderErrorModal = () => {
    return (
      <Modal style = {{flex: 1}}
        isVisible={this.state.errorModalVisible}
        swipeDirection="down"
        onSwipeComplete={() =>
          this.closeErrorModal(false)}
        onBackdropPress={() =>
          this.closeErrorModal(false)}>
        <View style={mainStyles.modalContent}>
          <Text style={mainStyles.modalError}>{"Error"}</Text>
          <Text> {" "}</Text>
          <Text style={mainStyles.modalErrorMsg}>{"Check your internet connection"}</Text>
          <Text>{" "}</Text>
          <Text>{" "}</Text>
          <Button containerStyle = {mainStyles.errorButtonContainer}
            buttonStyle = {mainStyles.errorButtonStyle}
            title = "Try Again"
            onPress = {() => {
              this.closeErrorModal(true)}} />
        </View>
      </Modal>
    )
  }

  // ----------------------------------------------------------------------------------

  render () {
    return (
      <Container>
        <Header style={[mainStyles.colors, {justifyContent: 'space-between'}]}>
          <View>
            <Menu
              selectedCountries = {this.state.selectedCountries}
              allHolidaysArray = {this.state.allHolidaysArray}
              notifTime = {this.state.notifTime}
              loading = {this.state.loading}
              menuIconColor = {this.state.menuIconColor}
              getHolidaysAndStoreData = {(selectedCountries, firstLaunch, notifTime, urlCache) => {
                this.childGetHolidaysAndStoreData(selectedCountries, firstLaunch, notifTime, urlCache) }}
              setNotifTime = {(notifTime) => {
                this.setNotifTime(notifTime) }}
              setSelectedCountriesTemp = {(selectedCountries) => {
                this.setSelectedCountriesTemp(selectedCountries) }}
              scheduleNotifications = {(notifTime) => {
                this.childScheduleNotifications(notifTime) }}/>
          </View>
          <View style={{justifyContent: 'center', flexDirection: 'row'}}>
            <View style = {{justifyContent: 'center'}} >
              <ActivityIndicator size="small" animating = {this.state.loading}/>
            </View>
            <View style = {{justifyContent: 'center'}}>
              <Icon name = 'cancel' color = {this.state.closeIconColor}
                underlayColor = {'#FFCCCB'}
                onPress={() => this.cancelGetHolidays()} />
            </View>
          </View>
        </Header>
        {this.renderErrorModal()}
        <View style = {mainStyles.calContainer}>
          <Cal
            markers={this.state.markers} />
        </View>
        <Footer style={mainStyles.colors}>
        <AdMobBanner
          bannerSize="banner"
          adUnitID="ca-app-pub-7233798900885543/6900160470" // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds = {true}
          onDidFailToReceiveAdWithError={this.bannerError} />
        </Footer>
      </Container>
    );
  }
}

/*
  Runs once every 2 weeks if user does not open app.
  Serves 3 Purposes
    1. If new year, update holidays to get new year worth of data
    2. Calendarific API updates data every quarter (may include revisions/holiday date changes/more data)
      - update every 2 weeks to catch this update
    3. Schedule new round of 50 notifications
      - (don't expect user to have more than 50 notifications in a 2 week range)
*/
TaskManager.defineTask(UPDATE_HOLIDAYS_TASK_NAME, async () => {
  try {
    // check if it has been enough time since last update
    var lastUpdateDict = await _retrieveData('lastUpdate')
    if (lastUpdateDict != null) {
      var lastUpdate = lastUpdateDict.date
      lastUpdate = new Date(lastUpdate)
      var days = 14 // update every 2 weeks
      var nextUpdate = lastUpdate.setDate(lastUpdate.getDate() + days);
      //var nextUpdate = lastUpdate.setHours(lastUpdate.getHours(),lastUpdate.getMinutes()+1,0,0) //For testing
      var current = new Date()
    }

    var current = new Date()
    if (lastUpdateDict == null || current > nextUpdate) {
      // Pull async data
      var urlCache = {} // Want to incorporate updates by Calendarific to current holiday data
      var storedCountries = await _retrieveData('selectedCountries')
      var firstLaunch = await _retrieveData('firstLaunch')

      // Run our main GetHolidayData function
      var results = await GetHolidayData(storedCountries, firstLaunch, urlCache)

      // Store the results
      _storeData('urlCache', JSON.stringify(results.localUrlCache))
      _storeData('lastUpdate', JSON.stringify(results.lastUpdate))

      // Schedule our next 50 notifications
      var notifTime = await _retrieveData('notifTime')
      // if notification time is null (should only happen on first launch)
      // set the notification time to 12 AM UTC time
      if (notifTime == null) {
        notifTime = 'T00:00'
      }
      else {
        notifTime = notifTime.time
      }
      ScheduleAllNotifications(results.allHolidaysArray, notifTime)
      console.log("updated")
      var receivedNewData = true
    }
    return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } catch (error) {
    console.log(error)
    return BackgroundFetch.Result.Failed;
  }
});