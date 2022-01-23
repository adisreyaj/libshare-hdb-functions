'use strict';

const needle = require('needle');

const GITHUB_API = 'https://api.github.com/repos';

const formatLibraryMetaData = async (data) => {
  const {
    collected: {
      metadata: { name, version, description, links, license, repository },
    },
    evaluation: {
      popularity: { downloadsCount },
    },
  } = data;

  const gitRepo = links.repository ?? repository.url ?? null;
  const githubMetaData = gitRepo ? await getRepoDetails(gitRepo) : null;

  return {
    name,
    version,
    description,
    links,
    license,
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
        url: data.html_url,
      }
    : null;

const getGithubRepoFullName = (githubURL) => {
  const regex = new RegExp(/(github.com\/)(.*)/g);
  try {
    const matches = regex.exec(githubURL);
    if (matches?.length === 3) {
      const url = matches[2];
      return url.includes('.git') ? url.replace('.git', '') : url;
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  formatLibraryMetaData,
};
