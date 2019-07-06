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
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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

// Selection.js
export const selStyles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  }
})