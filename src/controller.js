const updatePostLinkStyles = (post) => {
  const link = document.querySelector(`a[data-id="${post.id}"]`);
  link.classList.replace('fw-bold', 'fw-normal');
  link.classList.add('link-secondary');
};

const updateModalContent = (post) => {
  const title = document.querySelector('.modal-title');
  title.textContent = post.title;

  const body = document.querySelector('.modal-body');
  body.textContent = post.description;

  const modalLink = document.querySelector('a.full-article');
  modalLink.setAttribute('href', post.link);
};

const handlePostClick = (watchedState) => (e) => {
  const postId = +e.target.dataset.id;
  const post = watchedState.posts.find(({ id }) => id === postId);

  if (!post) return;

  updatePostLinkStyles(post);

  const updatedViewedPostsIds = watchedState.viewedPostsIds.includes(post.id)
    ? watchedState.viewedPostsIds
    : [...watchedState.viewedPostsIds, post.id];

  Object.assign(watchedState, {
    viewedPostsIds: updatedViewedPostsIds,
    modalPostId: post.id,
  });

  updateModalContent(post);
};

const initControllers = (watchedState) => {
  const posts = document.querySelector('.posts');
  posts.addEventListener('click', handlePostClick(watchedState));
};

export default initControllers;
