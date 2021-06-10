// Отображение результатов поиска на странице

// В нашем html-коде изначально указывался точный путь к иконкам src/img/icons.svg
// Но Parcel при работе создает свой файл для иконок в паке dist (например, icons.c4b52749.svg ищет иконки там). Поэтому иконки отображатьс не будут.
// Чтобы решить этот вопрос, мы ИМПОРТИРУЕМ иконки сразу в наш скрипт и будем использовать импортируемые иконки:
// Переменная icons будет содердать в итоге прото ссылку на файл с иконками (разный синтаксис для разных версий Parcel):
// import icons from '../img/icons.svg'; // for Parcel v.1
import icons from 'url:../../img/icons.svg'; // for Parcel v.2

import View from './View.js';

// Отображение результатов поиска на странице
class ResultsView extends View {
  _parentElement = document.querySelector('.results');

  // Сообщение об ошибке
  _errorMessage = 'No recipes found for your query! Please try again ;)';

  // Сообщение об успехе
  _message = '';

  // Генерируем html-код для всех элементов в результатах поиска
  _generateMarkup() {
    return this._data.map(this._generateMarkupPreview).join('');
  }

  // Генерируем html-код для одного элемента в результатах поиска
  _generateMarkupPreview(result) {
    // Для того, чтобы выделить активный (выбранный) рецепт в списке результатов поиска, будем сравнивать id каждого рецепта с хэшем в адресной строке. Если совпадает, добавляем элементу еще один класс
    const id = window.location.hash.slice(1);

    return `
    <li class="preview">
    <a class="preview__link ${
      result.id === id ? 'preview__link--active' : ''
    }" href="#${result.id}">
      <figure class="preview__fig">
        <img src="${result.image}" alt="${result.title}" />
      </figure>
      <div class="preview__data">
        <h4 class="preview__title">${result.title}</h4>
        <p class="preview__publisher">${result.publisher}</p>
      </div>
    </a>
  </li>
  `;
  }
}

export default new ResultsView();
