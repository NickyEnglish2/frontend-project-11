import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      errors: {
        invalidUrl: 'Invalid URL.',
        duplicate: 'RSS already added.',
      },
      form: {
        submit: 'Add',
        placeholder: 'RSS link',
      },
      feedback: {
        success: 'RSS successfully added.',
      },
    },
  },
  ru: {
    translation: {
      errors: {
        invalidUrl: 'Некорректная ссылка.',
        duplicate: 'RSS уже добавлен.',
      },
      form: {
        submit: 'Добавить',
        placeholder: 'Ссылка на RSS',
      },
      feedback: {
        success: 'RSS успешно добавлен.',
      },
    },
  },
};

i18next.use(LanguageDetector).init({
  resources,
  fallbackLng: 'en',
  debug: false,
});

export default i18next;
