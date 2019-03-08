/**
 * Wrapper to create a consistent sdk for doing XHR requests. Will
 * automatically replace matching variables in urls that match the pattern.
 * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
 */
export declare class ApiServiceClass {
    throttle(func: () => any, wait: number, immediate: boolean): () => void;
    get(url: string, data: any, config?: RequestInit): Promise<Response>;
    post(url: string, data: any, config?: RequestInit): Promise<Response>;
    put(url: string, data: any, config?: RequestInit): Promise<Response>;
    ['delete'](url: string, data: any, config?: RequestInit): Promise<Response>;
    protected _buildUrl(url: string, data: any, queryString?: boolean): string;
    protected _buildConfig(defaultConfig: any, customConfig?: any): any;
}
declare let ApiService: ApiServiceClass;
export { ApiService };
