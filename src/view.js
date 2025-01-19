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

const createPostLink = (post, state) => {
  const link = document.createElement('a');
  link.textContent = post.title;
  link.setAttribute('href', post.link);
  link.setAttribute('target', '_blank');
  link.dataset.id = post.id;

  if (state.viewedPostsIds.includes(post.id)) {
    link.classList.add('fw-normal', 'link-secondary');
  } else {
    link.classList.add('fw-bold');
  }

  return link;
};

const createPostButton = (post, nextInstance) => {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('type', 'button');
  button.dataset.id = post.id;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = nextInstance('watchBtn');

  return button;
};

const createPostListItem = (post, state, nextInstance) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const link = createPostLink(post, state);
  const button = createPostButton(post, nextInstance);

  li.append(link, button);
  return li;
};

const createPostList = (state, nextInstance) => {
  const list = document.querySelector('.posts ul');
  const children = state.posts.map((post) => createPostListItem(post, state, nextInstance));
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
  if (state.status === 'failed') {
    displayStatus(state.status, nextInstance(`feedback.${state.error}`));
  } else if (state.status === 'success') {
    displayStatus(state.status, nextInstance('feedback.success'));
  }

  createPostList(state, nextInstance);
  createFeedList(state);
};

export { displayStatus, render };
