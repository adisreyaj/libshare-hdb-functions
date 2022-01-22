'use strict';

const needle = require('needle');

const GITHUB_API = 'https://api.github.com/repos';

const formatLibraryMetaData = async (data) => {
  const {
    collected: {
      metadata: { name, version, description, links, license },
    },
    evaluation: {
      popularity: { downloadsCount },
    },
  } = data;

  const githubMetaData = await getRepoDetails(links.repository);

  return {
    name,
    version,
    description,
    links,
    license,
    // image: githubMetaData?.owner?.avatar_url,
    github: getFormattedGithubData(githubMetaData),
    npm: {
      downloadsCount,
    },
  };
};

const getRepoDetails = async (repoLink) => {
  const url = `${GITHUB_API}/${getGithubRepoFullName(repoLink)}`;
  try {
    const result = await needle('get', url);
    return result.body;
  } catch (error) {
    return null;
  }
};

const getFormattedGithubData = (data) =>
  data
    ? {
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        language: data.language,
        homepage: data.homepage,
        image: data.owner?.avatar_url,
      }
    : null;

const getGithubRepoFullName = (githubURL) => {
  const regex = new RegExp(/(github.com\/)(.*)/g);
  try {
    const matches = regex.exec(githubURL);
    if (matches?.length === 3) {
      return matches[2];
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  formatLibraryMetaData,
};
