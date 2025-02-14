import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import initView from './view.js';
import ru from './ru_locale.js';
import parse from './parse.js';

const addProxy = (url) => {
  const encodedUrl = encodeURI(url.trim());
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('url', encodedUrl);
  proxyUrl.searchParams.set('disableCache', 'true');
  console.log(proxyUrl.href.toString());
  return proxyUrl.toString();
};

const updatePosts = (watchedState) => {
  const parsed = watchedState.feeds.map((feed) => axios.get(addProxy(feed.url))
    .then(({ data }) => {
      const { id: feedIndex } = feed;
      const currentPosts = watchedState.posts.filter((post) => {
        const { feedIndex: postFeedIndex } = post;
        return postFeedIndex === feedIndex;
      });
      const postsTitles = currentPosts.map(({ title }) => title);

      const parsedData = parse(data.contents);
      return parsedData.posts
        .filter(({ title }) => !postsTitles.includes(title))
        .map((post) => ({
          ...post,
          feedIndex,
          id: uniqueId(),
        }));
    })
    .catch(() => []));

  Promise.all(parsed)
    .then((arr) => [].concat(...arr))
    .then((newPosts) => {
      if (newPosts.length > 0) {
        const newState = {
          ...watchedState,
          posts: [...newPosts, ...watchedState.posts],
        };

        Object.assign(watchedState, newState);
      }
    })
    .catch((err) => {
      const newState = {
        ...watchedState,
        status: 'failed',
        error: err.message,
      };

      Object.assign(watchedState, newState);
    });
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
      const schema = (feeds) => yup.string()
        .url('invalid')
        .notOneOf(feeds.map((feed) => feed.url), 'alreadyExists');

      const watchedState = initView(state, t);

      setTimeout(() => updatePosts(watchedState), 5000);

      const formElement = document.querySelector('form');
      formElement?.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.status = 'loading';
        watchedState.error = null;

        const formData = new FormData(e.target);
        const url = formData.get('url-input');

        if (!url || url.includes(' ')) {
          watchedState.status = 'failed';
          watchedState.error = 'invalid';
          return;
        }

        schema(watchedState.feeds).validate(url)
          .then(() => axios.get(addProxy(url)))
          .then(({ data }) => {
            const feedIndex = watchedState.feeds.length;

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
              feedIndex,
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
              console.error('Error:', err.message);
            }
          });
      });

      const handlePostClick = (e) => {
        const postId = e.target.dataset.id;

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
