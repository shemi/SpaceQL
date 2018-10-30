import Controller from "./Controller";
import Tabs from "../Tabs";

class TabsController extends Controller {

    get actions() {
        return [
            'create',
            'close',

            'closeAll'
        ];
    }

    async create() {
        return this.response(
            await Tabs.instance().create()
        );
    }

    close(id) {
        console.log('close tab', id);

        Tabs.instance()
            .close(id);

        return this.response(true);
    }

    closeAll() {
        Tabs.instance().closeAll();

        return this.response(true);
    }

}

export default (new TabsController);