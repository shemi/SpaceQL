import Collection from '../utils/Collection';
import Column from "./Column";

export default class ColumnsCollection extends Collection {

    push(data) {
        if(! (data instanceof Column)) {
            data = new Column(data, this.driver);
        }

        this.items.push(data);

        return this;
    }

    export() {
        let newItems = [];

        for (let item of this.items) {
            newItems.push(item.export());
        }

        return newItems;
    }

}