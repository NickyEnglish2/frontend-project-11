const parseXml = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'text/xml');
};

const extractFeed = (parsed) => {
  const feedTitle = parsed.querySelector('title');
  const feedDescription = parsed.querySelector('description');
  const feedLink = parsed.querySelector('link');

  if (!feedTitle || !feedDescription || !feedLink) {
    throw new Error('notContaining');
  }

  return {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
    link: feedLink.textContent,
  };
};

const extractPosts = (parsed) => {
  const itemList = parsed.querySelectorAll('item');
  if (itemList.length === 0) {
    throw new Error('notContaining');
  }

  return Array.from(itemList).map((item) => {
    const link = item.querySelector('link');
    const title = item.querySelector('title');
    const description = item.querySelector('description');

    if (!link || !title || !description) {
      throw new Error('notContaining');
    }

    return {
      link: link.textContent,
      title: title.textContent,
      description: description.textContent,
    };
  });
};

const parse = (data) => {
  const parsed = parseXml(data);
  const feed = extractFeed(parsed);
  const posts = extractPosts(parsed);

  return { feed, posts };
};

export default parse;
