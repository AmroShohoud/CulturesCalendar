import React, {Component} from 'react'
import {Button,
  ScrollView,
  Text,
  TouchableHighlight,
  View} from 'react-native'
import {Calendar,
  CalendarList,
  Agenda} from 'react-native-calendars'
import Modal from "react-native-modal"
import {calStyles, calTheme} from '../utils/Styles'
import Selection from './Selection'
import {countryCodeOptions} from '../utils/Options'
import {_retrieveData} from '../utils/AsyncData'



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
        <View key = {i}>
          <Text>{holidayInfo.name}</Text>
          <Text>{holidayInfo.countryLong}</Text>
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
  render() {
    return (
      <View>
        <View style={calStyles.container}>
          <CalendarList
            style = {calStyles.background}
            theme = {calTheme}
            markedDates = {this.props.markers}
            pastScrollRange={50}
            futureScrollRange={50}
            markingType = {'multi-dot'}
            onDayPress = {(day) => {
              this.showHolidayDetails(day) }}
          />
        </View>
        <Modal isVisible={this.state.dayModalVisible}
          scrollTo={this.handleScrollTo}
          onBackdropPress={() =>
            this.setDayModalVisible(false)}
        >
          <ScrollView
            ref={ref => (this.scrollViewRef = ref)}
            onScroll={this.handleOnScroll}
          >
            <View style={calStyles.modalContent}>
              <Text>{this.state.curDate}</Text>
              { this.renderHolidays() }
            </View>
          </ScrollView>
          <Button title="X" onPress= {() =>
            {this.setDayModalVisible(false)}} />
        </Modal>
      </View>
    );
  }
}

export default Cal;