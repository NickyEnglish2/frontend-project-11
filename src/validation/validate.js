import * as yup from 'yup';
import initView from './view.js';

const buildSchema = (urls) => yup.string()
  .url('Введите корректный URL')
  .notOneOf(urls, 'RSS уже добавлен');

const init = () => {
  const state = {
    urls: [],
    form: {
      status: 'filling',
      error: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = elements.input.value.trim();
    const schema = buildSchema(watchedState.urls);

    schema
      .validate(url)
      .then(() => {
        watchedState.urls.push(url);
        watchedState.form.status = 'filling';
      })
      .catch((error) => {
        watchedState.form.error = error.message;
      });
  });
};

export default init;
