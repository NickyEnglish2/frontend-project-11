import onChange from 'on-change';
import i18next from '../i18n.js';

export default (state, elements) => {
  const { form, feedback, input } = elements;

  return onChange(state, (path, value) => {
    if (path === 'form.status') {
      if (value === 'filling') {
        input.classList.remove('is-invalid');
        feedback.textContent = '';
        form.reset();
        input.focus();
      }
    } else if (path === 'form.errorCode') {
      if (value) {
        input.classList.add('is-invalid');
        feedback.textContent = i18next.t(`errors.${value}`);
        feedback.classList.add('text-danger');
      } else {
        input.classList.remove('is-invalid');
        feedback.textContent = '';
        feedback.classList.remove('text-danger');
      }
    }
  });
};
