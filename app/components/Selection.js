import React, {Component} from 'react'
import {AsyncStorage,
  Button,
  ScrollView,
  Text,
  TouchableHighlight,
  View} from 'react-native'
import { CheckBox } from 'react-native-elements'
import CustomMultiPicker from "react-native-multiple-select-list"
import {_storeData, _retrieveData, _deleteData} from '../utils/AsyncData'
import { countryOptions } from '../utils/Options'
import Modal from "react-native-modal"
import { selStyles } from '../utils/Colors'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes'


class Selection extends React.Component {
   constructor(props) {
    super(props)
    this.state = {
      selected: {US: true},
      selModalVisible: false
    }
  }


  componentDidMount = async () => {
    test =  {country: 'in', type: 'religious'}
    // _storeData('params', JSON.stringify(test))
  }

  // User Selection Modal-specific Functions -------------------------------
  setSelModalVisible = (visible) => {
    this.setState({selModalVisible: visible})
  }
  // -----------------------------------------------------------------------

  isSelected = (country) => {
    if (country in this.state.selected) {
      return true
    }
    return false
  }

  setSelected = (country) => {
    var localSelected = this.state.selected
    localSelected[country] = !this.isSelected(country)
    this.setState({selected: localSelected})
  }

  saveSelected = async () => {
    var selectedCountries = Object.keys(this.state.selected)
    var localCountryObj = {}
    for (var i = 0; i < selectedCountries.length; i++) {
      localCountryObj[selectedCountries[i]] = ['all']
    }
    await _storeData('countries', JSON.stringify(localCountryObj))
  }

  exitModal = async () => {
    this.setSelModalVisible(false)
    await _deleteData('markers')
    await this.saveSelected()
    await this.props.getHolidayData()
  }

  buildCountryList = () => {
    return countryOptions.map((countryInfo, i) => {
      return (
        <CheckBox key = {i}
          title={countryInfo.name}
          checked={this.isSelected(countryInfo.code)}
          onPress = {() => {
            console.log(countryInfo.code)
          }}
          onIconPress = {() => {
            this.setSelected(countryInfo.code)
          }}
        />
      )
    })
  }

  // For scrolling ---------------------------------------------------------
  handleOnScroll = (event) => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    })
  }

  handleScrollTo = (p) => {
    if (this.scrollViewRef) {
      this.scrollViewRef.scrollTo(p);
    }
  }
  // -----------------------------------------------------------------------


  render() {
    return (
      <View>
        <Button title = "mybuttin" onPress = {() => {
              this.setSelModalVisible(true) }}
          />
        <Modal isVisible={this.state.selModalVisible}
          scrollTo={this.handleScrollTo}
        >
          <ScrollView
            ref={ref => (this.scrollViewRef = ref)}
            onScroll={this.handleOnScroll}
          >
            <View style = {selStyles.modalContent}>
              { this.buildCountryList() }
               <Button title="Close" onPress= {() =>
                {this.exitModal()}} />
            </View>
          </ScrollView>
        </Modal>
      </View>
    );
  }
}

export default Selection;