// Реализация отображения страниц пагинации

// В нашем html-коде изначально указывался точный путь к иконкам src/img/icons.svg
// Но Parcel при работе создает свой файл для иконок в паке dist (например, icons.c4b52749.svg ищет иконки там). Поэтому иконки отображатьс не будут.
// Чтобы решить этот вопрос, мы ИМПОРТИРУЕМ иконки сразу в наш скрипт и будем использовать импортируемые иконки:
// Переменная icons будет содердать в итоге прото ссылку на файл с иконками (разный синтаксис для разных версий Parcel):
// import icons from '../img/icons.svg'; // for Parcel v.1
import icons from 'url:../../img/icons.svg'; // for Parcel v.2

import View from './View.js';

// Отображение результатов поиска на странице
class AddRecipeView extends View {
  // Форма для заполнения рецепта
  _parentElement = document.querySelector('.upload');

  // Сообщение в случае успешной загрузки рецепта
  _message = 'Ricepe was successfully uploaded ;)';

  // Контейнер для формы с рецептом
  _window = document.querySelector('.add-recipe-window');

  // Задний затемненый расплывчатый фон
  _overlay = document.querySelector('.overlay');

  // Кнопка для вызова окна добавления рецепта
  _btnOpen = document.querySelector('.nav__btn--add-recipe');

  // Кнопка для закрытия окна добавления рецепта
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  // Функция для показа/скрытия модального окна добаления рецепта
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  // Обработчик отлавливает клик по кнопке Add Recipe и вызывает метод показа/скрытия модального окна
  // Если бы указали код внутри addEventListener
  // this._overlay.classList.toggle('hidden');
  // this._window.classList.toggle('hidden');
  // this указывало бы НА ОБЪЕКТ, на который повешен addEventListener (в данном случае this._btnOpen) и код бы не работалю. Поэтому мы вынесли код в отдельный метод и вызываем метод с помощью bind

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();

      // Создание объекта формы. В FormData надо передать параметр - саму форму.
      // Т.к. мы в данный момент находимся в обработчике, установленном на .upload, this будет указывать на .upload, т.е. на саму форму
      const dataArray = [...new FormData(this)];

      // Object.fromEntries преобразует список пар ключ-значение в объект
      const data = Object.fromEntries(dataArray);
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
