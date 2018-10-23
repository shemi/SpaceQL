const files = require.context('.', false, /\.js$/);
const controllers = [];

files.keys().forEach(key => {
  if (key === './index.js') {
      return;
  }

  let actions = {},
      controller = files(key).default;



  controllers.push({
      namespace: key.replace(/(\.\/|\.js)/g, ''),
      actions: {},
  });

  modules[key.replace(/(\.\/|\.js)/g, '')] = {
      namespaced: true,
      ...files(key).default
  }
});

export default controllers;
