const LocalJSONModel = require('../config/localDb');

function wrapModel(mongooseModel, collectionName) {
  const localModel = new LocalJSONModel(collectionName);
  
  // Return a Proxy that checks global.useLocalDB on every method call
  return new Proxy(mongooseModel, {
    get(target, prop) {
      if (global.useLocalDB) {
        if (typeof localModel[prop] === 'function') {
          return localModel[prop].bind(localModel);
        }
        return localModel[prop];
      }
      
      // Default: forward to the actual mongoose model
      const val = Reflect.get(target, prop);
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
  });
}

module.exports = wrapModel;
