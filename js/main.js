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
//FUNCIÓN PARA PINTAR LAS SERIES QUE PROVIENEN DEL FETCH:
function paintSerials(serials) {
  let codeHTML = '';
  for (let index = 0; index < serials.length; index++) {
    //recorremos el array de series:
    //-cambiar el color si es fav o no
    let isFav;
    if (isSerialFavorited(serials[index].show.id)) {
      isFav = 'fav';
    } else {
      isFav = 'non-fav';
    }
    //-añadir al html los elementos de la lista de seriales sustituyendo partes con variables
    codeHTML += `<li class="js-serial-element ${isFav}" id="${serials[index].show.id}">`;
    let image = serials[index].show.image
      ? serials[index].show.image.medium
      : defaultImg;
    codeHTML += `<img src="${image}" alt="${serials[index].show.name}" class="serial-img"/>`;
    codeHTML += `<h3 class="serial-title" >${serials[index].show.name} </h3>`;
    codeHTML += `</li>`;
  }
  //-añadir el html al ul correspondiente
  resultsList.innerHTML = codeHTML;
  listenClickedSerial();
}

//FUNCIÓN PARA IDENTIFICAR LAS SERIES QUE HAN SIDO AÑADIDAS A FAVORITES
function isSerialFavorited(id) {
  const favorited = favorites.find(
    (favoriteItem) => favoriteItem.show.id === id
  );
  return favorited;
}

//FUNCIÓN ESCUCHAR CLICK EN LAS SERIES BUSCADAS:
function listenClickedSerial() {
  const elementList = document.querySelectorAll('.js-serial-element');
  //recorrer todos los li's y escuchar el evento en cada uno
  for (let index = 0; index < elementList.length; index++) {
    const element = elementList[index];
    element.addEventListener('click', clickedSerial);
  }
}

//FUNCIÓN PARA EJECUTAR LAS ACCIONES NECESARIAS EN LOS ELEMENTOS CLICKADOS
//encontrar por id el elem clickado de todo el arrat de serials
function clickedSerial(ev) {
  const element = ev.currentTarget;
  const clickedId = parseInt(element.id);
  const serial = serials.find((serialItem) => serialItem.show.id === clickedId);
  //identificar el elem clickado que se tiene que añadir a fav:
  const favorited = isSerialFavorited(clickedId);
  if (!favorited) {
    //si no era fav añadirlo al array de favorites, añadirle la clase fav(color azul)
    favorites.push(serial);
    element.classList.add('fav');
    element.classList.remove('non-fav');
  } else {
    // si es fav buscar su index en el array de fav y quitarlo del array y su color.
    const favoritedIndex = favorites.findIndex(
      (favoriteItem) => favoriteItem.show.id === clickedId
    );
    favorites.splice(favoritedIndex, 1);
    element.classList.remove('fav');
    element.classList.add('non-fav');
  }
  //actualizar el local storage y la función de pintar los fav a la izquierda
  saveFavoritesLocalStorage();
  updateFavorites();
}

//FUNCIÓN DE AÑADIR A LOCALSTORAGE LOS FAV
function saveFavoritesLocalStorage() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

//FUNCIÓN DE ACTUALIZAR VISUALMENTE EL LISTADO DE FAV RECORRIENDO ESE ARRAY
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
  //CONDICIONAL de que aparezca el botón de borrar todo si hay algun elem en la lista de fav
  if (favorites.length >= 1) {
    btnReset.classList.remove('hidden');
  } else {
    btnReset.classList.add('hidden');
  }
  //escuchar el evento de borrar elem para que se actualice la lista de fav cuando borramos alguna serie
  listenClickRemove();
}

//FUNCIÓN PARA RECUPERAR ELEM DE LA LISTA DE FAV DEL LOCAL STORAGE
function restoreFavorites() {
  const savedFavorites = localStorage.getItem('favorites');
  if (savedFavorites) {
    favorites = JSON.parse(savedFavorites);
    //PINTAR LOS ELEM RECUPERADOS
    updateFavorites();
  }
}
//LA LISTA SE RECUPERA AL REFRESCAR LA PÁGINA
window.addEventListener('load', restoreFavorites);

//FUNCIÓN BORRAR TODA LA LISTA DE FAV
function resetFavList() {
  favorites = [];
  //se actualizan las dos funciones de pintar y se elimina todo de local storage
  updateFavorites();
  paintSerials(serials);
  localStorage.removeItem('favorites');
}

const btnReset = document.querySelector('.js-btn-remove-all');
btnReset.addEventListener('click', resetFavList);

//FUNCIÓN PARA ESCUCHAR EL BOTÓN DE ELIMINAR DE CADA SERIE DE LA LISTA DE FAV
function listenClickRemove() {
  const buttons = document.querySelectorAll('.js-remove-btn');
  //recorrer todo el array de los botones e identificarlos por index
  for (let index = 0; index < buttons.length; index++) {
    const element = buttons[index];
    element.addEventListener('click', removeFavItem);
  }
}

//FUNCIÓN PARA ELIMINAR CADA FAV CORRESPONDIENTE CON EL BOTÓN PULSADO
function removeFavItem(ev) {
  //el evento se aplica sobre cada botón
  const element = ev.currentTarget;
  //quitar de fav el elem con el index especificado en la función de arriba
  favorites.splice(element.dataset.index, 1);
  updateFavorites();
  saveFavoritesLocalStorage();
  paintSerials(serials);
}
