import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

// Основная переменная, в которой будет храниться информация
// recipe - текущий рецепт
// search - поисковый запрос и результаты поискового запроса
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// Функция, которая ковертирует получаемый с сервера рецепт в формат, используемый в нашей программе
const creatRecipeObject = function (data) {
  // Сохранем непосредственно объект с рецептом из data.data в переменную recipe. Т.к. имя переменной и название объекта совпадают (data.data.recipe), используем деструктуризацию. Ананлогично:
  // let recipe = data.data.recipe;
  const { recipe } = data.data;

  // На основе уже хранимого в переменной объекта создаем новый объект в той же переменной, для того, чтобы назвать свойства в соответствии с CamelCase и потом удобно их использовать
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,

    // свойство key хранит ключ пользователя, который загрузил этот рецепт
    // Не все рецепты имеют key
    // Елси у рецепта нет recipe.key, тогда ничего не происходит
    // Если recipe.key существует, тогда выражение возвращает { key: recipe.key } и деструктурируем его
    ...(recipe.key && { key: recipe.key }),
  };
};

////////////////////////////////////////////
/// Получаем рецепт по API и сохраняем в объект recipe в объекте state
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}`);
    state.recipe = creatRecipeObject(data);

    // Проверяем, хранится ли рецепт с таким же id в массиве state.bookmarks.
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    // Мы должны обрабатывать ошибки в блоке controller.js
    // Перебрасываем ошибку следующему блоку catch, который встретиться дальше в коде (в controller.js вызывается функция controlRecipes, которая вызывает текущуюфункцию loadRecipe)
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};

// Загрузка результатов поискового запроса
export const loadSearchResults = async function (query) {
  try {
    // Сохраняем в state поисковый запрос
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}`);

    // Сохраняем в state результаты поиска
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });

    // Устанавливаем текущую страницу 1, чтобы новые результаты поиска загружались с первой страницы
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥💥`);

    // Перебрасываем ошибку в следующий блок catch (он появится в controller)
    throw err;
  }
};

// Вывод на страницу результаты поиска постранично (по page результатов на странице) - пагинация
export const getSearchResultsPage = function (page = state.search.page) {
  // Сохраняем номер текущей страницы результатов поиска
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0;
  const end = page * state.search.resultsPerPage; // 9;

  return state.search.results.slice(start, end);
};

// Функция обновления количества ингредиентов согласно количеству порций
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // количество ингридиентов = (старое количество ингридиентов) * (новое количество порций) /  (старое количество порций)
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

// Функция сохранения закладок в кэше браузера
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// Функция помещает рецепт в массив закладок и добавляет текущему рецепту свойство state.recipe.bookmarked = true при добавлении рецепта в закладки
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  // Если id рецепта, переданного в качестве параметра, совпадает с id текущего рецепта, создаем текущему рецепту новое свойство bookmarked = true
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

// Функция удаления рецепт из массива закладок
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Устанавливаем рецепту свойство bookmarked как false
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

//
const init = function () {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// Служебна функция, необходимая для дебаггинга во время разработки
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  // Преобразовываем данные, полученные из формы добавления рецепта в формат и порядок, который использует API

  try {
    // Object.entries возвращаем объект из переданного массива, содержащего подмассивы из двух элементов (ключ-значение)
    // 1. в ingredients сохранеям массив с вложенными подмассивами ключ-значение из объекта newRecipe
    // 2. Отфильтровываем элементы массива, первый элемент которых начинается с ingredient (например, ["ingredient-1", "0.5,kg,Rice"] и у которых второй элемент не пустой !== '')
    // 3. С помощью map возвращаем массив преобразованных элементов из отобранных ранее
    // 4. Если во втором элемента имеет пробелы, затем разделяем строки типа "0.5,kg,Rice" с помощью запятых split(',), убираем лишние пробелы, если они есть trim()
    // 5. С помощью деструктуризации сохраняем полученные элементы в переменные const [quantity, unit, description]
    // 6. Возвращаем объект из полученных переменных
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArray = ing[1].split(',').map(el => el.trim());

        // Проверяем, правильно ли заполнены поля ингридиентов (должно быть три составляющих через запятую)
        if (ingArray.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format'
          );

        const [quantity, unit, description] = ingArray;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // Подготавливаем объект для отправки по API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(recipe);

    // Отправляем объект по API на сервер
    // В url добавляем API-key, который получаем на сайте https://forkify-api.herokuapp.com/v2
    //В data будет помещен ответ сервера - сервер в случае успеха вернет загруженный рецепт
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    console.log(data);

    // Сохраняем полученный в качестве ответа сервера рецепт в переменную state
    state.recipe = creatRecipeObject(data);

    // Добавляем загруженный и возвращенный рецепт в закладки
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
