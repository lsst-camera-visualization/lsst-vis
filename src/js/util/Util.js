


export const Util = {
    // Returns an alphabetized version of the array. Does not change the original array.
    AlphabetizeArray: array => {
        let alpha = array.slice();
        const alphaSort = (a, b) => {
            var keyA = a.toLowerCase();
            var keyB = b.toLowerCase();

            if (keyA < keyB)
                return -1;
            else if (keyA > keyB)
                return 1;
            return 0;
        };

        alpha.sort(alphaSort);
        return alpha;
    },

    AutoCompleteArray: class {
        constructor(arr, allowEmptyMatch = false) {
            this._arr = Util.AlphabetizeArray(arr);
            this._allowEmptyMatch = allowEmptyMatch;
        }

        clone() {
            let a = new Util.AutoCompleteArray([], this._allowEmptyMatch);
            a._arr = this._arr.slice();
            return a;
        }

        // Returns a copy of the auto complete array
        getArray() {
            return this._arr.slice();
        }

        // Gets the first string that matches the input. Returns null if not found.
        autoComplete(input) {
            if (!this._allowEmptyMatch && !input)
                return null;

            const regex = new RegExp('^' + input);
            for (let i = 0; i < this._arr.length; i++) {
                const curr = this._arr[i];
                if (curr.match(regex)) {
                    const next = this._arr[i + 1];

                    if (next && next.match(regex))
                        return { auto : Util.StringSimilarity(curr, next), match : curr, bWhole : false }
                    else
                        return { auto : curr, match : curr, bWhole : true }
                }
            }
            return { auto : '', match : '', bWhole : false }
        };

        insert(key) {
            // Could probably do better...
            if (this._arr.indexOf(key) === -1) {
                this._arr.push(key);
                this._arr = Util.AlphabetizeArray(this._arr);
            }
        };
    },

    Foreach: (array, f) => {
        for (let i = 0; i < array.length; i++) {
            f(array[i], i);
        }
    },

    // Gets the the index of the caret position within the sentence.
    // ie GetWordNumFromCaret("word1 word2 word3", 0) = 0 ("word1")
    // ie GetWordNumFromCaret("word1 word2 word3", 9) = 1 ("word2")
    GetWordNumFromCaret: (str, caretPos, groupBegin = "(", groupEnd = ")") => {
        let count = 0;
        let bInGroup = false;
        for (let i = 1; i <= Math.min(caretPos, str.length); i++) {
            if (str[i-1] === groupBegin)
                bInGroup = true;
            else if (str[i-1] === groupEnd)
                bInGroup = false;

            if (!bInGroup) {
                if (str[i-1].match(/\s/) && i > 1 && str[i-2].match(/\S/))
                    count++;
            }
        }
        return count;
    },

    IsEmptyString: str => {
        return str.match(/^\s*$/) ? true : false;
    },

    LoadJSONFromFile: (path, success, error) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
    },

    ObjectKeyMap: (object, f) => {
        let array = [];
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                array.push(f(key));
            }
        }
        return array;
    },

    ObjectMap: (object, f) => {
        let array = [];
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                array.push(f(object[key]));
            }
        }
        return array;
    },

    ObjectToArray: object => {
        return Util.ObjectKeyMap(object, key => key);
    },

    SplitStringByWS: str => {
        return str.match(/\S+/g) || [];
    },

    SplitStringByGroup: (str, begin = "(", end = ")") => {
        const rSplitWhole = new RegExp("(\\" + begin + ".*?\\" + end + ")|\\S+", "g");
        const rSplitGroup = new RegExp("\\" + begin + "|\\" + end, "g");
        let result = str.match(rSplitWhole);
        if (!result)
            return [];
        return result.map( v => {
                    if (v.match(/\s+/g))
                        return Util.SplitStringByWS(v.replace(rSplitGroup, ""));
                    return v;
                });
    },

    StringSimilarity: (str1, str2) => {
        for (var i = 0; i < str1.length; i++) {
            const start = str1.substr(0, i + 1);
            const regex = new RegExp('^' + start);

            if (!str2.match(regex)) {
                return str1.substr(0, i);
            }
        }
        return str1;
    }
}

export const DOMUtil = {
    // http://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
    GetCaretPos: field => {
      let iCaretPos = 0;

      // IE Support
      if (document.selection) {
        field.focus();
        let oSel = document.selection.createRange();
        oSel.moveStart('character', -field.value.length);
        iCaretPos = oSel.text.length;
      }
      else if (field.selectionStart || field.selectionStart === '0')
        iCaretPos = field.selectionStart;

      return iCaretPos;
    }
}
