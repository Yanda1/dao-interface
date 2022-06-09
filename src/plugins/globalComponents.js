import VueNumberInput from '@chenfengyuan/vue-number-input';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { Input, Tooltip, Popover } from 'element-ui';
/**
 * You can register global components here and use them as a plugin in your main Vue instance
 */

const GlobalComponents = {
    install(Vue) {
        Vue.component(VueNumberInput.name, VueNumberInput);
        Vue.component('validation-provider', ValidationProvider)
        Vue.component('validation-observer', ValidationObserver)
        Vue.component(Input.name, Input);
        Vue.use(Tooltip);
        Vue.use(Popover);
    }
};

export default GlobalComponents;
