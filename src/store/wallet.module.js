const LOCAL_STORAGE_TAG = 'wallet';

function getDefaultState() {
  return {
    address: null,
  }
}

function product_fruits(user_data) {
  if (window.productFruitsUser) {
    return
  }

  const url = 'https://app.productfruits.com/static/script.js';
  const code = 'RXdeYjXDu-li18DZ';
  window.productFruitsUser = {
    username: user_data['username'], // REQUIRED, must be unique 
    email: user_data['email'],
    signUpAt: user_data['date_joined'], // Sign up date (yyyy-mm-ddThh:mm:ss) 
    role: user_data['user_type'] == 1 ? 'custodial' : 'non custodial',
    props: { auth_level: user_data['auth_level'] } 
  };
  window.productFruits = window.productFruits||{};
  window.productFruits.language = 'en';
  window.productFruits.code = code;
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.async = true;
  script.src = url + '?c=' + code;
  head.appendChild(script);
}

export const wallet = {
  namespaced: true,
  state: getDefaultState,
  actions: {
    connect({commit}, newAddress) {
      commit('setAddress', newAddress)
      return Promise.resolve(newAddress);
    },
    disconnect({commit}) {
      commit('removeAddress')
      return Promise.resolve(true);
    },
  },
  mutations: {
    initialiseStore(state) {     
      const stored_data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAG));

      if (stored_data) {
        Object.assign(state, stored_data);
        // Activate Product Fruits
        // product_fruits(stored_data);
      }
      localStorage.setItem(LOCAL_STORAGE_TAG, JSON.stringify(state));
    },
    setAddress(state, newAddress) {     
      state.address = newAddress;
      localStorage.setItem(LOCAL_STORAGE_TAG, JSON.stringify(state));
    },
    removeAddress(state) {     
      Object.assign(state, getDefaultState())
      localStorage.setItem(LOCAL_STORAGE_TAG, JSON.stringify(state));
    },
  }
};
