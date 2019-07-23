import {_storeData, _retrieveData} from '../utils/AsyncData'
import {countryCodeOptions, countryColors} from '../utils/Options'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import * as Permissions from 'expo-permissions'
import {Notifications} from 'expo'

const URL = 'https://calendarific.com/api/v2/holidays?'
const API_KEY = '840729768871697006fe16d7b9292bdf83e0a658'

// Helper functions ---------------------------------------------------------
// Set the years to this year, previous year, and next year
function getYears () {
  var date = new Date()
  var cur = date.getFullYear()
  var prev = cur - 1
  var next = cur + 1
  return [prev, cur, next]
}

// checks if holidays for a url are cached, if not makes API call
async function MakeAPICalls (countries, years, urlCache) {
  var holidays = []
  var allHolidays = []
  var localCache = {}
  var urls = CreateWebAddresses(countries, years)
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i].url
    //console.log(url)
    var country = urls[i].country
    if (url in urlCache) {
      holidays = urlCache[url]
      allHolidays = allHolidays.concat({countryLong: countryCodeOptions[country], code: country,
        holidays: holidays})
      localCache[url] = holidays
    }
    else {
      console.log(url)
      holidays = await fetch(url)
        .then(response => {
          return response.json()
        })
        .then(myJson => {
          return myJson.response.holidays
        }).catch(err => {
          console.log(err) //TODO check this and add modal that shows error message
        })
      localCache[url] = holidays
      allHolidays = allHolidays.concat({countryLong: countryCodeOptions[country], code: country,
        holidays: holidays})
    }
  }
  globalUrlCache = localCache
  _storeData('urlCache', JSON.stringify(localCache))
  return(allHolidays)
}

// build url strings based on user-defined parameters
//parameters will be defined by user to narrow down holiday selection
function CreateWebAddresses (countries, years) {
  var urls = []
  var apiParam = "api_key=" + API_KEY
  var localCountries = Object.keys(countries)

  for (var i = 0; i < years.length; i++) {
    var yearParam = "&year=" + years[i]
    for (var j = 0; j < localCountries.length; j++) {
      var country = localCountries[j]
      var countryParam = "&country=" + country
      var types = countries[country]
      for (var k = 0; k < types.length; k++) {
        var typeParam = ''
        if (types[k] != 'all') {
          typeParam = '&type=' + types[k]
        }
        var url = [URL, apiParam, countryParam, yearParam, typeParam]
        urls = urls.concat({country: country, url: url.join('')})
      }
    }
  }
  return urls
}

// Put holidays into format to pass into the Calendar component for marking dates of holidays
// and set them as notifications
async function CreateDateMarkers (holidayArray) {
  // Cancel all previously scheduled notifications
  // (because we will reschedule the notifications the user has chosen)
  await Notifications.cancelAllScheduledNotificationsAsync()


  var time = 'T00:00'
  var localMarkers = {}

  // Format of objects to be passed into Calendar component's 'markedDates'
  // {'date': {dots: [{key: xxx, name: xxx, color: xxx, description: xxx},
  // {key: yyy, name: yyy, color: yyy, description: yyy}]}}
  for (var i = 0; i < holidayArray.length; i++) {
    for (var j = 0; j < holidayArray[i].holidays.length; j++) {
      var holiday = holidayArray[i].holidays[j]
      var markerObj = {
        key: i + "" + j,
        name: holiday.name,
        desc: holiday.description,
        countryLong: holidayArray[i].countryLong,
        color: countryColors[holidayArray[i].code]
      }

      // schedule holiday notifications
      // TODO offset by local time of country that holiday celebrated in
      if (holiday.type[0] != "Season" && holiday.type[0] != "Clock change\/Daylight Saving Time") {
        var date = new Date(holiday.date.iso+time)
        var dateUTC = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
        if (dateUTC > new Date()) {
          ScheduleNotification(holidayArray[i].countryLong, holiday.name, holiday.description, dateUTC)
        }
      }

      // Be able to incorporate multiple holidays on same day
      if (holiday.date.iso in localMarkers) {
        // Do not save duplicates (API we are using has some)
        if (localMarkers[holiday.date.iso].dots[0].name != holiday.name ||
          localMarkers[holiday.date.iso].dots[0].description != holiday.desc) {
          localMarkers[holiday.date.iso].dots.push(markerObj)
        }
      }
      else {
        localMarkers[holiday.date.iso] = {dots: [markerObj]}
      }
    }
  }
  //await this.setState({markers: localMarkers})
  return localMarkers
}


// schedule notification for holiday
function ScheduleNotification (country, holiday, desc, date) {
  var body = country
  if (desc != null) {
    body = body + ": " + desc
  }
  Notifications.scheduleLocalNotificationAsync(
    {
      title: holiday,
      body: body
    },
    {
      time: date
    }
  )
}
// -------------------------------------------------------------------------

// exported functions ------------------------------------------------------

// alertIfRemoteNotificationsDisabledAsync = async() => {
//   const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
//   if (status !== 'granted') {
//     alert('Enable notifications in settings to receive holiday notifications');
//   }
// }

export async function HasPermissions () {
  var notifs = await Permissions.askAsync(Permissions.NOTIFICATIONS)
  if (notifs.status === 'granted') {
    console.log('Notification permissions granted.')
  }
}


// this method hooks into all the processing that goes into building our
// country holiday objects
export async function GetHolidayData (selectedCountries = null, firstLaunch, urlCache = globalUrlCache) {
  // Set these empty values to avoid errors during rendering empty calendar
  localMarkers = {}
  localCurHolidays = {dots: [{key: ''}]}
  var years = getYears()

  // first time app is being launched
  // (want to have default holidays so user can see functionality)
  if (firstLaunch == null) {
    // set up our defaults
    var countries = {'US': ['religious'], 'EG': ['all']}

    // get data and
    var allHolidays = await MakeAPICalls(countries, years)
    localMarkers = await CreateDateMarkers(allHolidays)
    await _storeData('selected', JSON.stringify(countries))
    await _storeData('firstLaunch', JSON.stringify({first: false}))
  }
  // User has countries selected
  else if (selectedCountries != null) {
     // Set this empty value to avoid errors during rendering empty calendar
     var countries = selectedCountries
    // get data and
    var allHolidays = await MakeAPICalls(countries, years, urlCache)
    localMarkers = await CreateDateMarkers(allHolidays)
    await _storeData('selected', JSON.stringify(countries))
    var d = new Date()
    _storeData('lastUpdate', d.toString())
  }
  return({localMarkers: localMarkers, localCurHolidays: localCurHolidays, countries: countries})
}