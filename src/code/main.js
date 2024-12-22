// @ts-check

import onChange from 'on-change';
import { displayStatus, toggleForm, render } from './view.js';
import parse from './parse.js';

const updatePosts = (state) => {
  const parsed = state.current.map((feed, index) => {
    const currentFeed = state.feeds.at(-index - 1);
    const currentPosts = state.posts.filter(({ feedIndex }) => currentFeed.id === feedIndex);
    const postsTitles = currentPosts.map(({ title }) => title);
    const { id: feedIndex } = currentFeed;
    const { id: startIndex } = currentPosts[0];

    return parse(feed, startIndex, feedIndex)
      .then(({ posts }) => posts
        .filter(({ title }) => !postsTitles.includes(title)));
  });

  Promise.all(parsed)
    .then((arr) => [].concat(...arr))
    .then((arr) => {
      const newArr = arr.map((post, index) => {
        const newPost = post;
        newPost.id = index + state.posts.length;
        return newPost;
      });
      const newState = state;
      newState.posts = [].concat(...newArr, ...state.posts);
    });
  setTimeout(updatePosts, 5000, state);
};

export default (state, nextInstance, yup) => {
  const schema = yup.string().url();
  const watchedState = onChange(state, (path, value) => {
    if (path === 'status') {
      displayStatus(value, nextInstance(`feedback.${[value]}`));
    } else if (path === 'posts') {
      render(watchedState, nextInstance);
    }
  });

  setTimeout(updatePosts, 5000, watchedState);

  const formElement = document.querySelector('form');
  formElement?.addEventListener('submit', (e) => {
    e.preventDefault();
    toggleForm(true);

    const { value } = formElement.elements['url-input'];
    if (watchedState.current.includes(value)) {
      watchedState.status = 'alreadyExists';
      toggleForm(false);
      return;
    }
    schema.validate(value)
      .then((data) => {
        const postIndex = watchedState.posts.length;
        const feedIndex = watchedState.feeds.length;
        return parse(data, postIndex, feedIndex);
      })
      .then((data) => {
        watchedState.status = 'success';
        watchedState.current.push(value);
        const { feed, posts } = data;
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...posts);
      })
      .catch((err) => {
        watchedState.status = err.message;
      })
      .then(() => toggleForm(false));
  });
};
