import axios from 'axios';

const buildUrl = (rssUrl) => {
  const encodeUrl = encodeURIComponent(rssUrl);
  return `https://allorigins.hexlet.app/get?url=${encodeUrl}&disableCache=true`;
};

const fetchRss = (rssUrl) => {
  const apiUrl = buildUrl(rssUrl);

  return axios.get(apiUrl)
    .then((response) => {
      if (response.status !== 200) {
        throw new Error('NETWORK_ERROR');
      }
      const { contents } = response.data;
      if (!contents) {
        throw new Error('errors.invalidRss');
      }
      return contents;
    })
    .catch((err) => {
      if (err.response) {
        throw new Error('NETWORK_ERROR');
      }
      throw new Error('FETCH_ERROR');
    });
};

export default fetchRss;
