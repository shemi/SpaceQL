import Collection from "../utils/Collection";
import Database from "./Database";

export default class DatabasesCollection extends Collection {

    push(data) {
        if(! (data instanceof Database)) {
            data = new Database(data, this.driver);
        }

        this.items.push(data);

        return this;
    }

}