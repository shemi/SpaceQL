import Grammar from "./Grammar";

export default class MySqlGrammar extends Grammar {

    wrapValue(value) {
        return value === '*' ? value : '`'+value.replace(/`/g, '``')+'`';
    }

}