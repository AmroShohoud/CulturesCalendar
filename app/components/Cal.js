import React, {Component} from 'react'
import {
  ScrollView,
  Text,
  TouchableHighlight,
  View} from 'react-native'
import {Calendar,
  CalendarList,
  Agenda} from 'react-native-calendars'
import {Button} from 'react-native-elements'
import Modal from 'react-native-modal'
import {calStyles, calTheme} from '../utils/Styles'
import Selection from './Selection'
import {countryCodeOptions, countryColors} from '../utils/Options'
import {_retrieveData} from '../utils/AsyncData'
import {HasPermissions, GetHolidayData} from '../utils/DataFunctions'


// Cal is the main calendar component of the app
class Cal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      curHolidays: {dots: [{key: ''}]},
      curDate: '',
      dayModalVisible: false
    }
  }
  // -----------------------------------------------------------------------

  // Holiday Modal-specific Functions --------------------------------------
  setDayModalVisible = (visible) => {
    this.setState({dayModalVisible: visible})
  }

  // Activate the modal and prepare the holiday data to be rendered
  showHolidayDetails = (day) => {
    if (day['dateString'] in this.props.markers) {
      this.setDayModalVisible(true)
      this.setState({curDate: day['dateString']})
      this.setState({curHolidays: this.props.markers[day['dateString']]})
    }
  }

  // Render holidays in the modal
  renderHolidays = () => {
    return this.state.curHolidays.dots.map((holidayInfo, i) => {
      return (
        <View style = {calStyles.modalHoliday} key = {i}>
          <Text style = {calStyles.modalHolidayName}>{holidayInfo.name}</Text>
          <Text style = {{color: holidayInfo.color}}>{holidayInfo.countryLong}</Text>
          <Text>{holidayInfo.desc}</Text>
          <Text></Text>
        </View>
      );
    });
  }

  //------------------------------------------------------------------------
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
  // Calculate number of month display range for calendar ------------------

  futureMonths = () => {
    var currentDate = new Date()
    var currentMonth = currentDate.getMonth()
    var monthsToEnd = 12 - currentMonth - 1
    var total = monthsToEnd + 12
    return total
  }

  pastMonths = () => {
    var currentDate = new Date()
    var currentMonth = currentDate.getMonth()
    var total = currentMonth + 12
    return total
  }
  // -----------------------------------------------------------------------

  render() {
    return (
      <View>
        <View>
          <CalendarList
            style = {calStyles.background}
            theme = {calTheme}
            markedDates = {this.props.markers}
            pastScrollRange={this.pastMonths()}
            futureScrollRange={this.futureMonths()}
            markingType = {'multi-dot'}
            onDayPress = {(day) => {
              this.showHolidayDetails(day) }}
          />
        </View>
        <Modal style = {{flex: 1}}
          isVisible={this.state.dayModalVisible}
          swipeDirection="down"
          onSwipeComplete={() =>
            this.setDayModalVisible(false)}
          onBackdropPress={() =>
            this.setDayModalVisible(false)}
          scrollTo={this.handleScrollTo}
          scrollOffset={this.state.scrollOffset}
          scrollOffsetMax={1000}
        >
        <View>
          <ScrollView
            ref={ref => (this.scrollViewRef = ref)}
            onScroll={this.handleOnScroll}
            scrollEventThrottle={16}
          >
            <View style={calStyles.modalContent}>
              <Text style = {calStyles.modalDate}>{this.state.curDate}</Text>
              <Text>{" "}</Text>
              { this.renderHolidays() }
            </View>
          </ScrollView>
        </View>

        </Modal>
      </View>
    );
  }
}

export default Cal;