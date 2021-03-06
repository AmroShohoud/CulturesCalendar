import {_retrieveData} from '../utils/AsyncData'
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
export async function MakeAPICall (country, url, urlCache) {
  var holidays = []
  if (url in urlCache) {
    holidays = urlCache[url]
  }
  else {
    holidays = await fetch(url)
      .then(response => {
        return response.json()
      })
      .then(myJson => {
        return myJson.response.holidays
      }).catch(err => {
        console.log(err)
        return "error"
      })
    if (holidays == "error") {
      return "error"
    }
    urlCache[url] = holidays
  }

  var holidaysObj = {countryLong: countryCodeOptions[country], code: country,
          holidays: holidays}
  return({urlCache: urlCache, holidaysObj: holidaysObj})
}

// build url strings based on countries and years
export function CreateWebAddresses (countries) {
  var years = getYears()
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
export function CreateDateMarkers (holidayArray) {

  localMarkers = {}
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

      // Be able to incorporate multiple holidays on same day
      if (holiday.date.iso in localMarkers) {
        // Do not save duplicates (API we are using has some)
        if (!(localMarkers[holiday.date.iso].dots[0].name == holiday.name &&
          localMarkers[holiday.date.iso].dots[0].description == holiday.desc &&
          localMarkers[holiday.date.iso].dots[0].country == holiday.country)) {
          localMarkers[holiday.date.iso].dots.push(markerObj)
        }
      }
      else {
        localMarkers[holiday.date.iso] = {dots: [markerObj]}
      }
    }
  }
  return localMarkers
}

// schedule notification for holiday
function ScheduleNotification (country, holiday, desc, date) {
  var body = country
  if (desc != null) {
    body = body + ": " + desc
  }
  var result = Notifications.scheduleLocalNotificationAsync(
    {
      title: holiday,
      body: body
    },
    {
      time: date
    }
  )
  return result
}
// -------------------------------------------------------------------------

// exported functions for app usage ----------------------------------------

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

export function dateToUTC(date, time) {
  var date = new Date(date+time)
  var dateUTC = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  return dateUTC
}

// Put holidays into format to pass into the Calendar component for marking dates of holidays
// and set them as notifications
export async function ScheduleAllNotifications (holidayArray, time) {
  // Cancel all previously scheduled notifications
  // (because we will reschedule the notifications the user has chosen)
  await Notifications.cancelAllScheduledNotificationsAsync()

  if (holidayArray.length <= 0) {
    return
  }

  // Create array of holiday objects sorted by date
  // We will pick the first 50 objects in this array
  // Used to handle iOS (64) and Android (50) notification limits
  var sortedHolidayArray = []
  for (var i = 0; i < holidayArray.length; i++) {
    for (var j = 0; j < holidayArray[i].holidays.length; j++) {
      var holiday = holidayArray[i].holidays[j]
      // Get rid of 'holidays' just as summmer solstice
      if (!holiday.type.includes("Season") && holiday.type[0] != "Clock change\/Daylight Saving Time") {
        var dateUTC = dateToUTC(holiday.date.iso, time)
        if (dateUTC > new Date()) {
          holiday['dateUTC'] = dateUTC
          holiday['countryLong'] = holidayArray[i].countryLong
          sortedHolidayArray.push(holiday)
        }
      }
    }
  }

  var date_sort_asc = function (holiday1, holiday2) {
    // This is a comparison function that will result in dates being sorted in
    // ASCENDING order
    if (new Date(holiday1.date.iso) > new Date(holiday2.date.iso)) return 1
    if (new Date(holiday1.date.iso) < new Date(holiday2.date.iso)) return -1
    return 0;
  }
  sortedHolidayArray.sort(date_sort_asc)

  // schedule holiday notifications
  var maxK = sortedHolidayArray.length < 50 ? sortedHolidayArray.length : 50
  for (var k = 0; k < maxK; k++) {
    var holiday = sortedHolidayArray[k]
    ScheduleNotification(holiday.countryLong, holiday.name, holiday.description, holiday.dateUTC)
  }
}

// -------------------------------------------------------------------------

// exported functions for background updates -------------------------------

// checks if holidays for a url are cached, if not makes API call
async function MakeAPICalls (countries, years, urlCache) {
  var holidays = []
  var allHolidays = []
  var localCache = {}
  var urls = CreateWebAddresses(countries, years)
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i].url
    var country = urls[i].country
    if (url in urlCache) {
      holidays = urlCache[url]
      allHolidays = allHolidays.concat({countryLong: countryCodeOptions[country], code: country,
        holidays: holidays})
      localCache[url] = holidays
    }
    else {
      holidays = await fetch(url)
        .then(response => {
          return response.json()
        })
        .then(myJson => {
          return myJson.response.holidays
        }).catch(err => {
          console.log(err)
          return "error" //TODO check this and add modal that shows error message
        })
      if (holidays == "error") {
        return "error"
      }
      localCache[url] = holidays
      allHolidays = allHolidays.concat({countryLong: countryCodeOptions[country], code: country,
        holidays: holidays})
    }
  }
  return({urlCache: localCache, allHolidays: allHolidays})
}

// this method hooks into all the processing that goes into building our
// country holiday objects
export async function GetHolidayData (selectedCountries, firstLaunch, urlCache) {
  // Set these empty values to avoid errors during rendering empty calendar
  var localMarkers = {}
  var localCountries = {}
  var localUrlCache = {}
  var allHolidaysArray = []
  var years = getYears()

  // first time app is being launched
  // (want to have default holidays so user can see functionality)
  if (firstLaunch == null) {
    // set up our defaults
    localCountries = {'US': ['religious'], 'EG': ['all']}

    // get data and create markers for calendar object
    var results = await MakeAPICalls(localCountries, years, urlCache)
    if (results == "error") {
      return "error"
    }
    localUrlCache = results.urlCache
    allHolidaysArray = results.allHolidays
    localMarkers = await CreateDateMarkers(allHolidaysArray)
  }
  // User has countries selected
  else if (selectedCountries != null) {
    // Set this empty value to avoid errors during rendering empty calendar
    localCountries = selectedCountries

    // get data and create markers for calendar object
    var results = await MakeAPICalls(localCountries, years, urlCache)
    if (results == "error") {
      return "error"
    }
    localUrlCache = results.urlCache
    allHolidaysArray = results.allHolidays
    localMarkers = await CreateDateMarkers(allHolidaysArray)
  }
  var d = new Date()
  var lastUpdated = {date: d}
  return {
    allHolidaysArray: allHolidaysArray,
    localMarkers: localMarkers,
    localUrlCache: localUrlCache,
    selectedCountries: localCountries,
    lastUpdate: lastUpdated,
    firstLaunch: {first: false}
  }
}