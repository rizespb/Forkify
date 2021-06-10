import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

// Функция возвращает reject Promise через s секунд
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// Данная функция - это рефакторинг кода, представленного ниже - объединяет в себе фукнции getJSON и sendJSON
// uploadData передается, если это POST-запрос - данные для отправки
export const AJAX = async function (url, uploadData = undefined) {
  try {
    // Если параметр uploadData не передается, тогдда fetch(url). Если передается, тогда формируется запрос POST
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            // Этим мы говорим, что информация идет в формате json
            'Content-Type': 'application/json',
          },
          // Преобразуем передаваемый объект в строку JSON
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    // Если запрос занимает слишком можно времени, возвращаем reject промис из timeout через заданное количество секунд
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // Конвертируем ответ сервера в объект
    const data = await res.json();
    console.log(data);

    // Проверяем статус ответа сервера: Если НЕ ок, тогда создаем ошибку, которая будет передана в catch блок
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    // Мы хоти обрабатывать ошибки не здесь, а при вызове export const loadRecipe() в файле model
    // Поэтому мы пересоздаем ошибку и с помощью throw передаем ее в следующий блок catch (он идет внутри функции loadRecipe(), после того, как мы вызвали там функцию getJSON)
    // Другими словами мы перебрасываем ошибку на следующему блоку catch, который встретиться дальше в коде
    throw err;
  }
};

/*



// Преобразованиеиз строки JSON в объект
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);
    // Если запрос занимает слишком можно времени, возвращаем reject промис из timeout через заданное количество секунд
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // Конвертируем ответ сервера в объект
    const data = await res.json();
    console.log(data);

    // Проверяем статус ответа сервера: Если НЕ ок, тогда создаем ошибку, которая будет передана в catch блок
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    // Мы хоти обрабатывать ошибки не здесь, а при вызове export const loadRecipe() в файле model
    // Поэтому мы пересоздаем ошибку и с помощью throw передаем ее в следующий блок catch (он идет внутри функции loadRecipe(), после того, как мы вызвали там функцию getJSON)
    // Другими словами мы перебрасываем ошибку на следующему блоку catch, который встретиться дальше в коде
    throw err;
  }
};

// ПОтправка данных на сервер по API
export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        // Этим мы говорим, что информация идет в формате json
        'Content-Type': 'application/json',
      },
      // Преобразуем передаваемый объект в строку JSON
      body: JSON.stringify(uploadData),
    });

    // Если запрос занимает слишком можно времени, возвращаем reject промис из timeout через заданное количество секунд
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // Конвертируем ответ сервера в объект
    const data = await res.json();
    console.log(data);

    // Проверяем статус ответа сервера: Если НЕ ок, тогда создаем ошибку, которая будет передана в catch блок
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    // Мы хоти обрабатывать ошибки не здесь, а при вызове export const loadRecipe() в файле model
    // Поэтому мы пересоздаем ошибку и с помощью throw передаем ее в следующий блок catch (он идет внутри функции loadRecipe(), после того, как мы вызвали там функцию getJSON)
    // Другими словами мы перебрасываем ошибку на следующему блоку catch, который встретиться дальше в коде
    throw err;
  }
};
*/
