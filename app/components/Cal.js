import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Calendar,
  CalendarList,
  Agenda} from 'react-native-calendars';

class Cal extends React.Component {
  render() {
    return (
      <View>
        <Calendar
          style = {styles.test}
          theme = {theme}
          onDayPress={(day) => {
            console.log('selected day', day)}}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 600,
    width: 400,
    marginTop: 40
  },
  calendar: {
    backgroundColor: 'lightblue'
  },
  test: {
    opacity: 0.6
  }
})

const theme = {
  calendarBackground: 'white',
    textDayFontSize: 20,
    textMonthFontSize: 22,
    textDayHeaderFontSize: 20,
    textDayFontWeight: '500',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '500',
}

export default Cal;