import Model from './Model';
import {
    FAVORITES_STORE_KEY
} from '../../utils/constants';

class Favorite extends Model {

    constructor(data = null, id = null) {
        return super(FAVORITES_STORE_KEY, data, id);
    }

}

export default Favorite;