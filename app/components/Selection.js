import React, {Component} from 'react';
import {AsyncStorage,
  Button,
  Text,
  TouchableHighlight,
  View} from 'react-native';
import { CheckBox } from 'react-native-elements';
import CustomMultiPicker from "react-native-multiple-select-list";
import {_storeData, _retrieveData} from '../utils/AsyncData';
import { countryOptions } from '../utils/Options';

class Selection extends React.Component {
   constructor(props) {
    super(props)
    this.state = {
      selected: {'US': false, 'Canada': false}
    }
  }


  componentDidMount = async () => {
    test =  {country: 'in', type: 'religious'}
    // _storeData('params', JSON.stringify(test))
  }

  setSelected = (country) => {
    localSelected = this.state.selected
    localSelected[country] = !localSelected[country]
    this.setState({selected: localSelected})
  }

  buildCountryList = () => {
    return countryOptions.map((countryInfo, i) => {
      return (
        <CheckBox key = {i}
          title={countryInfo.name}
          checked={false}
          onPress = {() => {
            console.log(countryInfo.name)
          }}
          onIconPress = {() => {
            this.setSelected(countryInfo.name)
          }}
        />
      );
    });
    for (var i = 0; i < countries.length; i++) {
      <CheckBox
        title={countries[i].name}
        checked={false}
        onPress = {() => {
          console.log(countries[i].name)
        }}
        onIconPress = {() => {
          this.setSelected(countries[i].name)
        }}
      />
    }
  }

  render() {
    return (
      <View>
        {this.buildCountryList()}
        <CheckBox
          title='US'
          checked={this.state.selected.US}
          onPress = {(title) => {
            console.log("here")
          }}
          onIconPress = {(title) => {
            this.setSelected('US')
          }}
        />
        <CheckBox
          title='Canada'
          checked={this.state.selected.Canada}
           onPress = {(title) => {
            console.log("here")
          }}
          onIconPress = {(title) => {
            this.setSelected('Canada')
          }}
        />
      </View>
      );
  }
}

export default Selection;