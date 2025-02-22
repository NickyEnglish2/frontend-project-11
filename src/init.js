import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import initView from './view.js';
import ru from './ru_locale.js';
import parse from './parse.js';

const addProxy = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('url', url.trim());
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const updatePosts = (watchedState) => {
  const requests = watchedState.feeds.forEach((feed) => {
    axios.get(addProxy(feed.url))
      .then(({ data }) => {
        const { id: feedId } = feed;
        const currentPosts = watchedState.posts.filter((post) => post.feedId === feedId);
        const postsTitles = currentPosts.map(({ title }) => title);

        const parsedData = parse(data.contents);
        const newPosts = parsedData.posts
          .filter(({ title }) => !postsTitles.includes(title))
          .map((post) => ({
            ...post,
            feedId,
            id: uniqueId(),
          }));

        if (newPosts.length > 0) {
          watchedState.posts = [...newPosts, ...watchedState.posts];
        }
      })
      .catch(() => []);
  });

  Promise.all(requests).finally(() => {
    setTimeout(() => updatePosts(watchedState), 5000);
  });
};

const loadRss = (url, watchedState) => axios.get(addProxy(url))
  .then(({ data }) => {
    const parsedData = parse(data.contents);

    const newFeed = {
      id: uniqueId(),
      url,
      title: parsedData.feed.title,
      description: parsedData.feed.description,
    };

    const newPosts = parsedData.posts.map((post) => ({
      ...post,
      id: uniqueId(),
      feedId: newFeed.id,
    }));

    watchedState.status = 'success';
    watchedState.error = null;
    watchedState.feeds = [...watchedState.feeds, newFeed];
    watchedState.posts = [...newPosts, ...watchedState.posts];
  })
  .catch((err) => {
    if (err.isAxiosError) {
      watchedState.status = 'failed';
      watchedState.error = 'networkErr';
      console.error('Network error:', err.message);
    } else if (err.isParsingError) {
      watchedState.status = 'failed';
      watchedState.error = 'notContaining';
      console.error('Parsing error:', err.message);
    } else {
      watchedState.status = 'failed';
      watchedState.error = 'unknownErr';
      console.error('Unknown error:', err.message);
    }
  });

const validateUrl = (url, feeds) => yup.string()
  .required('required')
  .url('invalid')
  .notOneOf(feeds.map((feed) => feed.url), 'alreadyExists')
  .validate(url);

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
      required: () => 'required',
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
      const watchedState = initView(state, t);

      updatePosts(watchedState);

      const formElement = document.querySelector('form');
      formElement?.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.status = 'loading';
        watchedState.error = null;

        const formData = new FormData(e.target);
        const url = formData.get('url-input');

        validateUrl(url, watchedState.feeds)
          .then(() => { loadRss(url, watchedState); })
          .catch((err) => {
            watchedState.status = 'failed';
            watchedState.error = err.message;
          });
      });

      const handlePostClick = (e) => {
        const postId = e.target.dataset.id;

        if (!postId) return;

        const updatedViewedPostsIds = watchedState.viewedPostsIds.includes(postId)
          ? watchedState.viewedPostsIds
          : [...watchedState.viewedPostsIds, postId];

        watchedState.viewedPostsIds = updatedViewedPostsIds;
        watchedState.modalPostId = postId;
      };

      const posts = document.querySelector('.posts');
      posts.addEventListener('click', handlePostClick);
    });
};
