function paramsToArray(params: any) {
    const array: any[] = [];
    for (let param in params) {
        array.push(params[param]);
    }
    return array;
}

export {
    paramsToArray
}