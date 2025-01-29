import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import initView from './view.js';
import ru from './ru_locale.js';
import parse from './parse.js';

const fetchData = (url) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`)
  .then(({ data }) => data.contents)
  .catch((err) => {
    if (err.response) {
      throw new Error('notContaining');
    } else if (err.request) {
      throw new Error('networkErr');
    } else {
      throw new Error('invalid');
    }
  });

const updatePosts = (watchedState) => {
  const parsed = watchedState.feeds.map((feed) => {
    const currentPosts = watchedState.posts.filter(({ feedIndex }) => feed.id === feedIndex);
    const postsTitles = currentPosts.map(({ title }) => title);
    const { id: feedIndex } = feed;

    return fetchData(feed.url)
      .then((data) => {
        const postIndex = watchedState.posts.length;
        const parsedData = parse(data, postIndex, feedIndex);
        return parsedData.posts.filter(({ title }) => !postsTitles.includes(title));
      });
  });

  Promise.all(parsed)
    .then((arr) => [].concat(...arr))
    .then((newPosts) => {
      const updatedPosts = newPosts.map((post, index) => ({
        ...post,
        id: index + watchedState.posts.length,
      }));

      const newState = {
        ...watchedState,
        posts: [...updatedPosts, ...watchedState.posts],
      };

      Object.assign(watchedState, newState);
    })
    .catch((err) => {
      const newState = {
        ...watchedState,
        status: 'failed',
        error: err.message,
      };

      Object.assign(watchedState, newState);
    });

  setTimeout(() => updatePosts(watchedState), 5000);
};

export default () => {
  const state = {
    feeds: [],
    posts: [],
    status: 'idle', // idle, loading, failed, success
    error: null,
    viewedPostsIds: [],
    modalPostId: null,
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
      const watchedState = initView(state, t);

      setTimeout(() => updatePosts(watchedState), 5000);

      const formElement = document.querySelector('form');
      formElement?.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.status = 'loading';
        watchedState.error = null;
        const { value } = formElement.elements['url-input'];

        if (watchedState.feeds.some((feed) => feed.url === value)) {
          watchedState.status = 'failed';
          watchedState.error = 'alreadyExists';
          return;
        }

        schema.validate(value)
          .then(() => fetchData(value))
          .then((data) => {
            const feedIndex = watchedState.feeds.length;
            const postIndex = watchedState.posts.length;
            const parsedData = parse(data, postIndex, feedIndex);

            watchedState.status = 'success';
            watchedState.error = null;
            watchedState.feeds = [...watchedState.feeds, {
              id: feedIndex,
              url: value,
              title: parsedData.feed.title,
              description: parsedData.feed.description,
            }];
            watchedState.posts = [...parsedData.posts, ...watchedState.posts];
          })
          .catch((err) => {
            watchedState.status = 'failed';
            watchedState.error = err.message;
          });
      });

      const handlePostClick = (e) => {
        const postId = +e.target.dataset.id;

        if (!postId) return;

        const updatedViewedPostsIds = watchedState.viewedPostsIds.includes(postId)
          ? watchedState.viewedPostsIds
          : [...watchedState.viewedPostsIds, postId];

        Object.assign(watchedState, {
          viewedPostsIds: updatedViewedPostsIds,
          modalPostId: postId,
        });
      };

      const posts = document.querySelector('.posts');
      posts.addEventListener('click', handlePostClick);
    });
};
