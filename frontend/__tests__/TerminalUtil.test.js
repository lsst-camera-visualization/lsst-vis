import { JSUtil } from "../src/js/util/jsutil";

const RandomWord = () => {
    return Math.random().toString(36).substr(2, 10);
}
const RandomSentence = (num = 4) => {
    let out = "";
    for (let i = 0; i < num; i++)
        out += RandomWord() + " ";
    return out.substr(0, out.length - 1);
}

const IsAlphabetical = array => {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i+1] < array[i])
            return false;
    }
    return true;
}





test("SplitStringByWS [Edge Cases]", () => {
    expect(JSUtil.SplitStringByWS("")).toEqual([]);

    const w = RandomWord();
    expect(JSUtil.SplitStringByWS(w)).toEqual([w]);
});
test("SplitStringByWS [Random x100]", () => {
    for (let i = 0; i < 100; i++) {
        const str = RandomSentence();
        const split = JSUtil.SplitStringByWS(str);
        expect(split.join(" ")).toEqual(str);
    }
});

test("SplitStringByGroup", () => {
    expect(JSUtil.SplitStringByGroup("p1", "(", ")")).toEqual(["p1"]);
    expect(JSUtil.SplitStringByGroup("p1 (g1 g2)", "(", ")")).toEqual(["p1", ["g1", "g2"]]);
    expect(JSUtil.SplitStringByGroup("p1 (g1 g2) p3", "(", ")")).toEqual(
            ["p1", ["g1", "g2"], "p3"]);
    expect(JSUtil.SplitStringByGroup("(g1 g2)", "(", ")")).toEqual(
            [["g1", "g2"]]);
    expect(JSUtil.SplitStringByGroup("(g1 g2) p3", "(", ")")).toEqual(
            [["g1", "g2"], "p3"]);
    expect(JSUtil.SplitStringByGroup("p1 (g1 g2) (gg1 gg2)", "(", ")")).toEqual(
            ["p1", ["g1", "g2"], ["gg1", "gg2"]]);
    expect(JSUtil.SplitStringByGroup("p1 ( g1 g2 )", "(", ")")).toEqual(
            ["p1", ["g1", "g2"]]);
    expect(JSUtil.SplitStringByGroup("p1 (g1 g2 )", "(", ")")).toEqual(
            ["p1", ["g1", "g2"]]);
    expect(JSUtil.SplitStringByGroup("p1 ( g1 g2)", "(", ")")).toEqual(
            ["p1", ["g1", "g2"]]);
    expect(JSUtil.SplitStringByGroup("", "(", ")")).toEqual([]);
    expect(JSUtil.SplitStringByGroup(" ", "(", ")")).toEqual([]);
    expect(JSUtil.SplitStringByGroup("      ", "(", ")")).toEqual([]);
});

test("AlphabetizeArray", () => {
    expect(JSUtil.AlphabetizeArray(["a", "b", "c", "d"])).toEqual(["a", "b", "c", "d"]);
    expect(JSUtil.AlphabetizeArray(["d", "c", "b", "a"])).toEqual(["a", "b", "c", "d"]);
    expect(JSUtil.AlphabetizeArray(["daa", "dbd", "d", "dd"])).toEqual(["d", "daa", "dbd", "dd"]);
    expect(JSJSUtil.AlphabetizeArray([])).toEqual([]);
    expect(JSUtil.AlphabetizeArray(["c"])).toEqual(["c"]);
    expect(JSUtil.AlphabetizeArray(["", "a"])).toEqual(["", "a"]);
    expect(JSUtil.AlphabetizeArray(["a", ""])).toEqual(["", "a"]);
});

test("StringSimilarity", () => {
    expect(JSUtil.StringSimilarity("abcd", "abcdef")).toEqual("abcd");
    expect(JSUtil.StringSimilarity("a", "abcdef")).toEqual("a");
    expect(JSUtil.StringSimilarity("", "abcdef")).toEqual("");
    expect(JSUtil.StringSimilarity("create_box", "create_viewer")).toEqual("create_");
    expect(JSUtil.StringSimilarity("asdf", "")).toEqual("");
});

test("AutoCompleteArray [Construction]", () => {
    let a = new JSUtil.AutoCompleteArray(["create_viewer", "average_pixel", "create_box", "asdfjkl;"], true);
    expect(a.getArray()).toEqual(["asdfjkl;", "average_pixel", "create_box", "create_viewer"]);

    expect(new JSUtil.AutoCompleteArray([]).getArray()).toEqual([]);

    let aCopy = a.clone();
    expect(aCopy.getArray()).toEqual(a.getArray());
    expect(aCopy).not.toBe(a);
    expect(IsAlphabetical(aCopy.getArray())).toBe(true);
});
test("AutoCompleteArray [Insert]", () => {
    let a = new JSUtil.AutoCompleteArray([], true);
    for (let i = 0; i < 10; i++) {
        a.insert(RandomWord());
    }
    expect(IsAlphabetical(a.getArray())).toBe(true);

    let b = new JSUtil.AutoCompleteArray(["asdf", "qwer"], true);
    for (let i = 0; i < 100; i++) {
        b.insert(RandomWord());
    }
    expect(IsAlphabetical(b.getArray())).toBe(true);
})
test("AutoCompleteArray [AutoComplete]", () => {
    let a = new JSUtil.AutoCompleteArray(["create_viewer", "average_pixel", "create_box", "asdfjkl;"], true);
    expect(a.autoComplete("c")).toEqual({ auto: "create_", bWhole: false, match: "create_box" });
    expect(a.autoComplete("crea")).toEqual({ auto: "create_", bWhole: false, match: "create_box" });
    expect(a.autoComplete("create_")).toEqual({ auto: "create_", bWhole: false, match: "create_box" });
    expect(a.autoComplete("")).toEqual({ auto: "a", bWhole: false, match: "asdfjkl;" });
    expect(a.autoComplete("average_pixel")).toEqual({ auto: "average_pixel", bWhole: true, match: "average_pixel" });
})

test("GetWordNumFromCaret", () => {
    const sentence = "word0 word1 word2   word3";

    expect(JSUtil.GetWordNumFromCaret(sentence, 0)).toBe(0);
    expect(JSUtil.GetWordNumFromCaret(sentence, 1)).toBe(0);
    expect(JSUtil.GetWordNumFromCaret(sentence, 5)).toBe(0);
    expect(JSUtil.GetWordNumFromCaret(sentence, 6)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentence, sentence.length)).toBe(3);
    expect(JSUtil.GetWordNumFromCaret(sentence, 17)).toBe(2);
    expect(JSUtil.GetWordNumFromCaret(sentence, 18)).toBe(3);
    expect(JSUtil.GetWordNumFromCaret(sentence, 19)).toBe(3);
    expect(JSUtil.GetWordNumFromCaret(sentence, 20)).toBe(3);

    const sentenceGroup = "word0 (p1 p2)  word3";
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 6)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 7)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 9)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 10)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 12)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 13)).toBe(1);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 14)).toBe(2);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, 15)).toBe(2);
    expect(JSUtil.GetWordNumFromCaret(sentenceGroup, sentenceGroup.length)).toBe(2);
});
