import * as yup from 'yup';
import i18next from '../i18n.js';
import initView from './view.js';

yup.setLocale({
  mixed: {
    notOneOf: i18next.t('errors.duplicate'),
  },
  string: {
    url: i18next.t('errors.invalidUrl'),
  },
});

const buildSchema = (urls) => yup.string().required().url().notOneOf(urls);

const init = () => {
  const state = {
    urls: [],
    form: {
      status: 'filling',
      errorCode: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('.rss-form button[type="submit"]'),
  };

  const watchedState = initView(state, elements);

  elements.input.setAttribute('placeholder', i18next.t('form.placeholder'));
  elements.submitButton.textContent = i18next.t('form.submit');

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = elements.input.value.trim();
    const schema = buildSchema(watchedState.urls);

    schema
      .validate(url)
      .then(() => {
        watchedState.urls.push(url);
        watchedState.form.status = 'filling';
        elements.feedback.textContent = i18next.t('feedback.success');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
      })
      .catch((err) => {
        elements.feedback.textContent = err.message;
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
      });
  });
};

export default init;
