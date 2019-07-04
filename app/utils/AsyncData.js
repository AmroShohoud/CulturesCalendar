  import {AsyncStorage} from 'react-native';

  // TODO: if user modifies settings, rerun fetch
 export async function _storeData(key, input) {
    try {
      await AsyncStorage.setItem(key, input);
    } catch (error) {
      console.log(error)
    }
  }

export async function _retrieveData(data) {
  var result = {}
    try {
      const value = await AsyncStorage.getItem(data);
      if (value) {
        result = JSON.parse(value)
      }
    } catch (error) {
      // Error retrieving data
      console.log(error)
    }
    if (isEmpty(result)) {
      return null
    }
    return result
  }

export function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}