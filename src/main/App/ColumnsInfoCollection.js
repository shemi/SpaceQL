import Collection from '../../utils/Collection';
import ColumnInfo from "./ColumnInfo";

export default class ColumnsInfoCollection extends Collection {

    push(data) {
        if(! (data instanceof ColumnInfo)) {
            data = new ColumnInfo(data, this.driver);
        }

        this.items.push(data);

        return this;
    }

}