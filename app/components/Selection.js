import React, {Component, PureComponent} from 'react'
import {AsyncStorage,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableHighlight,
  View} from 'react-native'
import {Button, CheckBox, ThemeProvider} from 'react-native-elements'
import CustomMultiPicker from "react-native-multiple-select-list"
import {_storeData, _retrieveData, _deleteData} from '../utils/AsyncData'
import {countryOptions} from '../utils/Options'
import {selStyles, buttonTheme} from '../utils/Styles'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes'
import {HasPermissions, GetHolidayData} from '../utils/DataFunctions'

//TODO
//class SelectionItem extends React.PureComponent {

//}

class Selection extends React.Component {
   constructor(props) {
    super(props)
    this.state = {
      selectedCountries: {},
      selModalVisible: false
    }
  }

  // Modal-specific methods ------------------------------------------------
  setSelModalVisible = (visible) => {
    this.setState({selModalVisible: visible})
  }

  openModal = async () => {
    // extra check to make sure selected countries matches what is in calendar
    await this.setState({selectedCountries: this.props.selectedCountries})
    this.setSelModalVisible(true)
  }

  exitModal = async () => {
    console.log("fetching holidays")
    this.setSelModalVisible(false)
    this.saveSelected()
    await this.props.getHolidayData(this.state.selectedCountries, false)
    console.log("done")
  }

  // -----------------------------------------------------------------------

  // Selection Processing methods ------------------------------------------
  isSelectedCountry = (country) => {
    if (country in this.state.selectedCountries) {
      return true
    }
    return false
  }

  isSelectedType = (country, type) => {
    if (this.isSelectedCountry(country) && this.state.selectedCountries[country].includes(type)) {
        return true
    }
    return false
  }
  // executed every time a country checkbox is clicked on
  setSelectedCountry = async (country, types = ['all']) => {
    var localSelected = this.state.selectedCountries
    // Country is not checked, check it and associated type checkboxes
    if (!this.isSelectedCountry(country)) {
      localSelected[country] = types
    }
    // Country is checked, uncheck it along with associated type checkboxes
    else {
      delete localSelected[country]
    }
    await this.setState({selectedCountries: localSelected})
  }

  // executed every time a type checkbox is clicked on
  setSelectedType = async (country, type) => {
    var localSelected = this.state.selectedCountries
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
    await this.setState({selectedCountries: localSelected})
  }

  clearSelected = () => {
    this.setState({selectedCountries: {}})
  }

  // executed on modal close to save selected countries in persistence storage
  saveSelected = () => {
    _storeData('selected', JSON.stringify(this.state.selectedCountries))
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

  // For rendering ---------------------------------------------------------
  // type list under countries where type of holiday selection is allowed
  buildTypeList = (countryInfo) => {
    types = ['religious', 'observance', 'national']
    return types.map((type, i) => {
      return (
        <CheckBox key = {countryInfo.name.concat(type)}
          checkedColor = 'green'
          containerStyle = {selStyles.typeCheckboxes}
          title={type}
          checked={this.isSelectedType(countryInfo.code, type)}
          onPress = {() => {
            this.setSelectedType(countryInfo.code, type)
          }}
          onIconPress = {() => {
            this.setSelectedType(countryInfo.code, type)
          }}
        />
      )
    })
  }
  // the country list for user selection
  buildCountryList = (countryInfo) => {
    if (countryInfo.code == 'US' ||
      countryInfo.code == 'GB' ||
      countryInfo.code == 'CA' ||
      countryInfo.code == 'AU') {
      return (
        <View key = {countryInfo.code}>
          <CheckBox key = {countryInfo.name}
            containerStyle = {selStyles.countryCheckboxes}
            checkedColor = 'green'
            title={countryInfo.name}
            checked={this.isSelectedCountry(countryInfo.code)}
            onPress = {() => {
              this.setSelectedCountry(countryInfo.code, ['religious', 'national', 'observance'])
            }}
            onIconPress = {() => {
              this.setSelectedCountry(countryInfo.code, ['religious', 'national', 'observance'])

            }}
          />
          {this.buildTypeList(countryInfo)}
        </View>
      )
    }
    else {
      return (
        <View key = {countryInfo.code}>
          <CheckBox key = {countryInfo.name}
            containerStyle = {selStyles.countryCheckboxes}
            checkedColor = 'green'
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
  }
  // -----------------------------------------------------------------------

  render() {
    return (
      <View>
        <Button buttonStyle={selStyles.buttonStyle} title = "Choose Countries"
          onPress = {() => {
            this.openModal() }}
          />
        <Modal visible={this.state.selModalVisible}
        >
          <View style = {selStyles.modalContent}>
            <FlatList data = {countryOptions}
              extraData = {this.state}
              initialNumToRender={20}
              renderItem = {(feedItem) => {
                return(this.buildCountryList(feedItem.item)) }}
              keyExtractor={(item, index) => index.toString()} />
            <View style={{flexDirection:"row"}}>
              <View style={{flex:1}}>
                <Button titleStyle = {selStyles.clearButtonTitle} buttonStyle={selStyles.clearButtonStyle}
                  title="Clear" type = "outline"
                  onPress= {() => {
                    this.clearSelected()}} />
              </View>
              <Text>{" "}</Text>
              <View style={{flex:1}}>
                <Button buttonStyle={selStyles.buttonStyle} title="Close"
                  onPress= {() => {
                    this.exitModal()}} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default Selection;