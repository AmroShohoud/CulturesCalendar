import React, {Component} from 'react'
import {
  ActivityIndicator,
  Text,
  View
  } from 'react-native'
import {Container, Header, Content, Footer, Title} from 'native-base'
import {Button} from 'react-native-elements'
import Modal from 'react-native-modal'
import Cal from './components/Cal'
import Selection from './components/Selection'
import {_storeData, _retrieveData} from './utils/AsyncData'
import {mainStyles} from './utils/Styles'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import {HasPermissions, GetHolidayData, ScheduleAllNotifications} from './utils/DataFunctions'

const UPDATE_HOLIDAYS_TASK_NAME = 'updateHolidays'

// Main is the container for our app pages
export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      markers: {},
      selectedCountries: {},
      urlCache: {},
      loading: "false",
      errorModalVisible: false,
      firstLaunch: null
    }
  }

  // on mount pull our holiday data
  componentDidMount = async () => {
    // First check if we have permissions for notifications (prompt user if not)
    await HasPermissions()

    // see if data is already stored on device
    var storedCountries = await _retrieveData('selectedCountries')
    var firstLaunch = await _retrieveData('firstLaunch')
    var storedUrlCache = await _retrieveData('urlCache')

    this.setState({firstLaunch: firstLaunch})
    this.setState({selectedCountries: storedCountries})

    // sets all our states up
    this.getHolidayData(storedCountries, firstLaunch, storedUrlCache)

    // Check if background task already registered
    var isRegistered = await TaskManager.isTaskRegisteredAsync(
      UPDATE_HOLIDAYS_TASK_NAME
    )
    //if (!isRegistered) {
      // Set background task for updating data
      //var seconds = 604800 // Check once a week if an update is necessary
      var seconds = 10
      await BackgroundFetch.registerTaskAsync(UPDATE_HOLIDAYS_TASK_NAME, {minimumInterval: seconds}) //TODO change interval
    //}

    // TODO delete these lines after done testing
    var tasks = await TaskManager.getRegisteredTasksAsync()
  }

  getHolidayData = async (selectedCountries, firstLaunch, urlCache = this.state.urlCache) => {
    this.setState({loading: "true"})

    // Run our main GetHolidayData function
    var results = await GetHolidayData(selectedCountries, firstLaunch, urlCache)

    // Check if we received an error when accessing internet API
    if (results == "error") {
      this.setState({errorModalVisible: true})
      this.setState({loading: "false"})
    }
    else {
      // Set state variables
      await this.setState({markers: results.localMarkers})
      await this.setState({selectedCountries: results.selectedCountries})
      this.setState({urlCache: results.localUrlCache})
      this.setState({loading: "false"})

      // Store data in async storage
      _storeData('urlCache', JSON.stringify(results.localUrlCache))
      _storeData('selectedCountries', JSON.stringify(results.selectedCountries))
      _storeData('lastUpdate', JSON.stringify(results.lastUpdate))
      _storeData('firstLaunch', JSON.stringify(results.firstLaunch))

      // schedule notifications for next 50 holidays
      ScheduleAllNotifications(results.allHolidaysArray)
    }
  }

  // Error modal functions -------------------------------------------------------------

  closeErrorModal = (tryAgain) => {
    if (tryAgain) {
      this.getHolidayData(this.selectedCountries, this.firstLaunch)
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
           <ActivityIndicator size="small" animating="false" />
          </View>
          <View>
            <Selection selectedCountries = {this.state.selectedCountries}
              getHolidayData = {(selectedCountries, firstLaunch) => {
            this.getHolidayData(selectedCountries, firstLaunch) }} />
          </View>
          <View style={{justifyContent: 'center'}}>
            <ActivityIndicator size="small" animating = {this.state.loading}/>
          </View>
        </Header>
        {this.renderErrorModal()}
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

/*
  Runs once every 2 weeks if user does not open app.
  Serves 3 Purposes
    1. If new year, updated holidays to get new year worth of data
    2. Calendarific API updates data every quarter (may include revisions/holiday date changes/more data)
      - update every 2 weeks to catch this update
    3. Schedule new round of 50 notifications
      - (don't expect user to have more than 50 notifications in a 2 week range)
*/
TaskManager.defineTask(UPDATE_HOLIDAYS_TASK_NAME, async () => {
  try {
    // check if it has been enough time since last update
    var lastUpdateDict = await _retrieveData('lastUpdate')
    var lastUpdate = lastUpdateDict.date
    lastUpdate = new Date(lastUpdate)
    //var days = 14 // update every 2 weeks
    //var nextUpdate = lastUpdate.setDate(date.getDate() + days);
    var nextUpdate = lastUpdate.setHours(lastUpdate.getHours(),lastUpdate.getMinutes()+1,0,0);
    var current = new Date()

    if (current > nextUpdate) {
      // Pull async data
      var urlCache = {} // Want to incorporate updates by Calendarific to current holiday data
      var storedCountries = await _retrieveData('selectedCountries')
      var firstLaunch = await _retrieveData('firstLaunch')

      // Run our main GetHolidayData function
      var results = await GetHolidayData(storedCountries, firstLaunch, urlCache)

      // Store the results
      console.log(results.localUrlCache)
      console.log(results.lastUpdate)
      _storeData('urlCache', JSON.stringify(results.localUrlCache))
      _storeData('lastUpdate', JSON.stringify(results.lastUpdate))

      // Schedule our next 50 notifications
      ScheduleAllNotifications(results.allHolidaysArray)
      console.log("updated")
    }
    var receivedNewData = true
    return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } catch (error) {
    console.log(error)
    return BackgroundFetch.Result.Failed;
  }
});