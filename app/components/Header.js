import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {headerStyles} from '../utils/Colors'

// Header is a simple function that creates a header for the page given input text
const Header = ({ title }) => (
  <View style = {headerStyles.headerContainer}>
    <Text style ={headerStyles.headerText}>{title.toUpperCase()}</Text>
  </View>)

export default Header;