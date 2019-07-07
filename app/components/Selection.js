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
      selected: {},
      selModalVisible: false
    }
  }

  componentDidMount = async () => {
    // get our list of selected countries from async storage
    var countryObj = await _retrieveData('countries')
    if (countryObj == null) {
      countryObj = {}
    }
    await this.setState({selected: countryObj})
  }

  // Modal-specific methods ----------------------------------------------
  setSelModalVisible = (visible) => {
    this.setState({selModalVisible: visible})
  }
  // ---------------------------------------------------------------------

  // Selection Processing methods ----------------------------------------
  isSelectedCountry = (country) => {
    if (country in this.state.selected) {
      return true
    }
    return false
  }

  isSelectedType = (country, type) => {
    if (this.isSelectedCountry(country) && this.state.selected[country].includes(type)) {
        return true
    }
    return false
  }
  // executed every time a country checkbox is clicked on
  setSelectedCountry = async (country, types = ['all']) => {
    var localSelected = this.state.selected
    // Country is not checked, check it and associated type checkboxes
    if (!this.isSelectedCountry(country)) {
      localSelected[country] = types
    }
    // Country is checked, uncheck it along with associated type checkboxes
    else {
      delete localSelected[country]
    }
    await this.setState({selected: localSelected})
  }

  // executed every time a type checkbox is clicked on
  setSelectedType = async (country, type) => {
    var localSelected = this.state.selected
    // Type checkbox is unchecked
    if (!this.isSelectedCountry(country)) {
      localSelected[country] = [type]
    }
    else if (!this.isSelectedType(country, type)) {
      localSelected[country].push(type)
    }
    // Type checkbox is checked, uncheck it and possibly uncheck country
    else {
      var filteredArr = localSelected[country].filter(function(e) { return e !== type })
      localSelected[country] = filteredArr
      // if no other types checked, uncheck country
      if (filteredArr.length == 0) {
        delete localSelected[country]
      }
    }
    await this.setState({selected: localSelected})
  }
  // executed on modal close to save selected countries in persistence storage
  saveSelected = async () => {
    await _storeData('countries', JSON.stringify(this.state.selected))
  }

  exitModal = async () => {
    this.setSelModalVisible(false)
    await _deleteData('markers')
    await this.saveSelected()
    await this.props.getHolidayData()
  }

  // ---------------------------------------------------------------------

  // For rendering -------------------------------------------------------
  buildCountryList = () => {
    return countryOptions.map((countryInfo, i) => {
      if (countryInfo.code == 'US' ||
        countryInfo.code == 'GB' ||
        countryInfo.code == 'CA' ||
        countryInfo.code == 'AU') {
        return (
          <View key = {countryInfo.code}>
            <CheckBox
              title={countryInfo.name}
              checked={this.isSelectedCountry(countryInfo.code)}
              onPress = {() => {
                this.setSelectedCountry(countryInfo.code, ['religious', 'national', 'observance'])
              }}
              onIconPress = {() => {
                this.setSelectedCountry(countryInfo.code, ['religious', 'national', 'observance'])

              }}
            />
            <CheckBox
              title={"religious"}
              checked={this.isSelectedType(countryInfo.code, 'religious')}
              onPress = {() => {
                this.setSelectedType(countryInfo.code, 'religious')
              }}
              onIconPress = {() => {
                this.setSelectedType(countryInfo.code, 'religious')
              }}
            />
          </View>
        )
      }
      else {
        return (
          <View key = {countryInfo.code}>
            <CheckBox
              title={countryInfo.name}
              checked={this.isSelectedCountry(countryInfo.code)}
              onPress = {() => {
                this.setSelectedCountry(countryInfo.code)
              }}
              onIconPress = {() => {
                this.setSelectedCountry(countryInfo.code)
              }}
            />
          </View>
        )
      }
    })
  }
  // -----------------------------------------------------------------------

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
            </View>
          </ScrollView>
          <Button title="X" onPress= {() =>
            {this.exitModal()}} />
        </Modal>
      </View>
    );
  }
}

export default Selection;