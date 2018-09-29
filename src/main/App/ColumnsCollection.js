import Collection from './Collection';
import Column from "./Column";

export default class ColumnsCollection extends Collection {

    push(data) {
        if(! (data instanceof Column)) {
            data = new Column(data, this.driver);
        }

        this.items.push(data);

        return this;
    }

}