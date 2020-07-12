'use strict';
const button = document.querySelector('.js-btn');
const inputValue = document.querySelector('.js-input-value');
const searchBox = document.querySelector('.js-search-results-container');
const resultsList = document.querySelector('.js-search-results-list');
const favoriteBox = document.querySelector('.js-favorites-list-container');
const defaultImg = 'https://via.placeholder.com/210x295/ffffff/666666/';
button.addEventListener('click', getData);

let serials = [];
let favorites = [];
//FUNCIÓN PARA HACER LA PETICION AL SERVIDOR
function getData(ev) {
  ev.preventDefault();
  const searchValue = inputValue.value;
  fetch('http://api.tvmaze.com/search/shows?q=' + searchValue)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      serials = data;
      paintSerials(serials);
    })
    .catch((error) => console.log(error));
}

function paintSerials(serials) {
  let codeHTML = '';
  for (let index = 0; index < serials.length; index++) {
    let isFav;
    if (isSerialFavorited(serials[index].show.id)) {
      isFav = 'fav';
    } else {
      isFav = 'non-fav';
    }
    codeHTML += `<li class="js-serial-element ${isFav}" id="${serials[index].show.id}">`;
    let image = serials[index].show.image
      ? serials[index].show.image.medium
      : defaultImg;
    codeHTML += `<img src="${image}" alt="${serials[index].show.name}" class="serial-img"/>`;
    codeHTML += `<h3 class="serial-title" >${serials[index].show.name} </h3>`;
    codeHTML += `</li>`;
  }
  resultsList.innerHTML = codeHTML;
  listenClickedSerial();
}

function listenClickedSerial() {
  const elementList = document.querySelectorAll('.js-serial-element');
  for (let index = 0; index < elementList.length; index++) {
    const element = elementList[index];
    element.addEventListener('click', clickedSerial);
  }
}

function isSerialFavorited(id) {
  const favorited = favorites.find(
    (favoriteItem) => favoriteItem.show.id === id
  );
  return favorited;
}

function clickedSerial(ev) {
  const element = ev.currentTarget;
  const clickedId = parseInt(element.id);
  const serial = serials.find((serialItem) => serialItem.show.id === clickedId);
  const favorited = isSerialFavorited(clickedId);
  if (!favorited) {
    favorites.push(serial);
    element.classList.add('fav');
    element.classList.remove('non-fav');
  } else {
    const favoritedIndex = favorites.findIndex(
      (favoriteItem) => favoriteItem.show.id === clickedId
    );
    favorites.splice(favoritedIndex, 1);
    element.classList.remove('fav');
    element.classList.add('non-fav');
  }
  saveFavoritesLocalStorage();
  updateFavorites();
}

function saveFavoritesLocalStorage() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavorites() {
  let codeHTML = '';
  for (let index = 0; index < favorites.length; index++) {
    codeHTML += `<li class="js-serial-element" id="${favorites[index].show.id}">`;
    let image = favorites[index].show.image
      ? favorites[index].show.image.medium
      : defaultImg;
    codeHTML += `<img src="${image}" alt="${favorites[index].show.name}" class="serial-img"/>`;
    codeHTML += `<h3 class="serial-title" >${favorites[index].show.name} </h3>`;
    codeHTML += `<button class="remove-btn js-remove-btn" data-index="${index}">X</button>`;
    codeHTML += `</li>`;
  }
  favoriteBox.innerHTML = codeHTML;
  if (favorites.length >= 1) {
    btnReset.classList.remove('hidden');
  } else {
    btnReset.classList.add('hidden');
  }
  listenClickRemove();
}

function restoreFavorites() {
  const savedFavorites = localStorage.getItem('favorites');
  if (savedFavorites) {
    favorites = JSON.parse(savedFavorites);
    updateFavorites();
  }
}

window.addEventListener('load', restoreFavorites);

const btnReset = document.querySelector('.js-btn-remove-all');

function resetFavList() {
  favorites = [];
  updateFavorites();
  paintSerials(serials);
  localStorage.removeItem('favorites');
}

btnReset.addEventListener('click', resetFavList);

function listenClickRemove() {
  const buttons = document.querySelectorAll('.js-remove-btn');
  for (let index = 0; index < buttons.length; index++) {
    const element = buttons[index];
    element.addEventListener('click', removeFavItem);
  }
}

function removeFavItem(ev) {
  const element = ev.currentTarget;
  favorites.splice(element.dataset.index, 1);
  updateFavorites();
  saveFavoritesLocalStorage();
  paintSerials(serials);
}
