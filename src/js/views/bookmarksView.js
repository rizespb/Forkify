// Отображение списка закладок в блоке Закладки

// В нашем html-коде изначально указывался точный путь к иконкам src/img/icons.svg
// Но Parcel при работе создает свой файл для иконок в паке dist (например, icons.c4b52749.svg ищет иконки там). Поэтому иконки отображатьс не будут.
// Чтобы решить этот вопрос, мы ИМПОРТИРУЕМ иконки сразу в наш скрипт и будем использовать импортируемые иконки:
// Переменная icons будет содердать в итоге прото ссылку на файл с иконками (разный синтаксис для разных версий Parcel):
// import icons from '../img/icons.svg'; // for Parcel v.1
import icons from 'url:../../img/icons.svg'; // for Parcel v.2

import View from './View.js';
import previewView from './previewView.js';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');

  // Сообщение об ошибке
  _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it ;)';

  // Сообщение об успехе
  _message = '';

  // Обработчик событий для вывода списка закладок из локального хранилища (кэш) сразу после загрузки страницы
  // Паттерн Publisher - Subscriber
  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  // Генерируем html-код для всех элементов в списке закладок
  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarksView();
