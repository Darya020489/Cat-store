// // Import vendor jQuery plugin example
// import '~/app/libs/mmenu/dist/mmenu.js'

import { createEl } from "./create_elements.js";

const API = "https://6320001b9f82827dcf22a81e.mockapi.io/api/animals";
const logoImgSrc =
  "https://s.rbk.ru/v1_companies_s3/resized/1200xH/media/trademarks/5572fccc-e9a9-4cbb-bdc7-86331753cf1b.jpg";
const backetImgSrc =
  "https://st.depositphotos.com/1005920/1632/i/950/depositphotos_16327703-stock-photo-shopping-cart-violet-glossy-icon.jpg";

const body = document.querySelector("body");
const app = document.querySelector("#app");
const header = createEl("header", "header");
const reloadBtn = createEl("button", "btn reload-btn");
reloadBtn.style.backgroundImage = `url(${logoImgSrc})`;
const searchInput = createEl("input", "input-search");
searchInput.type = "text";
searchInput.placeholder = "I'm looking for...";
const basketBtn = createEl("button", "btn basket-btn");
basketBtn.style.backgroundImage = `url(${backetImgSrc})`;
const themeBtn = createEl("button", "prime-btn theme-btn", "Change theme");
header.append(reloadBtn, searchInput, basketBtn, themeBtn);
app.append(header);

const sortContainer = createEl("div", "sort-block");
const sortTitle = createEl("h2", "sort-title", "Sort:");
const sortDefault = createEl("button", "sort-btn sort-default", "By default");
const sortCheap = createEl("button", "sort-btn sort-cheap", "Cheaper at first");
const sortExpensive = createEl(
  "button",
  "sort-btn sort-expensive",
  "Expensive at first"
);
sortContainer.append(sortTitle, sortDefault, sortCheap, sortExpensive);
const cardsContainer = createEl("div", "cards-container");
app.append(sortContainer, cardsContainer);

let catsList = [];
let basketArr = [];

document.addEventListener("DOMContentLoaded", () => {
  catsList = getDataApi();
  createBasket();
  createModal();
  app.classList.add(localStorage.getItem("theme"));
});

//установка темы####################################################################
themeBtn.addEventListener("click", () => {
  let theme = localStorage.getItem("theme");
  if (theme === "dark") {
    localStorage.setItem("theme", "light");
    app.classList.remove(theme);
    app.classList.add("light");
  } else {
    localStorage.setItem("theme", "dark");
    app.classList.remove(theme);
    app.classList.add("dark");
  }
});

//отправка запроса####################################################################
async function getDataApi() {
  try {
    let response = await fetch(API);
    let data = await response.json();
    catsList = data;
    catsList.forEach((el, i) => (el.image += `?random=${i + 1}`));
    renderCatsList(catsList);
  } catch (error) {
    console.error(error);
  }
}

//рендерим список######################################################################
function renderCatsList(array) {
  cardsContainer.innerHTML = "";
  array.forEach((cat) => {
    renderCat(cat);
  });
}

//рендерим карточку####################################################################
function renderCat(catCard) {
  const card = createEl("div", "card");
  card.id = `${catCard.id}`;
  const cardWrap = createEl("div", "card__wrap");
  const cardImg = createEl("img", "card__img");
  cardImg.src = `${catCard.image}`;
  cardWrap.append(cardImg);
  const cardInfo = createEl("div", "card__info");
  const cardPriceInner = createEl("div", "card__price-inner");
  const cardPrice = createEl("p", "card__price", `${catCard.price}$`);
  const cardBtn = createEl("button", "prime-btn card__btn", "Add to basket");
  cardPriceInner.append(cardPrice, cardBtn);
  const cardDescInner = createEl("div", "card__desc-inner");
  const cardName = createEl("p", "card__name", `${catCard.name}`);
  const cardCharacter = createEl("p", "card__character");
  if (catCard.tender === true) {
    cardCharacter.textContent = "tender";
  }
  cardDescInner.append(cardName, cardCharacter);
  cardInfo.append(cardPriceInner, cardDescInner);
  card.append(cardWrap, cardInfo);
  cardsContainer.append(card);
}

//создание корзины################################################################
function createBasket() {
  let basket = createEl("div", "basket");
  app.append(basket);
  let basketInner = createEl("div", "basket__inner");
  let basketTitle = createEl("div", "basket__title", "Basket");
  let basketList = createEl("ul", "basket__list");
  let basketTotal = createEl(
    "div",
    "basket__total",
    "Your shopping cart is empty"
  );
  basketInner.append(basketTitle, basketList, basketTotal);
  basket.append(basketInner);
}

//создание модалки################################################################
function createModal() {
  let modal = createEl("div", "modal");
  app.append(modal);
  let modalInner = createEl("div", "modal__inner");
  let modalImg = createEl("img", "modal__img");
  let modalTitle = createEl("p", "modal__title");
  modalInner.append(modalImg, modalTitle);
  modal.append(modalInner);
}

//клик сортировки########################################################################################
sortContainer.addEventListener("click", ({ target }) => {
  if (target.classList.contains("sort-btn")) {
    clearSortBtn();
    target.style.color = "red";
    sortCatsList(target);
  }
});

//очищаем стили кнопок сортировки####################################################################
function clearSortBtn() {
  let sortBtnList = sortContainer.querySelectorAll(".sort-btn");
  sortBtnList.forEach((btn) => {
    btn.style.color = "";
  });
}

//сортировка########################################################################################
function sortCatsList(target) {
  let tempCatsList = [...catsList];
  if (target.classList.contains("sort-cheap")) {
    tempCatsList.sort((a, b) => +a.price - +b.price);
    renderCatsList(tempCatsList);
  } else if (target.classList.contains("sort-expensive")) {
    tempCatsList.sort((a, b) => +b.price - +a.price);
    renderCatsList(tempCatsList);
  } else if (target.classList.contains("sort-default")) {
    renderCatsList(catsList);
  }
}

//клик по главной кнопке########################################################################################
reloadBtn.addEventListener("click", () => {
  renderCatsList(catsList);
  clearSortBtn();
});

//поиск########################################################################################
searchInput.addEventListener("input", () => {
  let filterList = catsList.filter((el) => {
    return (el.name + el.price)
      .toLowerCase()
      .includes(searchInput.value.toLowerCase());
  });
  console.log(filterList);
  renderCatsList(filterList);
});

//добавление в корзину########################################################################################
cardsContainer.addEventListener("click", ({ target }) => {
  if (target.classList.contains("card__btn")) {
    let catToBasket = catsList.find(
      (el) => target.closest(".card").id === el.id
    );
    basketArr.push(catToBasket);
    fillBasket();
  }
});

//заполнение корзины################################################################
function fillBasket() {
  let basketList = document.querySelector(".basket__list");
  basketList.innerHTML = "";
  basketArr.forEach((el) => {
    let basketEl = createEl("li", "basket__el");
    basketEl.id = `${el.id}`;
    let basketWrap = createEl("div", "basket__wrap");
    let basketImg = createEl("img", "basket__img");
    basketImg.src = el.image;
    basketWrap.append(basketImg);
    let basketName = createEl("p", "basket__name", `${el.name}`);
    let basketPrice = createEl("p", "basket__price", `${el.price}`);
    let basketDelBtn = createEl("button", "basket__del-btn", "delete");
    basketEl.append(basketWrap, basketName, basketPrice, basketDelBtn);
    basketList.append(basketEl);
  });
  let basketTotal = document.querySelector(".basket__total");
  basketTotal.textContent = calcBasketRezult();
}

//рассчет результата корзины################################################################
function calcBasketRezult() {
  if(basketArr.length === 0){
    return "Your shopping cart is empty";
  }else{
    let basketRez = basketArr.reduce((sum, el) => (sum += +el.price), 0);
  return `Total: ${basketRez.toFixed(2)}`;
  }
  
}

//открытие корзины################################################################
basketBtn.addEventListener("click", () => {
  let basket = document.querySelector(".basket");
  basket.style.display = "flex";
  body.style.overflow = "hidden";
    //удаление из корзины################################################################
// let basket = document.querySelector('.basket');
// console.log(basket);
//???????????????????????????????????????????????????????
let basketList = document.querySelector('.basket__list');
basketList.addEventListener('click', ({target}) => {
if(target.classList.contains('basket__del-btn')){
  let elementId = target.closest('.basket__el').id;

  let deleteIndex = basketArr.findIndex((cat) => cat.id === elementId);
  basketArr.splice(deleteIndex, 1);
  console.log(basketArr);
  fillBasket();

}
});
  //закрытие корзины################################################################
  basket.addEventListener("click", ({ target }) => {
    console.log(target.closest(".basket__inner"));
    //????????????????????????????????????????????????????????
    if (!target.closest(".basket__inner") && !target.classList.contains('.basket__del-btn')) {
      // console.log(target.closest(".basket__inner"));
      basket.style.display = "none";
      body.style.overflow = "";
    }
  });
});

//открытие модалки################################################################
cardsContainer.addEventListener("click", ({ target }) => {
  if (target.closest(".card") && !target.classList.contains("card__btn")) {
    let card = target.closest(".card");
    let catCard = catsList.find((el) => el.id === card.id);
    openModal(catCard);
    body.style.overflow = "hidden";
  }
  //закрытие модалки################################################################
  let modal = document.querySelector(".modal");
  modal.addEventListener("click", ({ target }) => {
    if (!target.closest(".modal__inner")) {
      modal.style.display = "none";
      body.style.overflow = "";
    }
  });
});

function openModal(cat) {
  let modal = document.querySelector(".modal");
  modal.style.display = "flex";
  let modalImg = document.querySelector(".modal__img");
  modalImg.src = cat.image;
  let modalTitle = document.querySelector(".modal__title");
  modalTitle.textContent = cat.name;
}

//   //удаление из корзины################################################################
// let basket = document.querySelector('.basket');
// console.log(basket);
// basket.addEventListener('click', ({target}) => {
// if(target.classList.contains('basket__del-btn')){
//   let idx = target.closest('.basket__el').id;
//   let a = basketArr.indexOf(item.id ===idx);
//   console.log(a);
//   // letbasketArr.find((el) => {

//   // });
// }
// });