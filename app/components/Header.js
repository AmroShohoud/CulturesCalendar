import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const Header = ({ title }) => (
  <View style = {styles.headerContainer}>
    <Text style ={styles.headerText}>{title.toUpperCase()}</Text>
  </View>)


const styles = StyleSheet.create({
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

export default Header;