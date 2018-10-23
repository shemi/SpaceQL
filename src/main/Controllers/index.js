const files = require.context('.', false, /\.js$/);
let controllers = [];

files.keys().forEach(key => {
  if (key === './index.js' || key === './Controller.js') {
      return;
  }

  let actions = {},
      controller = files(key).default;

  if(! controller.actions || controller.actions.length <= 0) {
      return;
  }

  for(let action of controller.actions) {
      actions[action] = controller.call(action);
  }

  controllers.push({
      controller: key.replace(/(\.\/|\.js)/g, ''),
      actions: actions,
  });

});

export default controllers;
