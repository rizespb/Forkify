// Для проекта используется API, разработанный Jonas специально для проекта
// https://forkify-api.herokuapp.com/v2

// Файл controller содержит функции-контроллеры для управления другими частями программы

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// Фишка Parcel. Это не ностоящий JS
// вносить изменения в JavaScript без перезагрузки страницы
// if (module.hot) {
//   module.hot.accept();
// }

////////////////////////////////////////////
// Функция-контроллер загрузки и вывода рецепта
// Функция async, т.к. вызывает асинхронную функцию loadRecipe
const controlRecipes = async function () {
  try {
    // Сохраняем hash в переменную id, начиная со второго символа (без hash-символа), чтобы получить ID рецепа
    const id = window.location.hash.slice(1);

    // Если в адресе отсуствует хэш, прерываем выполнение функции
    if (!id) return;

    // Загружаем спиннер
    recipeView.renderSpinner();

    // Выделяем в списке результатов запроса активный (выбранный) рецепт
    // Спомощью метода update мы обновляем только те узлы, которые изменяются, а не перезагружаем блок результатов полностью
    resultsView.update(model.getSearchResultsPage());

    // Обновляем список в списке закладок, чтобы текущий рецепт был выделен (если он присуствует в списке закладок)
    bookmarksView.update(model.state.bookmarks);

    // Loading Recipe
    await model.loadRecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

// Функция-контроллер обработки результатов поискового запроса
const controllerSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // Сохраняем запрос в переменную query
    const query = searchView.getQuery();
    if (!query) return;

    // Получаем результаты поиска по запросу query и сохраняем их объект state в файле model.js (это делает loadSearchResults)
    await model.loadSearchResults(query);

    // Выводим результаты поиска на экран
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // Выводим начальные кнопки пагинации
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// Функция-контроллер перемещений между страницами пагинации Page
const controlPagination = function (goToPage) {
  // Выводим НОВЫЕ результаты поиска на экран
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Выводим НОВЫЕ кнопки пагинации
  paginationView.render(model.state.search);
};

// Функция - контроллер количества порций
const controlServings = function (newServings) {
  // Обновить servings (порции) in state
  model.updateServings(newServings);

  // Обновить отображение рецепта на странице
  // recipeView.render(model.state.recipe);

  // Обновить только часть страницы, которая изменяется (без обновления контейнера для рецепта recipe целиком)
  recipeView.update(model.state.recipe);
};

// Функция-контроллер добавления рецепта в закладки
const controlAddBookmarks = function () {
  // Добавляем свойство bookmarked: true в текущий рецепт или удаляем в зависимости от первоначального состояния (добавляем или удалем из закладок)
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // Обновляем значок закладки на странице
  recipeView.update(model.state.recipe);
  console.log(model.state.bookmarks);

  // Выводим список закладок в блок закладки
  bookmarksView.render(model.state.bookmarks);
};

// Вывод списка закладок, получаемго из локального хранилща
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// Функция контроля добавления рецепта
const controlAddRecipe = async function (newRecipe) {
  try {
    // Загружаем спиннер
    addRecipeView.renderSpinner();

    // Загружаем новый рецепт
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Выводим на экран загруженный рецепт
    recipeView.render(model.state.recipe);

    // Выводим сообщение об успешной загрузке рецепта
    addRecipeView.renderMessage();

    // Обновляем список закладок (загруженный рецепт добавляется в закладки)
    bookmarksView.render(model.state.bookmarks);

    // Меняем ID в url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Закрываем форму отправки запроса
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

// Реаллизаци Publisher - Sunsriber паттерна
// Обработкич событий находится в recipeView (другой в searchView). Обработчик addHandlerRender (или addHandlerSearch) является Издателем, который не знает о существовании в controller функции controlRecipes
// Ниже мы передаем ему неизвестную ему функция controlRecipes (или controllerSearchResults) в качестве аргумента
// Subscriber в данном случае наш модуль controller.js
const init = function () {
  // Вывод списка закладок, получаемго из локального хранилща
  bookmarksView.addHandlerRender(controlBookmarks);

  // Вывод рецепта на экран
  recipeView.addHandlerRender(controlRecipes);

  // Отлавливание клика по кнопкам изменения количества порций
  recipeView.addHandlerUpdateServings(controlServings);

  // Отлавливаем клик по кнопке добавления в закладки
  recipeView.addHandlerAddBookmark(controlAddBookmarks);

  // Отлавливание поискового запроса и Вывод результатов поиска
  searchView.addHandlerSearch(controllerSearchResults);

  // Отлавливание кликов по кнопкам пагинации Page
  paginationView.addHandlerClick(controlPagination);

  // Отлавливание клика по кнопке загрузки добавленного рецепта
  addRecipeView.addHandlerUpload(controlAddRecipe);

  console.log('Welcome');
};

init();
