import Collection from './Collection';
import Table from "./Table";

export default class TablesCollection extends Collection {

    push(data) {
        if(! (data instanceof Table)) {
            data = new Table(data, this.driver);
        }

        this.items.push(data);

        return this;
    }

}