import Model from './Model';
import {
    FAVORITES_STORE_KEY
} from '../../utils/constants';

class Favorite extends Model {

    constructor(data = null, id = null) {
        return super(FAVORITES_STORE_KEY, data, id);
    }

    static createUpdate(form) {
        let inst;

        if(form.id) {
            inst = Favorite.get(form.id)
                .fill(form);
        } else {
            inst = new Favorite(form);


        }

        inst.save();

        return inst.toCollection();
    }

    static getAllAndTransform() {
        let all = Favorite.all(),
            collection = [],
            inst;

        for (inst of all) {
            collection.push(inst.toCollection());
        }

        return collection;
    }

}

export default Favorite;