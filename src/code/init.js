// @ts-check

import i18next from 'i18next';
import * as yup from 'yup';
import ru from '../i18next/ru_local.js';
import app from './main.js';

export default () => {
  const state = {
    current: [],
    status: 'pending',
    feeds: [],
    posts: [],
    readed: [],
  };
  yup.setLocale({
    string: {
      url: () => 'invalid',
    },
  });
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((t) => {
      app(state, t, yup);
    });
};
