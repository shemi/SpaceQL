export const FAVORITES_STORE_KEY = 'favorites';

export const COLORS = [
    {name: 'None', color: 'black'},
    {name: 'Red', color: '#ff2426'},
    {name: 'Pink', color: '#ff68eb'},
    {name: 'Yellow', color: '#ffef3e'},
    {name: 'Purple', color: '#9d74ff'},
    {name: 'Blue', color: '#251faa'},
    {name: 'Turquoise', color: '#40E0D0'},
    {name: 'Deep Purple', color: '#a33fff'},
];

export const TAB_CONNECTION_FORM = 1;
export const TAB_SETTINGS = 2;
export const TAB_CONNECTION = 2;

export const BUILDER_OPRATORS = [
    '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
    'like', 'like binary', 'not like', 'ilike',
    '&', '|', '^', '<<', '>>',
    'rlike', 'regexp', 'not regexp',
    '~', '~*', '!~', '!~*', 'similar to',
    'not similar to', 'not ilike', '~~*', '!~~*'
];

export const QUERY_OPRATORS = [
    '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
    'like', 'not like'
];

export const LOG_TYPE_INFO = 'info';
export const LOG_TYPE_ERROR = 'error';
export const LOG_TYPE_WARNING = 'warning';