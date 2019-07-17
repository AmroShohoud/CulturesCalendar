import React, {Component} from 'react'
import {_storeData, _retrieveData} from './utils/AsyncData'
import {TaskManager, BackgroundFetch} from 'expo'

TaskManager.defineTask('updateHolidays', async () => {
  try {
    var lastUpdate = await _retrieveData('lastUpdate')
    // var nextUpdate = new Date(lastUpdate.setMonth(lastUpdate.getMonth()+1));
    var nextUpdate = lastUpdate.setHours(lastUpdate.getHours(),lastUpdate.getMinutes()+1,0,0);
    var current = new Date().getDate();
    if (current < nextUpdate) {
      var urls = _retrieveData('urlCache')
      console.log("updating")
    }
    const receivedNewData = true
    return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

BackgroundFetch.registerTaskAsync('updateHolidays', {minimumInterval: 60})

