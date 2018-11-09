import Collection from '../utils/Collection';
import Row from "./Row";

export default class RowCollection extends Collection {

    push(data) {
        if(! (data instanceof Row)) {
            data = new Row(data, this.driver);
        }

        this.items.push(data);

        return this;
    }

}