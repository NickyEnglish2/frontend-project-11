export default (rssData) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssData, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('PARSE_ERROR');
  }

  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('PARSE_ERROE');
  }

  const title = doc.querySelector('channel > title')?.textContent || '';
  const description = doc.querySelector('channel > description')?.textContent || '';
  const items = Array.from(doc.querySelectorAll('channel > item')).map((item) => ({
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
  }));

  return {
    title,
    description,
    items,
  };
};
