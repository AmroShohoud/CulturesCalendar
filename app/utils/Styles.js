// app/utils/Colors.js
import {StyleSheet} from 'react-native';

//contains colors and styles for all components

// Main.js
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  calContainer: {
    flex: 1,
    alignItems: 'center'
  },
  colors: {
    backgroundColor: '#FAFAD2'
  }
});

// Cal.js
export const calStyles = StyleSheet.create({
  background: {
    opacity: 0.8
  },
  modalDate: {
    fontSize: 16,
    color: 'grey',
    textAlign: 'center'
  },
  modalHoliday: {
    textAlign: 'left'
  },
  modalHolidayName: {
    fontSize: 16
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  }
})

export const calTheme = {
  calendarBackground: 'white',
  textDayFontSize: 20,
  textMonthFontSize: 22,
  textDayHeaderFontSize: 14,
  textDayFontWeight: '500',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '400',
}

// Selection.js
export const selStyles = StyleSheet.create({
  modalContainer: {
    width: '90%',
    height: '90%'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  countryCheckboxes: {
    backgroundColor: 'white',
    borderWidth: 0,
    alignSelf: 'flex-start'
  },
  typeCheckboxes: {
    backgroundColor: 'white',
    borderWidth: 0,
    alignSelf: 'flex-start',
    marginLeft: 40
  }
})
