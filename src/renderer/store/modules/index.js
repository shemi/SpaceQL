const files = require.context('.', false, /\.js$/);
const modules = {};

files.keys().forEach(key => {
  if (key === './index.js') {
      return;
  }

  modules[key.replace(/(\.\/|\.js)/g, '')] = {
      namespaced: true,
      ...files(key).default
  }
});

export default modules
