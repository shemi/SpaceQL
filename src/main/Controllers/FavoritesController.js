import Controller from "./Controller";
import Favorite from "../Models/Favorite";

class FavoritesController extends Controller {

    get actions() {
        return [
            'all',
            'createUpdate',
            'destroy'
        ];
    }

    all() {
        return this.response(
            Favorite.all()
                .map(favorite => favorite.toCollection())
        );
    }

    createUpdate(form) {
        let favorite;

        if(form.id) {
            favorite = Favorite.get(form.id)
                .fill(form);
        } else {
            favorite = new Favorite(form);
        }

        favorite.save();

        return this.response(favorite.toCollection());
    }

    destroy(id) {
        let favorite = Favorite.get(id);

        if(! favorite) {
            return this.response(false);
        }

        favorite.remove();

        return this.response(true);
    }

}

export default (new FavoritesController);