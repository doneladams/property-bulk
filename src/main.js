/*
                                            .___                                             .__
_________  __ ____           _________  ____| _/          ____ ___  ________    _____ ______ |  |   ____           _____  ______ ______
\____ \  \/ // ___\   ______ \____ \  \/ / __ |  ______ _/ __ \\  \/  /\__  \  /     \\____ \|  | _/ __ \   ______ \__  \ \____ \\____ \
|  |_> >   /\  \___  /_____/ |  |_> >   / /_/ | /_____/ \  ___/ >    <  / __ \|  Y Y  \  |_> >  |_\  ___/  /_____/  / __ \|  |_> >  |_> >
|   __/ \_/  \___  >         |   __/ \_/\____ |          \___  >__/\_ \(____  /__|_|  /   __/|____/\___  >         (____  /   __/|   __/
|__|             \/          |__|            \/              \/      \/     \/      \/|__|             \/               \/|__|   |__|
*/


import Vue from 'vue';
import axios from 'axios';
import createStore from './store';
import configMixin from './util/config-mixin';
import App from './components/App.vue';
import mergeDeep from './util/merge-deep';
import config from './config.js';

import '@fortawesome/fontawesome-pro/js/all';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '../node_modules/phila-standards/dist/css/phila-app.min.css';
import helpers from './util/helpers';
import './styles.css';

import philaVueMapping from '@cityofphiladelphia/phila-vue-mapping';
import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
import philaVueDatafetch from '@cityofphiladelphia/phila-vue-datafetch';
const controllerMixin = philaVueDatafetch.controllerMixin;

const clientConfig = config;
const baseConfigUrl = config.baseConfig;

var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/ajrothwell/mapboard-base-config@74cf4692237e16757681f6860b936efd734c27d8/config.js';

function assignTableIds(comps) {
  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components || options.tables;

    // if this is a "group" component, recurse
    if (innerComps) {
      assignTableIds(innerComps);
      // return;
    }

    // skip comps that aren't horizontal tables
    if (comp.type !== 'horizontal-table') {
      continue;
    }

     const id = generateUniqueId();
     comp._id = id;
     // the id also needs to get passed to the horizontal table component, so
     // use the options object.
     comp.options.tableId = id;
  }
}

function assignHorizontalTableGroupIds(comps) {
  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.tables;

    // if this is a "group" component, recurse
    if (!innerComps) {
      continue;
    }

    // skip comps that aren't horizontal table groups
    if (comp.type !== 'horizontal-table-group') {
      continue;
    }

     const id = generateUniqueId();
     comp._id = id;
     // the id also needs to get passed to the horizontal table component, so
     // use the options object.
     comp.options.horizontalTableGroupId = id;
  }
}

function initVue(config) {
  const store = createStore(config);

  // make config accessible from each component via this.$config
  Vue.use(configMixin, config);

  // mix in controller
  Vue.use(controllerMixin, { config, store });

  Vue.component('font-awesome-icon', FontAwesomeIcon)
  // mount main vue
  const vm = new Vue({
    el: '#vue-app',
    render: h => h(App),
    store
  });
}

// if there is a base config, get base config
if (baseConfigUrl) {
  axios.get(baseConfigUrl).then(response => {
    const data = response.data;
    const baseConfigFn = eval(data);
    const { gatekeeperKey } = clientConfig;
    const baseConfig = baseConfigFn({ gatekeeperKey });

    // deep merge base config and client config
    const config = mergeDeep(baseConfig, clientConfig);

    initVue(config);
  }).catch(err => {
    console.error('Error loading base config:', err);
  });

} else {
  initVue(clientConfig);
}
