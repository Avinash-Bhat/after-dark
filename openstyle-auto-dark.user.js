// ==UserScript==
// @name         Stylus Auto Dark Helper
// @namespace    https://gitlab.com/Avinash-Bhat/after-dark
// @version      1.0
// @description  Enable Stylus Dark-mode automaticaly based on your location.
// @author       Avinash R<nashpapa+tmky at gmail dot com>
// @match        https://www.gitlab.com/*
// @match        https://github.com/*
// @match        https://golang.org/*
// @match        https://*.grafana.com/docs/*
// @match        https://www.jetbrains.com/help/*
// @match        *://prometheus.io/docs/*
// @match        */actuator/*
// @require      https://momentjs.com/downloads/moment-with-locales.min.js
// @grant        GM_xmlhttpRequest
// @connect      api.sunrise-sunset.org
// ==/UserScript==

/* global moment:readonly */

// change this if you don't want to get the location using browser. Set this to undefined otherwise
const DEFAULT_LOC = {
    coords: {
        latitude: 9.89554755864844,
        longitude: 76.73922735930775
    }
}
const KEY_LOCATION = '__tmky_stylsh_dark_loc'
const darkClass = '__stylish_dark'

function enableDark() {
    document.querySelector('html').classList.add('__stylish_dark');
}

function disableDark() {
    document.querySelector('html').classList.remove('__stylish_dark');
}

function scheduleTheme(sunrise, sunset) {
    let now = moment();
    let time = now.isAfter(sunrise) && now.isBefore(sunset) ? now.diff(sunset) : now.diff(sunrise);
    console.log('scheduling for theme change in:', time + 'ms');
    setTimeout(function() {
        changeTheme(sunrise, sunset);
    }, time)
}

function changeTheme(sunrise, sunset) {
    let now = moment();
    if (now.isAfter(sunrise) && now.isBefore(sunset)) {
        disableDark();
    } else {
        enableDark();
    }
}

function getSunData(latitude, longitude) {
    let url = 'https://api.sunrise-sunset.org/json?formatted=0&lat=' + latitude + '&lng=' + longitude;
    console.log('url:', url)
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function(res) {
            let data = JSON.parse(res.responseText);
            let { sunrise, sunset } = data.results;
            sunrise = moment(sunrise);
            sunset = moment(sunset);
            console.log('sunrise:', sunrise.format('LTS'), ', sunset:', sunset.format('LTS'), ', now:', moment().format('LTS'));
            changeTheme(sunrise, sunset);
            scheduleTheme(sunrise, sunset);
        }
    });
}

let cachedLocation = DEFAULT_LOC || (localStorage.getItem(KEY_LOCATION) ? JSON.parse(localStorage.getItem(KEY_LOCATION)) : undefined);

if (!cachedLocation) {
    navigator.geolocation.getCurrentPosition(function(location) {
        console.log(location.coords);
        localStorage.setItem(KEY_LOCATION, JSON.stringify(location))
        getSunData(location.coords.latitude, location.coords.longitude)
    });
} else {
    console.log('using cached location: ', cachedLocation.coords);
    getSunData(cachedLocation.coords.latitude, cachedLocation.coords.longitude)
}