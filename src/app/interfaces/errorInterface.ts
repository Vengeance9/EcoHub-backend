export interface TErrorResponse{
    success:boolean,
    message:string,
    errorSources:TErrorSources[],
    statusCode:number
    stack?:string
}

export interface TErrorSources{
    path:string,
    message:string
}

