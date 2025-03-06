import onChange from 'on-change';

const renderStatus = (status, error, i18nInstance) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const submitBtn = document.querySelector('button[type="submit"]');

  switch (status) {
    case 'loading':
      submitBtn.setAttribute('disabled', 'true');
      feedback.textContent = i18nInstance('feedback.loading');
      feedback.classList.remove('text-success', 'text-danger');
      input.classList.remove('is-invalid');
      break;
    case 'failed':
      submitBtn.removeAttribute('disabled');
      feedback.textContent = i18nInstance(`feedback.${error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      break;
    case 'success':
      submitBtn.removeAttribute('disabled');
      feedback.textContent = i18nInstance('feedback.success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      input.classList.remove('is-invalid');
      break;
    case 'idle':
    default:
      submitBtn.removeAttribute('disabled');
      feedback.textContent = '';
      feedback.classList.remove('text-success', 'text-danger');
      input.classList.remove('is-invalid');
      break;
  }
};

const renderPosts = (state, nextInstance) => {
  const list = document.querySelector('.posts ul');

  const children = state.posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.textContent = post.title;
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.dataset.id = post.id;
    link.classList.add(state.viewedPostsIds.includes(post.id) ? 'fw-normal link-secondary' : 'fw-bold');

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = nextInstance('watchBtn');

    li.append(link, button);
    return li;
  });

  list.replaceChildren(...children);
};

const renderFeeds = (state) => {
  const list = document.querySelector('.feeds ul');

  const children = state.feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    li.append(title, description);
    return li;
  });

  list.replaceChildren(...children);
};

const renderPostStyle = (state) => {
  document.querySelectorAll('.posts a[data-id]').forEach((link) => {
    const isViewed = state.viewedPostsIds.includes(link.dataset.id);
    link.classList.toggle('fw-bold', !state.viewedPostsIds.includes(link.dataset.id));
    link.classList.toggle('fw-normal', isViewed);
    link.classList.toggle('link-secondary', isViewed);
  });
};

const renderModalContent = (state) => {
  if (state.modalPostId !== null) {
    const post = state.posts.find(({ id }) => id === state.modalPostId);
    if (post) {
      document.querySelector('.modal-title').textContent = post.title;
      document.querySelector('.modal-body').textContent = post.description;
      document.querySelector('a.full-article').setAttribute('href', post.link);
    }
  }
};

const initView = (state, i18nInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'status':
      renderStatus(value, state.error, i18nInstance);
      break;
    case 'posts':
      renderPosts(state, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(state);
      break;
    case 'viewedPostsIds':
      renderPostStyle(state);
      break;
    case 'modalPostId':
      renderModalContent(state);
      break;
    default:
      break;
  }
});

export default initView;
