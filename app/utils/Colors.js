// app/utils/Colors.js
import {StyleSheet} from 'react-native';

//contains colors and styles for all components

// Main.js
const primaryStart = 'lightgreen';
const primaryEnd = 'lightblue';
export const primaryGradientArray = [primaryStart, primaryEnd];
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  calContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

// Header.js
export const headerStyles = StyleSheet.create({
  headerContainer: {
    marginTop: 40,
    justifyContent: 'flex-start'
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '500'
  }
});

// Cal.js
export const calStyles = StyleSheet.create({
  container: {
    height: 600,
    width: 400,
    marginTop: 40
  },
  calendar: {
    backgroundColor: 'lightblue'
  },
  background: {
    opacity: 0.6
  }
})

export const calTheme = {
  calendarBackground: 'white',
    textDayFontSize: 20,
    textMonthFontSize: 22,
    textDayHeaderFontSize: 20,
    textDayFontWeight: '500',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '500',
}