// Генерация html-кода для одного элемента из списка закладок

// В нашем html-коде изначально указывался точный путь к иконкам src/img/icons.svg
// Но Parcel при работе создает свой файл для иконок в паке dist (например, icons.c4b52749.svg ищет иконки там). Поэтому иконки отображатьс не будут.
// Чтобы решить этот вопрос, мы ИМПОРТИРУЕМ иконки сразу в наш скрипт и будем использовать импортируемые иконки:
// Переменная icons будет содердать в итоге прото ссылку на файл с иконками (разный синтаксис для разных версий Parcel):
// import icons from '../img/icons.svg'; // for Parcel v.1
import icons from 'url:../../img/icons.svg'; // for Parcel v.2

import View from './View.js';

// Генерация html-кода для одного элемента из списка закладок
class PreviewView extends View {
  _parentElement = '';

  // Генерируем html-код для одного элемента в списке закладок
  _generateMarkup() {
    // Для того, чтобы выделить активный (выбранный) рецепт в списке закладок, будем сравнивать id каждого рецепта с хэшем в адресной строке. Если совпадает, добавляем элементу еще один класс
    const id = window.location.hash.slice(1);

    return `
    <li class="preview">
    <a class="preview__link ${
      this._data.id === id ? 'preview__link--active' : ''
    }" href="#${this._data.id}">
      <figure class="preview__fig">
        <img src="${this._data.image}" alt="${this._data.title}" />
      </figure>
      <div class="preview__data">
        <h4 class="preview__title">${this._data.title}</h4>
        <p class="preview__publisher">${this._data.publisher}</p>
      </div>
    </a>
  </li>
  `;
  }
}

export default new PreviewView();
