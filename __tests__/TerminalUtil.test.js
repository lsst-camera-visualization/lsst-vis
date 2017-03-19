import { Util } from "../src/js/util/Util";

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
    expect(Util.SplitStringByWS("")).toEqual([]);

    const w = RandomWord();
    expect(Util.SplitStringByWS(w)).toEqual([w]);
});
test("SplitStringByWS [Random x100]", () => {
    for (let i = 0; i < 100; i++) {
        const str = RandomSentence();
        const split = Util.SplitStringByWS(str);
        expect(split.join(" ")).toEqual(str);
    }
});

test("SplitStringByGroup", () => {
    expect(Util.SplitStringByGroup("p1", "(", ")")).toEqual(["p1"]);
    expect(Util.SplitStringByGroup("p1 (g1 g2)", "(", ")")).toEqual(["p1", ["g1", "g2"]]);
    expect(Util.SplitStringByGroup("p1 (g1 g2) p3", "(", ")")).toEqual(
            ["p1", ["g1", "g2"], "p3"]);
    expect(Util.SplitStringByGroup("(g1 g2)", "(", ")")).toEqual(
            [["g1", "g2"]]);
    expect(Util.SplitStringByGroup("(g1 g2) p3", "(", ")")).toEqual(
            [["g1", "g2"], "p3"]);
    expect(Util.SplitStringByGroup("p1 (g1 g2) (gg1 gg2)", "(", ")")).toEqual(
            ["p1", ["g1", "g2"], ["gg1", "gg2"]]);
    expect(Util.SplitStringByGroup("p1 ( g1 g2 )", "(", ")")).toEqual(
            ["p1", ["g1", "g2"]]);
    expect(Util.SplitStringByGroup("p1 (g1 g2 )", "(", ")")).toEqual(
            ["p1", ["g1", "g2"]]);
    expect(Util.SplitStringByGroup("p1 ( g1 g2)", "(", ")")).toEqual(
            ["p1", ["g1", "g2"]]);
    expect(Util.SplitStringByGroup("", "(", ")")).toEqual([]);
    expect(Util.SplitStringByGroup(" ", "(", ")")).toEqual([]);
    expect(Util.SplitStringByGroup("      ", "(", ")")).toEqual([]);
});

test("AlphabetizeArray", () => {
    expect(Util.AlphabetizeArray(["a", "b", "c", "d"])).toEqual(["a", "b", "c", "d"]);
    expect(Util.AlphabetizeArray(["d", "c", "b", "a"])).toEqual(["a", "b", "c", "d"]);
    expect(Util.AlphabetizeArray(["daa", "dbd", "d", "dd"])).toEqual(["d", "daa", "dbd", "dd"]);
    expect(Util.AlphabetizeArray([])).toEqual([]);
    expect(Util.AlphabetizeArray(["c"])).toEqual(["c"]);
    expect(Util.AlphabetizeArray(["", "a"])).toEqual(["", "a"]);
    expect(Util.AlphabetizeArray(["a", ""])).toEqual(["", "a"]);
});

test("StringSimilarity", () => {
    expect(Util.StringSimilarity("abcd", "abcdef")).toEqual("abcd");
    expect(Util.StringSimilarity("a", "abcdef")).toEqual("a");
    expect(Util.StringSimilarity("", "abcdef")).toEqual("");
    expect(Util.StringSimilarity("create_box", "create_viewer")).toEqual("create_");
    expect(Util.StringSimilarity("asdf", "")).toEqual("");
});

test("AutoCompleteArray [Construction]", () => {
    let a = new Util.AutoCompleteArray(["create_viewer", "average_pixel", "create_box", "asdfjkl;"], true);
    expect(a.getArray()).toEqual(["asdfjkl;", "average_pixel", "create_box", "create_viewer"]);

    expect(new Util.AutoCompleteArray([]).getArray()).toEqual([]);

    let aCopy = a.clone();
    expect(aCopy.getArray()).toEqual(a.getArray());
    expect(aCopy).not.toBe(a);
    expect(IsAlphabetical(aCopy.getArray())).toBe(true);
});
test("AutoCompleteArray [Insert]", () => {
    let a = new Util.AutoCompleteArray([], true);
    for (let i = 0; i < 10; i++) {
        a.insert(RandomWord());
    }
    expect(IsAlphabetical(a.getArray())).toBe(true);

    let b = new Util.AutoCompleteArray(["asdf", "qwer"], true);
    for (let i = 0; i < 100; i++) {
        b.insert(RandomWord());
    }
    expect(IsAlphabetical(b.getArray())).toBe(true);
})
test("AutoCompleteArray [AutoComplete]", () => {
    let a = new Util.AutoCompleteArray(["create_viewer", "average_pixel", "create_box", "asdfjkl;"], true);
    expect(a.autoComplete("c")).toEqual({ auto: "create_", bWhole: false, match: "create_box" });
    expect(a.autoComplete("crea")).toEqual({ auto: "create_", bWhole: false, match: "create_box" });
    expect(a.autoComplete("create_")).toEqual({ auto: "create_", bWhole: false, match: "create_box" });
    expect(a.autoComplete("")).toEqual({ auto: "a", bWhole: false, match: "asdfjkl;" });
    expect(a.autoComplete("average_pixel")).toEqual({ auto: "average_pixel", bWhole: true, match: "average_pixel" });
})
