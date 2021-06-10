// В нашем html-коде изначально указывался точный путь к иконкам src/img/icons.svg
// Но Parcel при работе создает свой файл для иконок в паке dist (например, icons.c4b52749.svg ищет иконки там). Поэтому иконки отображатьс не будут.
// Чтобы решить этот вопрос, мы ИМПОРТИРУЕМ иконки сразу в наш скрипт и будем использовать импортируемые иконки:
// Переменная icons будет содердать в итоге прото ссылку на файл с иконками (разный синтаксис для разных версий Parcel):
// import icons from '../img/icons.svg'; // for Parcel v.1
import icons from 'url:../../img/icons.svg'; // for Parcel v.2

// Экспортируем класс по умолчанию в другие модули, чтобы там можно было создавать экземпляры класса. Этот класс содержит методы, одинаковые для все объектов View (recipreView, resultsView, searchView)
// Из-за того, что Parcel и Babel пока плохо работают с # используем в наследуемых классах _ для обозначения приватных переменных

export default class View {
  _data;

  // Функция отрисовки нового HTML кода на странице
  // Второй параметр render добавлен только для реализации вывода списка закладок на экран

  /**
   * Описание функции согласно стандарту https://jsdoc.app.
   * Render the received object to the DOM
   * @param {object | Object[]} data The data to be rendered (e.g. recipe) // в качсетве параметра передается объект или массив объектов data данные, которые должн быть отрисованы
   * @param {boolean} [render = true] if false, creat markup string instead of rendering to the DOM // в качсетве параметра передается boolean, [render = true] - параметр необязательный, по умолчанию true
   * @returns {undefined | string} A markup string is returned if render = false // возвращает ничего или строку
   * @this {Object} View instatnse // this указывает на объект класса View
   * @author Alex
   * @todo Finish the implementation // Что еще надо сделать
   */
  render(data, render = true) {
    // Проверяем, если результат поискового запроса отсутствует или содержит пустой массив результатов
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    // 1. Сохраняем копию рецепта, получаемую из вне, в переменную частную переменную data
    this._data = data;

    // 2. Генерируем html-разметку
    const markup = this._generateMarkup();

    // Это строка исключительно для вывода списка закладок в блоке закладок
    if (!render) return markup;

    // 3. Очищаем контейнер
    this._clear();

    // 4. Вставляем полученную html-разметку в контейнер для вывода рецепта
    this._parentElement.insertAdjacentHTML('afterBegin', markup);
  }

  // Обновление только части страницы, которая изменяется (без обновления контейнера для рецепта recipe целиком)
  // Для этого мы создаем новую разметку (HTML-код) и сравниваем его с имеющимся на странице в данный момент
  // И изменяем только тот код, который изменился
  update(data) {
    // 1. Сохраняем копию рецепта, получаемую из вне, в переменную частную переменную data
    this._data = data;

    // 2. Сохранем новую html-разметку
    const newMarkup = this._generateMarkup();

    // Создаем «виртуальный» DOM, который не отображается на странице, а хранится в переменной newDOM
    // creatRange() - возвращает новый объект типа Range
    // Range -диапазон - интерфейс предоставляет фрагмент документа, который может содержать узлы и части текстовых узлов  данного документа.
    // createDocumentFragment() - создаёт новый пустой DocumentFragment (Обычно используются для создания фрагмента документа, добавления в него новых элементов/нод, а затем присоединения этого фрагмента к основному дереву. )

    const newDOM = document.createRange().createContextualFragment(newMarkup);

    // newElements содержит все элемента newDom, созданные с помощью новой разметки
    const newElements = Array.from(newDOM.querySelectorAll('*'));

    // curElements будет содержит все элемента текущей разметки из блока _parentElement
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      // Провереям, является ли новый узел равным текущему
      // Т.к. различаться будут не только непосредственно узлы, содержащие текстовую информацию, выводимую на экран, но и родители этих элементов, надо отобрать только узлы, содержищие текст, который надо заменить
      // Если узлы отличаются и это узлы с текстовой информацией, тогда обновляем текущий элемент (одновиться и на странице)
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Изменяет атрибут data-update-to
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  // Очищаем содержимое контейнера
  _clear() {
    this._parentElement.innerHTML = '';
  }

  //////////////////////////////////////////
  // Вывод спиннера Render spinner
  // Иконка загрузки вращается благодаря CSS-стилям
  renderSpinner() {
    const markup = `
          <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterBegin', markup);
  }

  // Вывод ошибки в случае ошибки
  // Если сообщение обошибки не передано, выводим значение по умолчанию
  renderError(message = this._errorMessage) {
    const markup = `
          <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>;
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterBegin', markup);
  }

  // Выводим сообщение об успехе
  renderMessage(message = this._message) {
    const markup = `
          <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>;
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterBegin', markup);
  }
}
