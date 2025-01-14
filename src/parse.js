const parseXml = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'text/xml');
};

const extractFeed = (parsed, feedIndex) => {
  const feedTitle = parsed.querySelector('title');
  const feedDescription = parsed.querySelector('description');
  const feedLink = parsed.querySelector('link');

  if (!feedTitle || !feedDescription || !feedLink) {
    throw new Error('notContaining');
  }

  return {
    id: feedIndex,
    title: feedTitle.textContent,
    description: feedDescription.textContent,
    link: feedLink.textContent,
  };
};

const extractPosts = (parsed, postIndex, feedIndex) => {
  const itemList = parsed.querySelectorAll('item');
  if (itemList.length === 0) {
    throw new Error('notContaining');
  }

  return Array.from(itemList).map((item, index) => {
    const link = item.querySelector('link');
    const title = item.querySelector('title');
    const description = item.querySelector('description');

    if (!link || !title || !description) {
      throw new Error('notContaining');
    }

    return {
      id: index + postIndex,
      feedIndex,
      link: link.textContent,
      title: title.textContent,
      description: description.textContent,
    };
  });
};

const parse = (data, postIndex, feedIndex) => {
  const parsed = parseXml(data);
  const feed = extractFeed(parsed, feedIndex);
  const posts = extractPosts(parsed, postIndex, feedIndex);

  return { feed, posts };
};

export default parse;
