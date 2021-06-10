// В нашем html-коде изначально указывался точный путь к иконкам src/img/icons.svg
// Но Parcel при работе создает свой файл для иконок в паке dist (например, icons.c4b52749.svg ищет иконки там). Поэтому иконки отображатьс не будут.
// Чтобы решить этот вопрос, мы ИМПОРТИРУЕМ иконки сразу в наш скрипт и будем использовать импортируемые иконки:
// Переменная icons будет содердать в итоге прото ссылку на файл с иконками (разный синтаксис для разных версий Parcel):
// import icons from '../img/icons.svg'; // for Parcel v.1
import icons from 'url:../../img/icons.svg'; // for Parcel v.2

import Fraction from 'fractional';

import View from './View.js';

// Класс с методами для вывода рецепта на экран и обработи ошибок
class RecipeView extends View {
  // Контейнер для вывода рецепта
  _parentElement = document.querySelector('.recipe');

  // Переменная для хранения текущего рецепта
  _data;

  _errorMessage = 'We could not find that recipe. Please try another one!';

  // Сообщение об успехе
  _message = '';

  // Это Puslisher (Издатель) в Паттерне Publisher-Subscriber
  // Издатель отлавливает события и не знает, как оно будет обработано дальше.
  // А дальше оно обрабатывается в файле controller.js с помощью функции, которую вызывает addHandlerRender() и передает в качестве параметра (handler) функцию для обработки событий
  addHandlerRender(handler) {
    // Обработчик событий, который отлавливает изменение хэша в адресной строке или загрузку страницы по пряму адресу, например, http.../#54654231684354 (в случае прямого адреса хэш не изменяется, поэтому событие hashchange не сработает)
    // Констуркция ниже - это вызов одной и той же функции на два рразных события
    // window.addEventListener('hashchange', controlRecipes);
    // window.addEventListener('load', controlRecipes);
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  // Обработчик событий - отлавливает нажатие на кнопки изменения количества порций
  // Реализовано с помощью паттерна Publisher-Subsriber
  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');

      if (!btn) return;

      // Сохраняем в переменную updateTo новое значение количества порций, которое каждый раз высчитывается в текущем рецепте (при кждом рендеринге страницы) и хранится в атрибуте data-update-to
      // Сохраняется строка. Надо будет конвертировать число
      const { updateTo } = btn.dataset;

      if (+updateTo > 0) handler(+updateTo);
    });
  }

  // Обработчик событий отлавливает клик по иконке "Добавить в закладки"
  // В данном случае делигирование играет особую роль: пока рецепт не выбран и не загружен, иконка bookmark не существует и мы не можем повесить на нее обработчик событий. Мы вешаем обработчик на родителя
  // Паттерн Publisher-Subscriber
  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');

      if (!btn) return;

      handler();
    });
  }

  // Генерация html-разметки, используя информацию из объекта, сохраненного в переменную #data
  _generateMarkup() {
    return `
    <figure class="recipe__fig">
      <img src="${this._data.image}" alt="Tomato" class="recipe__img" />
      <h1 class="recipe__title">
        <span>${this._data.title}</span>
      </h1>
    </figure>

    <div class="recipe__details">
      <div class="recipe__info">
        <svg class="recipe__info-icon">
          <use href="${icons}#icon-clock"></use>
        </svg>
        <span class="recipe__info-data recipe__info-data--minutes">${
          this._data.cookingTime
        }</span>
        <span class="recipe__info-text">minutes</span>
      </div>
      <div class="recipe__info">
        <svg class="recipe__info-icon">
          <use href="${icons}#icon-users"></use>
        </svg>
        <span class="recipe__info-data recipe__info-data--people">${
          this._data.servings
        }</span>
        <span class="recipe__info-text">servings</span>

        <div class="recipe__info-buttons">
          <button class="btn--tiny btn--update-servings" data-update-to="${
            this._data.servings - 1
          }">
            <svg>
              <use href="${icons}#icon-minus-circle"></use>
            </svg>
          </button>
          <button class="btn--tiny btn--update-servings" data-update-to="${
            this._data.servings + 1
          }">
            <svg>
              <use href="${icons}#icon-plus-circle"></use>
            </svg>
          </button>
        </div>
      </div>

      <div class="recipe__user-generated">
        <svg>
          <use href="${icons}#icon-user"></use>
        </svg>
      </div>
      <button class="btn--round btn--bookmark">
        <svg class="">
          <use href="${icons}#icon-bookmark${
      this._data.bookmarked ? '-fill' : ''
    }"></use>
        </svg>
      </button>
    </div>

    <div class="recipe__ingredients">
      <h2 class="heading--2">Recipe ingredients</h2>
      <ul class="recipe__ingredient-list">

      ${this._data.ingredients.map(this._generateMarkupIngredient).join('')}
        
      </ul>
    </div>

    <div class="recipe__directions">
      <h2 class="heading--2">How to cook it</h2>
      <p class="recipe__directions-text">
        This recipe was carefully designed and tested by
        <span class="recipe__publisher">${
          this._data.publisher
        }</span>. Please check out
        directions at their website.
      </p>
      <a
        class="btn--small recipe__btn"
        href="${this._data.sourceUrl}"
        target="_blank"
      >
        <span>Directions</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </a>
    </div>    
    `;
  }

  // Создаем HTML-строку для создания списка ингридиентов
  // Используем функции из внешней библиотеки fractional (согласно документации)
  _generateMarkupIngredient(ing) {
    return `<li class="recipe__ingredient">
      <svg class="recipe__icon">
        <use href="${icons}#icon-check"></use>
      </svg>
      <div class="recipe__quantity">${
        ing.quantity ? new Fraction.Fraction(ing.quantity).toString() : ''
      }</div>
      <div class="recipe__description">
        <span class="recipe__unit">${ing.unit}</span>
        ${ing.description}
      </div>
    </li>`;
  }
}

// Мы могли бы экспортироват класс RecipeView и затем создать объект в контроллере. Обычно это используется, когда в controller надо создать много объектов. В нашем случае в этом нет необходимости. Поэтому мы экспортируем сразу объект, а не класс
export default new RecipeView();
