import React, { useState, useEffect } from 'react';
import is from 'prop-types';
import Article from '../templates/article';

const url = `https://preview.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}`;
const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;

export default function Preview(props) {
  const [data, setData] = useState();
  const params = new URLSearchParams(props.location.search);

  useEffect(() => {
    if (!params.get('entry')) return;

    fetchContent();
  }, []); // eslint-disable-line

  async function fetchContent() {
    const [draft, categories] = await Promise.all([
      getDraftEntry(),
      getDraftCategories(),
    ]);
    const category = await getDraftCategory(draft.fields.kbAppCategory.sys.id);

    setData((currData) => ({
      ...currData,
      article: {
        ...draft.fields,
        body: {
          json: draft.fields.body,
        },
        category: {
          ...category.fields,
        },
      },
      categories: {
        edges: categories,
      },
    }));
  }

  async function getDraftEntry() {
    const res = await fetch(
      `${url}/entries/${params.get('entry')}?access_token=${previewToken}`
    );

    if (!res.ok) return;

    const json = await res.json();

    return json;
  }

  async function getDraftCategory(categoryId) {
    const res = await fetch(
      `${url}/entries/${categoryId}?access_token=${previewToken}`
    );

    if (!res.ok) return;

    const json = await res.json();

    return json;
  }

  async function getDraftCategories() {
    const res = await fetch(
      `${url}/entries/?content_type=kbAppCategory&access_token=${previewToken}`
    );

    if (!res.ok) return;

    const json = await res.json();
    const categories = json.items
      .filter((category) => !!category.fields.slug && !!category.fields.name)
      .map((category) => ({
        node: { ...category.fields },
      }));

    return categories;
  }

  if (!data) return null;

  return <Article data={data} />;
}

Preview.propTypes = {
  location: is.shape({
    search: is.string.isRequired,
  }).isRequired,
};
