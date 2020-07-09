'use strict';
const button = document.querySelector('.js-btn');
const inputValue = document.querySelector('.js-input-value');
const searchBox = document.querySelector('.js-search-results-container');
const resultsList = document.querySelector('.js-search-results-list');
const favoriteBox = document.querySelector('.js-favorites-list-container');

button.addEventListener('click', getData);
//FUNCIÓN PARA HACER LA PETICICION AL SERVIDOR
function getData(ev) {
  ev.preventDefault();
  const searchValue = inputValue.value;
  fetch('http://api.tvmaze.com/search/shows?q=' + searchValue)
    .then((response) => {
      return response.json();
    })
    .then((jsonResponse) => {
      console.log(jsonResponse);
    })
    .catch((error) => console.log(error));
}
