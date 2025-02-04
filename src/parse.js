const parseXml = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('invalid');
  }

  return doc;
};

const extractFeed = (parsed) => {
  const feedTitle = parsed.querySelector('title')?.textContent;
  const feedDescription = parsed.querySelector('description')?.textContent;
  const feedLink = parsed.querySelector('link')?.textContent;

  if (!feedTitle || !feedDescription || !feedLink) {
    throw new Error('notContaining');
  }

  return {
    title: feedTitle,
    description: feedDescription,
    link: feedLink,
  };
};

const extractPosts = (parsed) => {
  const itemList = parsed.querySelectorAll('item');
  if (itemList.length === 0) {
    throw new Error('notContaining');
  }

  return Array.from(itemList).map((item) => {
    const link = item.querySelector('link')?.textContent;
    const title = item.querySelector('title')?.textContent;
    const description = item.querySelector('description')?.textContent;

    if (!link || !title || !description) {
      throw new Error('notContaining');
    }

    return {
      link,
      title,
      description,
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
