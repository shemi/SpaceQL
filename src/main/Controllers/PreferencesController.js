import Controller from "./Controller";
import Preferences from '../Preferences';

class PreferencesController extends Controller {

    get actions() {
        return [
            'get',
            'set'
        ];
    }

    get(key, defaultValue = null) {
        return Preferences.instance().get(key, defaultValue);
    }

    set(key, value = null) {
        Preferences.instance().set(key, value);

        return true;
    }

}

export default (new PreferencesController);