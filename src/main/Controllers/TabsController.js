import Controller from "./Controller";
import Tabs from "../Tabs";

class TabsController extends Controller {

    get actions() {
        return [
            'create',
            'close'
        ];
    }

    async create() {
        return this.response(
            await Tabs.instance().create()
        );
    }

    close(id) {
        Tabs.instance()
            .close(id);

        return this.response(true);
    }

}

export default (new TabsController);