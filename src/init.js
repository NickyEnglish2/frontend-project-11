/* eslint-disable no-param-reassign */

import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import initView from './view.js';
import resources from './locales/index.js';
import parse from './parse.js';

const addProxy = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('url', url.trim());
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const updatePosts = (watchedState) => {
  const requests = watchedState.feeds.map((feed) => axios.get(addProxy(feed.url))
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
    .catch(() => []));

  Promise.all(requests).finally(() => {
    setTimeout(() => updatePosts(watchedState), 5000);
  });
};

const loadRss = (url, watchedState, elements) => axios.get(addProxy(url))
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

    watchedState.error = null;
    watchedState.status = 'success';
    watchedState.feeds = [...watchedState.feeds, newFeed];
    watchedState.posts = [...newPosts, ...watchedState.posts];

    elements.input.value = '';
  })
  .catch((err) => {
    if (err.isAxiosError) {
      watchedState.error = 'networkErr';
      watchedState.status = 'failed';
      console.error('Network error:', err.message);
    } else if (err.isParsingError) {
      watchedState.error = 'notContaining';
      watchedState.status = 'failed';
      console.error('Parsing error:', err.message);
    } else {
      watchedState.error = 'unknownErr';
      watchedState.status = 'failed';
      console.error('Unknown error:', err.message);
    }
  });

const validateUrl = (url, feeds) => yup.string()
  .required()
  .url()
  .notOneOf(feeds.map((feed) => feed.url))
  .validate(url);

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
    postsList: document.querySelector('.posts ul'),
    feedsList: document.querySelector('.feeds ul'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    fullArticleLink: document.querySelector('a.full-article'),
  };

  const state = {
    feeds: [],
    posts: [],
    status: 'idle', // idle, loading, failed, success
    error: null,
    viewedPostsIds: [],
    modalPostId: null,
  };

  yup.setLocale({
    mixed: {
      required: () => 'required',
      notOneOf: () => 'alreadyExists',
    },
    string: {
      url: () => 'invalid',
    },
  });

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then((t) => {
      const watchedState = initView(state, elements, t);

      updatePosts(watchedState);

      elements.form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const url = formData.get('url-input');

        watchedState.error = null;
        watchedState.status = 'loading';

        validateUrl(url, watchedState.feeds)
          .then(() => { loadRss(url, watchedState, elements); })
          .catch((err) => {
            watchedState.error = err.message;
            watchedState.status = 'failed';
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

      elements.postsContainer.addEventListener('click', handlePostClick);
    });
};
