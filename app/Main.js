import React, {Component} from 'react';
import {Platform, StyleSheet, Text,
  View, ScrollView, StatusBar} from 'react-native';
import {LinearGradient} from 'expo';
import {primaryGradientArray} from './utils/Colors';
import Header from './components/Header';
import Cal from './components/Cal';

export default class Main extends React.Component {
  render () {
    return (
    <LinearGradient colors={primaryGradientArray} style={styles.container}>
      <View>
        <Header title = "Cultures Calendar" />
      </View>
      <View style = {styles.calContainer}>
        <Cal />
      </View>
    </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
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
