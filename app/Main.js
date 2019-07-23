import React, {Component} from 'react'
import {Button, Platform, Text,
  View, ScrollView, StatusBar} from 'react-native'
import {Container, Header, Content, Footer, Title} from 'native-base'
import Cal from './components/Cal'
import Selection from './components/Selection'
import {_retrieveData} from './utils/AsyncData'
import {mainStyles} from './utils/Styles'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import {HasPermissions, GetHolidayData} from './utils/DataFunctions'

const UPDATE_HOLIDAYS_TASK_NAME = 'updateHolidays'

// Main is the container for our app pages
export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      markers: {},
      countries: {}
    }
  }

  // on mount pull our holiday data
  componentDidMount = async () => {
    // see if data is already stored on device
    var storedCountries = await _retrieveData('selected')
    var firstLaunch = await _retrieveData('firstLaunch')
    let globalUrlCache = await _retrieveData('urlCache')

    await HasPermissions()
    this.getHolidayData(storedCountries, firstLaunch, globalUrlCache)

    // Set background task for updating data
    //await BackgroundFetch.unregisterTaskAsync("updateHolidays")
    const status = await BackgroundFetch.getStatusAsync()
    console.log(BackgroundFetch.Status[status]) //Available
    await BackgroundFetch.registerTaskAsync(UPDATE_HOLIDAYS_TASK_NAME, {minimumInterval: 10})
    let isRegistered = await TaskManager.isTaskRegisteredAsync(
      UPDATE_HOLIDAYS_TASK_NAME
    )
    var tasks = await TaskManager.getRegisteredTasksAsync()
    console.log(tasks)
    console.log(isRegistered)

  }

  getHolidayData = async (selectedCountries, firstLaunch, urlCache = globalUrlCache) => {
    var results = await GetHolidayData(selectedCountries, firstLaunch, urlCache)
    await this.setState({markers: results.localMarkers})
    await this.setState({countries: results.countries})
  }

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

TaskManager.defineTask(UPDATE_HOLIDAYS_TASK_NAME, async () => {
  console.log("new")
  try {
    var lastUpdate = await _retrieveData('lastUpdate')
    lastUpdate = new Date(lastUpdate)
      console.log("new1")
    // var nextUpdate = new Date(lastUpdate.setMonth(lastUpdate.getMonth()+1));
    var nextUpdate = lastUpdate.setHours(lastUpdate.getHours(),lastUpdate.getMinutes()+1,0,0);
    var current = new Date()
      console.log("new2")
    if (current > nextUpdate) {
        console.log("new3")
      var storedUrlCache = _retrieveData('urlCache')
      console.log("break1")
      var storedCountries = await _retrieveData('selected')
      console.log("break2")
      var firstLaunch = await _retrieveData('firstLaunch')
      console.log("break3")

      GetHolidayData(storedCountries, firstLaunch, storedUrlCache)
      console.log("updating")
    }
    const receivedNewData = true
    return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } catch (error) {
    console.log(error)
    return BackgroundFetch.Result.Failed;
  }
});