const displayStatus = (status, text) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const addClass = status === 'success' ? 'text-success' : 'text-danger';
  const removeClass = status === 'success' ? 'text-danger' : 'text-success';

  if (status === 'success') {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }

  feedback.classList.add(addClass);
  feedback.classList.remove(removeClass);
  feedback.textContent = text;
};

const toggleForm = (flag) => {
  const input = document.querySelector('#url-input');
  const submitButton = document.querySelector('#submitBtn');

  if (flag) {
    input.setAttribute('readonly', 'true');
    submitButton.setAttribute('disabled', '');
  } else {
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
    input.value = '';
  }
};

const createPostList = (state, nextInstance) => {
  const list = document.querySelector('.posts ul');
  const children = [];

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    if (state.readed.includes(post.id)) {
      link.classList.add('fw-normal', 'link-secondary');
    } else {
      link.classList.add('fw-bold');
    }
    link.textContent = post.title;
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.dataset.id = post.id;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = nextInstance('watchBtn');
    li.append(link, button);
    children.push(li);
  });

  list.replaceChildren(...children);
};

const createFeedList = (state) => {
  const list = document.querySelector('.feeds ul');
  const children = [];

  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;

    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;

    li.append(feedTitle, feedDescription);
    children.push(li);
  });

  list.replaceChildren(...children);
};

const render = (state, nextInstance) => {
  const posts = document.querySelector('.posts');

  posts.addEventListener('click', (e) => {
    const post = state.posts.find(({ id }) => id === +e.target.dataset.id);
    const link = document.querySelector(`a[data-id="${post.id}"]`);
    link.classList.replace('fw-bold', 'fw-normal');
    link.classList.add('link-secondary');

    const findReaded = state.readed.find(({ id }) => id === post.id);
    if (findReaded === undefined) {
      state.readed.push(post.id);
    }

    const title = document.querySelector('.modal-title');
    title.textContent = post.title;

    const body = document.querySelector('.modal-body');
    body.textContent = post.description;

    const modalLink = document.querySelector('a.full-article');
    modalLink.setAttribute('href', post.link);
  });

  createPostList(state, nextInstance);
  createFeedList(state);
};

export { displayStatus, toggleForm, render };
