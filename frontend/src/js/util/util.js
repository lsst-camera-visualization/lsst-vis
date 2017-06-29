import { JSUtil } from "../util/jsutil";


export const Util = {
    MapParamsToNames: (paramValues, paramDesc) => {
        let result = {};
        JSUtil.Foreach(paramDesc, (p,i) => { result[p] = paramValues[i]; } );
        return result;
    }
}
