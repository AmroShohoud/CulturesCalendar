import React, {Component} from 'react';
import {Platform, Text,
  View, ScrollView, StatusBar} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {primaryGradientArray, mainStyles} from './utils/Colors';
import Header from './components/Header';
import Cal from './components/Cal';

// Main is the container for our app pages
export default class Main extends React.Component {
  render () {
    return (
    <LinearGradient colors={primaryGradientArray} style={mainStyles.container}>
      <View>
        <Header title = "Cultures Calendar" />
      </View>
      <View style = {mainStyles.calContainer}>
        <Cal />
      </View>
    </LinearGradient>
    );
  }
}
