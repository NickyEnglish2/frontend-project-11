import onChange from 'on-change';

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
    } else if (path === 'form.error') {
      if (value) {
        input.classList.add('is-invalid');
        feedback.textContent = value;
      } else {
        input.classList.remove('is-invalid');
        feedback.textContent = '';
      }
    }
  });
};
