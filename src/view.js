import onChange from 'on-change';

const renderStatus = (state, elements, i18nInstance) => {
  const { input, feedback, submitBtn } = elements;
  const { error } = state;
  const { status } = state;

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
      input.value = '';
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

const renderPosts = (state, elements, nextInstance) => {
  const { postsList } = elements;

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

  postsList.replaceChildren(...children);
};

const renderFeeds = (state, elements) => {
  const { feedsList } = elements;

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

  feedsList.replaceChildren(...children);
};

const renderPostStyle = (state, elements) => {
  const { postsList } = elements;

  postsList.querySelectorAll('a[data-id]').forEach((link) => {
    const isViewed = state.viewedPostsIds.includes(link.dataset.id);
    link.classList.toggle('fw-bold', !isViewed);
    link.classList.toggle('fw-normal', isViewed);
    link.classList.toggle('link-secondary', isViewed);
  });
};

const renderModalContent = (state, elements) => {
  const { modalTitle, modalBody, fullArticleLink } = elements;

  if (state.modalPostId !== null) {
    const post = state.posts.find(({ id }) => id === state.modalPostId);
    if (post) {
      modalTitle.textContent = post.title;
      modalBody.textContent = post.description;
      fullArticleLink.setAttribute('href', post.link);
    }
  }
};

const initView = (state, elements, i18nInstance) => onChange(state, (path) => {
  switch (path) {
    case 'status':
      renderStatus(state, elements, i18nInstance);
      break;
    case 'posts':
      renderPosts(state, elements, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(state, elements);
      break;
    case 'viewedPostsIds':
      renderPostStyle(state, elements);
      break;
    case 'modalPostId':
      renderModalContent(state, elements);
      break;
    default:
      break;
  }
});

export default initView;
