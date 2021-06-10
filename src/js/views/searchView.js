// Класс для отслеживания отправки запроса в форме поиска и получения запроса
class SearchView {
  _parentEl = document.querySelector('.search');

  // Получаем поисковый запрос из поля ввыода на странице
  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  // Очищаем поле для поискового запроса
  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  // Реализуем паттерн Publisher-Subscriber
  // addHandlerSearch - Publisher, который отслеживает события и генерирует сообщения, но он не знает, какая именно фукнция handler будет вызвана - эту функция будет передана ему Подписчиком в качестве параметра в файле controller.js
  addHandlerSearch(handler) {
    // событие submit реагирует на отправку формы:
    // - и на нажие клавиши Enter в форме
    // - и на клик по кнопке
    this._parentEl.addEventListener('submit', function (e) {
      // preventDefault для того, чтобы при отправке формы страница не перезагружалась
      e.preventDefault();

      handler();
    });
  }
}

export default new SearchView();
