import axios from 'axios';

const getData = (parsed, postIndex, feedIndex) => {
  const feedTitle = parsed.querySelector('title');
  const feedDescription = parsed.querySelector('description');
  const feedLink = parsed.querySelector('link');
  const result = {
    feed: {
      id: feedIndex,
      title: feedTitle.textContent,
      description: feedDescription.textContent,
      link: feedLink.textContent,
    },
    posts: [],
  };
  const itemList = parsed.querySelectorAll('item');
  if (itemList.length === 0) {
    throw new Error('notContaining');
  }
  itemList.forEach((item, index) => {
    const link = item.querySelector('link');
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const obj = {
      id: index + postIndex,
      feedIndex,
      link: link.textContent,
      title: title.textContent,
      description: description.textContent,
    };
    result.posts.push(obj);
  });

  return result;
};

export default (link, postIndex, feedIndex) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
  .then(({ data }) => data.contents)
  .then((data) => {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(data, 'text/xml');
    try {
      return getData(parsed, postIndex, feedIndex);
    } catch (err) {
      throw new Error('notContaining');
    }
  })
  .catch((err) => {
    if (err.message === 'notContaining') {
      throw new Error(err.message);
    }
    throw new Error('networkError');
  });
