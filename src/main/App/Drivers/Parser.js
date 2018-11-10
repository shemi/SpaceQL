// REF: https://github.com/TeamSQL/SQL-Statement-Parser

const MYSQL_STATEMENTS_TYPES = [
    'alter', 'create', 'drop',
    'rename', 'truncate', 'call',
    'delete', 'do', 'handler', 'import',
    'insert', 'load', 'replace', 'select',
    'update', 'start', 'use'
];

const MYSQL_DATABASE_CHANGE_STATEMENTS_TYPES = [
    'create', 'drop', 'rename'
];

const MYSQL_CONTENT_CHANGE_STATEMENTS_TYPES = [
    'delete', 'import', 'insert',
    'load', 'replace', 'update'
];

const MYSQL_TYPE_REGEX = new RegExp(`^\\s?(${MYSQL_STATEMENTS_TYPES.join('|')})`, 'img');
const MYSQL_TABLE_REGEX = /(?:from|join|into)\s+\`?(\w+\b)(?:[\`?|\.?]*)?(\w+\b)?/img;

export class SQLParser {

    static parse(query, dbType, delimiter) {
        let queries = [],
            flag = true,
            restOfQuery = null;

        while (flag) {
            if (restOfQuery == null) {
                restOfQuery = query;
            }

            let statementAndRest = SQLParser.getStatements(restOfQuery, dbType, delimiter),
                statement = statementAndRest[0];

            if (statement != null && statement.trim() !== "") {
                queries.push(
                    SQLParser.createStatement(statement)
                );
            }

            restOfQuery = statementAndRest[1];

            if (restOfQuery == null || restOfQuery.trim() === "") {
                break;
            }
        }

        return queries;
    }

    static createStatement(statement) {
        let sql = statement.replace(/^\s+|\s+$/g, ''),
            types = SQLParser.getStatementTypes(sql),
            type = types[0] || '',
            tdSets = SQLParser.getDatabasesTables(sql),
            table = tdSets[0] ? tdSets[0].table : null,
            database = tdSets[0] ? tdSets[0].database : null,
            contentChanged = MYSQL_CONTENT_CHANGE_STATEMENTS_TYPES.indexOf(type) >= 0;

        return {
            sql,
            types,
            type,
            table,
            database,
            tdSets,
            contentChanged
        }
    }

    static getStatementTypes(statement) {
        let types = [],
            regex = new RegExp(MYSQL_TYPE_REGEX),
            m;

        while ((m = regex.exec(statement)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if(m[1]) {
                types.push(m[1].toLowerCase());
            }
        }

        return types;
    }

    static getDatabasesTables(statement) {
        let sets = [],
            regex = new RegExp(MYSQL_TABLE_REGEX),
            m,
            set;

        while ((m = regex.exec(statement)) !== null) {
            set = {table: null, database: null};

            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if(m[2]) {
                set.database = m[1];
                set.table = m[2];
            }

            else if(m[1]) {
                set.table = m[1];
            }

            sets.push(set);
        }

        return sets;
    }

    static getStatements(query, dbType, delimiter) {
        let charArray = Array.from(query),
            previousChar = null,
            nextChar = null,
            isInComment = false,
            commentChar = null,
            isInString = false,
            stringChar = null,
            isInTag = false,
            tagChar = null,
            resultQueries = [];

        for (let index = 0; index < charArray.length; index++) {

            var char = charArray[index];

            if (index > 0) {
                previousChar = charArray[index - 1];
            }

            if (index < charArray.length) {
                nextChar = charArray[index + 1];
            }

            // it's in string, go to next char
            if (previousChar !== '\\' && (char === '\'' || char === '"') && isInString === false && isInComment === false) {
                isInString = true;
                stringChar = char;

                continue;
            }

            // it's comment, go to next char
            if (((char === '#' && nextChar === ' ') || (char === '-' && nextChar === '-') || (char === '/' && nextChar === '*')) && isInString === false) {
                isInComment = true;
                commentChar = char;
                continue;
            }

            // it's end of comment, go to next
            if (isInComment === true && (((commentChar === '#' || commentChar === '-') && char === '\n') || (commentChar === '/' && (char === '*' && nextChar === '/')))) {
                isInComment = false;
                commentChar = null;
                continue;
            }

            // string closed, go to next char
            if (previousChar !== '\\' && char === stringChar && isInString === true) {
                isInString = false;
                stringChar = null;

                continue;
            }

            if (char.toLowerCase() === 'd' && isInComment === false && isInString === false) {
                let delimiterResult = SQLParser.getDelimiter(index, query, dbType);

                if (delimiterResult != null) {
                    // it's delimiter
                    let delimiterSymbol = delimiterResult[0],
                        delimiterEndIndex = delimiterResult[1];

                    query = query.substring(delimiterEndIndex);
                    resultQueries = SQLParser.getStatements(query, dbType, delimiterSymbol);

                    break;
                }
            }

            if (char === "$" && isInComment === false && isInString === false) {
                let queryUntilTagSymbol = query.substring(index);

                if (isInTag === false) {
                    let tagSymbolResult = SQLParser.getTag(queryUntilTagSymbol, dbType);

                    if (tagSymbolResult != null) {
                        isInTag = true;
                        tagChar = tagSymbolResult[0];
                    }
                }

                else {
                    let tagSymbolResult = SQLParser.getTag(queryUntilTagSymbol, dbType);

                    if (tagSymbolResult != null) {
                        let tagSymbol = tagSymbolResult[0],
                            tagSymbolIndex = tagSymbolResult[1];

                        if (tagSymbol === tagChar) {
                            isInTag = false;
                        }
                    }
                }
            }

            if (delimiter.length > 1 && charArray[index + delimiter.length - 1] !== undefined) {
                for (let i = index + 1; i < index + delimiter.length; i++) {
                    char += charArray[i];
                }
            }

            // it's a query, continue until you get delimiter hit
            if (char.toLowerCase() === delimiter.toLowerCase() && isInString === false && isInComment === false && isInTag === false) {
                if (SQLParser.isGoDelimiter(dbType, query, index) === false) {
                    continue;
                }

                resultQueries = SQLParser.getQueryParts(query, index, delimiter);

                break;
            }
        }

        if (resultQueries.length === 0) {
            if (query != null) {
                query = query.trim();
            }

            resultQueries.push(query, null);
        }

        return resultQueries;
    }

    static getQueryParts(query, splittingIndex, delimiter) {
        let statement = query.substring(0, splittingIndex),
            restOfQuery = query.substring(splittingIndex + delimiter.length),
            result = [];

        if (statement != null) {
            statement = statement.trim();
        }

        result.push(statement);
        result.push(restOfQuery);

        return result;
    }

    static getDelimiter(index, query, dbType) {
        if (dbType === 'mysql') {
            let delimiterKeyword = 'delimiter ',
                delimiterLength = delimiterKeyword.length,
                parsedQueryAfterIndexOriginal = query.substring(index),
                indexOfDelimiterKeyword = parsedQueryAfterIndexOriginal
                    .toLowerCase()
                    .indexOf(delimiterKeyword);

            if (indexOfDelimiterKeyword === 0) {
                let parsedQueryAfterIndex = query.substring(index),
                    indexOfNewLine = parsedQueryAfterIndex.indexOf('\n');

                if (indexOfNewLine === -1) {
                    indexOfNewLine = query.length;
                }

                parsedQueryAfterIndex = parsedQueryAfterIndex.substring(0, indexOfNewLine);
                parsedQueryAfterIndex = parsedQueryAfterIndex.substring(delimiterLength);

                let delimiterSymbol = parsedQueryAfterIndex.trim();

                delimiterSymbol = SQLParser.clearTextUntilComment(delimiterSymbol, dbType);

                if (delimiterSymbol != null) {
                    delimiterSymbol = delimiterSymbol.trim();

                    let delimiterSymbolEndIndex = parsedQueryAfterIndexOriginal.indexOf(delimiterSymbol) + index + delimiterSymbol.length,
                        result = [];

                    result.push(delimiterSymbol);
                    result.push(delimiterSymbolEndIndex);

                    return result;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    }

    static getTag(query, dbType) {
        if (dbType === 'pg') {
            let matchTag = query.match(/^(\$[a-zA-Z]*\$)/i);

            if (matchTag != null && matchTag.length > 1) {
                let result = [],
                    tagSymbol = matchTag[1].trim(),
                    indexOfCmd = query.indexOf(tagSymbol);

                result.push(tagSymbol);
                result.push(indexOfCmd);

                return result;
            } else {
                return null;
            }
        }
    }

    static isGoDelimiter(dbType, query, index) {
        if (dbType === 'mssql') {
            let match = /(?:\bgo\b\s*)/i.exec(query);

            return match != null && match.index === index;
        }
    }

    static clearTextUntilComment(text, dbType) {
        let previousChar = null,
            nextChar = null,
            charArray = Array.from(text),
            clearedText = null;

        for (let index = 0; index < charArray.length; index++) {
            let char = charArray[index];

            if (index > 0) {
                previousChar = charArray[index - 1];
            }

            if (index < charArray.length) {
                nextChar = charArray[index + 1];
            }

            if (((char === '#' && nextChar === ' ') || (char === '-' && nextChar === '-') || (char === '/' && nextChar === '*'))) {
                break;
            } else {
                if (clearedText === null) {
                    clearedText = '';
                }

                clearedText += char;
            }
        }

        return clearedText;
    }
}
