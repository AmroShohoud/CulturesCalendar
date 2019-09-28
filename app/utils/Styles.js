// app/utils/Colors.js
import {StyleSheet, Dimensions} from 'react-native';

export const buttonColor = '#009900'
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
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalError: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center'
  },
  modalErrorMsg: {
    fontSize: 16,
    textAlign: 'center'
  },
  errorButtonStyle: {
    backgroundColor: buttonColor,
    borderColor: buttonColor,
    borderWidth: 1
  },
  errorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

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
  todayTextColor: '#00cc00'
}

// Selection list styles
export const selStyles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    flex: 1
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
  },
  buttonStyle: {
    backgroundColor: buttonColor,
    borderColor: buttonColor,
    borderWidth: 1
  },
  clearButtonStyle: {
    borderColor: buttonColor,
    borderWidth: 1
  },
  clearButtonTitle: {
    color: buttonColor
  },
  buttonsView: {
    flexDirection:'row',
    paddingLeft: 10,
    paddingRight: 10
  }
})

//Menu.js
const width = Dimensions.get('window').width * 0.75
const height = Dimensions.get('window').height

export const menuStyles = StyleSheet.create({
    container : {
        position : 'absolute',
        left: 0,
        top: 0,
        width : width,
        height : height,
        paddingTop : 10,
        paddingBottom : 10
    },
     menu: {
        flex: 1,
        backgroundColor: '#FFF',
        position : 'absolute',
        left: 0,
        top: 0,
        width : width,
        height : height,
        paddingTop : 10,

        paddingBottom : 10
    },
    notifButton: {
      height: '100%',
      width: '100%',
      alignItems: 'flex-start',
      justifyContent: 'center',
      backgroundColor: 'white',
      paddingLeft: 10
    },
    notifButtonView: {
      borderTopColor: 'lightgrey',
      borderTopWidth: 0.5,
      borderBottomColor: 'lightgrey',
      borderBottomWidth: 0.5,
      alignItems: 'flex-start'
    },
    notifText: {
      fontSize: 16,
      fontFamily: 'System',
      fontWeight: 'bold',
      color: '#484848'
    }
  })
