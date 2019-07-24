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

    // Set background task for updating data
    // TODO check if task already registered
    await BackgroundFetch.registerTaskAsync(UPDATE_HOLIDAYS_TASK_NAME, {minimumInterval: 10}) //TODO change interval

    // TODO delete these lines after done testing
    var tasks = await TaskManager.getRegisteredTasksAsync()
  }

  getHolidayData = async (selectedCountries, firstLaunch, urlCache = this.state.urlCache) => {
    this.setState({loading: "true"})
    var results = await GetHolidayData(selectedCountries, firstLaunch, urlCache)
    if (results == "error") {
      this.setState({errorModalVisible: true})
      this.setState({loading: "false"})
    }
    else {
      await this.setState({markers: results.localMarkers})
      await this.setState({selectedCountries: results.selectedCountries})
      this.setState({urlCache: results.localUrlCache})
      this.setState({loading: "false"})

      _storeData('urlCache', JSON.stringify(results.localUrlCache))
      _storeData('selectedCountries', JSON.stringify(results.selectedCountries))
      _storeData('lastUpdate', JSON.stringify(results.lastUpdate))
      _storeData('firstLaunch', JSON.stringify(results.firstLaunch))

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

TaskManager.defineTask(UPDATE_HOLIDAYS_TASK_NAME, async () => {
  try {
    var lastUpdateDict = await _retrieveData('lastUpdate')
    var lastUpdate = lastUpdateDict[date]
    lastUpdate = new Date(lastUpdate)

    var nextUpdate = lastUpdate.setHours(lastUpdate.getHours(),lastUpdate.getMinutes()+1,0,0);
    var current = new Date()

    if (current > nextUpdate) {
      var urlCache = {} // Want to incorporate updates by Calendarific to current holiday data
      var storedCountries = await _retrieveData('selectedCountries')
      var firstLaunch = await _retrieveData('firstLaunch')

      var results = await GetHolidayData(storedCountries, firstLaunch, urlCache)
      _storeData('urlCache', JSON.stringify(results.urlCache))
      _storeData('lastUpdate', results.lastUpdate)

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