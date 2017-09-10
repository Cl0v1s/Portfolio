interface Ajax{
    post(url : string, data : any) : Promise<any>;
    get(url : string) : Promise<any>;
}

