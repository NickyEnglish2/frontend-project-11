import axios from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import { displayStatus, toggleForm, render } from './view.js';
import ru from './ru_locale.js';
import parse from './parse.js';

const fetchData = (url) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`)
  .then(({ data }) => data.contents)
  .catch(() => {
    throw new Error('networkErr');
  });

const updatePosts = (state) => {
  const parsed = state.current.map((feed, index) => {
    const currentFeed = state.feeds.at(-index - 1);
    const currentPosts = state.posts.filter(({ feedIndex }) => currentFeed.id === feedIndex);
    const postsTitles = currentPosts.map(({ title }) => title);
    const { id: feedIndex } = currentFeed;
    const { id: startIndex } = currentPosts[0];

    return fetchData(feed)
      .then((data) => {
        const parsedData = parse(data, startIndex, feedIndex);
        return parsedData.posts.filter(({ title }) => !postsTitles.includes(title));
      });
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
      const schema = yup.string().url();
      const watchedState = onChange(state, (path, value) => {
        if (path === 'status') {
          displayStatus(value, t(`feedback.${[value]}`));
        } else if (path === 'posts') {
          render(watchedState, t);
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
          .then(fetchData)
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
    });
};
