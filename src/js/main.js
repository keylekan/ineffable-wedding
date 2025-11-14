// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'
import {Loader} from '@googlemaps/js-api-loader';
import mapStyles from './mapStyles';

import pin from '../img/pin.png'

// SCROLL EFFECTS

const navBar = document.getElementById("menu");
const navItemRSVP = document.getElementById("nav-item-rsvp");

const timelinePath = document.getElementById("timeline_path")
const timelineLine = document.getElementById("timeline_line")
const timelineLength = timelinePath.getTotalLength()
timelineLine.setAttributeNS(null, "stroke-dasharray", timelineLength);
timelineLine.setAttributeNS(null, "stroke-dashoffset", timelineLength);

window.addEventListener('scroll', () => {
    const el = document.documentElement
    if (el.scrollTop > 100) {
        navBar.classList.add('bg-body-tertiary');
        navBar.classList.remove('py-4');
        navItemRSVP.classList.remove('btn-primary')
        navItemRSVP.classList.add('btn-outline-primary')
    } else {
        navBar.classList.remove('bg-body-tertiary');
        navBar.classList.add('py-4');
        navItemRSVP.classList.remove('btn-outline-primary')
        navItemRSVP.classList.add('btn-primary')
    }

    const rect = timelineLine.getBoundingClientRect()
    const offset = el.scrollTop + rect.top - el.clientHeight * 0.5
    const totalHeight = offset + rect.height
    const scrollTop = el.scrollTop - offset

    const dashoffset = timelineLength - scrollTop * timelineLength / (totalHeight - offset);
    timelineLine.setAttributeNS(null, "stroke-dashoffset", dashoffset);
})


// SHOW MAP
const loader = new Loader({
    apiKey: import.meta.env.VITE_MAPS_API_KEY,
    version: "weekly",
});

loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary("maps");

    const position = { lat: 50.46441, lng: 4.03922 }

    const map = new Map(document.getElementById("map"), {
        center: position,
        zoom: 17,
        mapTypeControl: false,
        streetViewControl: false,
        styles: mapStyles,
    });

    const marker = new google.maps.Marker({
        position,
        map,
        icon: pin,
    });

    marker.addListener('click', () => {
        const info = document.getElementById("map-info")
        if (info.style.display === "none") {
            info.style.display = "block";
        } else {
            info.style.display = "none";
        }
    })
});


// COUNTDOWN
const countDownDate = new Date(2025, 8, 20, 15);

// Update the countdown every 1 second
const x = setInterval(function() {
    // Get today's date and time
    const now = new Date().getTime();

    // Find the distance between now and the countdown date
    const distance = countDownDate - now;

    // If the countdown is finished, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
    } else {
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result
        document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
        document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');
    }
}, 1000);

const scriptURL = import.meta.env.VITE_GOOGLE_FORM_URL
const form = document.forms['rsvp-form']

form.addEventListener('submit', e => {
    e.preventDefault()

    const button = form.elements.submitButton
    const loader = document.getElementById('submit-loader')

    button.disabled = true
    loader.classList.remove('visually-hidden');

    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(() => {
            form.reset();
            button.disabled = false
            loader.classList.add('visually-hidden');
            new bootstrap.Modal('#successModal').show()
        })
        .catch(() => {
            button.disabled = false
            loader.classList.add('visually-hidden');
            new bootstrap.Modal('#failureModal').show()
        })
})
