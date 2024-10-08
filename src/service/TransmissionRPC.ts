/**
 * Transmission RPC Client for Ionic/Capacitor, inspired by kkito-transmission-rpc
*/

import * as _ from 'lodash';

// declare const Buffer: any
import { Buffer } from 'buffer';
declare global {
  interface Window {
    net: any;
  }
}

type Method = "get" | "post" | "put" | "patch" | "head" | "delete" | "options" | "upload" | "download";
type Serializer = "json" | "urlencoded" | "utf8" | "multipart" | "raw" | undefined;

let freeSpaceRefreshInterval: any;
let sessionStatsRefreshInterval: any;
let trackerId=0;

class TRPC {
  sessionToken: any;
  sessionArguments: any;
  options: any;
  lastRequestId: number;
  persistentData: any;
  persistentDataValid=false;
  sessionStats: any;
  statsHistory: Array<Array<number|null>>=[];
  pathMapping: Record<string,string>;

  constructor() {
    this.lastRequestId = 0;
    this.pathMapping = {};
  }

  async setServer(options: Record<string, any> = {}, timeout=5): Promise<Record<string, any>> {
    this.sessionToken=null;
    this.options = {
      host:'lemon.dns.navy',
      path:'/transmission/rpc',
      port:9091,
      https:true,
      timeout:timeout,
      auth: { username: 'lemon_88', password: '159And357'}
    };
    
    for (const [key, value] of Object.entries(options)) {
      if(value!=""){
        this.options[key]=value;
      }
    }

    if(this.options.pathMapping){
      this.pathMapping = this.readPathMapping(this.options.pathMapping)
    }

    this.invalidatePersitentData();
    
    this.sessionArguments = await this.getSession();

    this.setFreeSpaceRefreshInterval();
    this.setSessionStatsRefreshInterval();

    return this.sessionArguments;
  }

  readPathMapping(pathMapping: string): Record<string,string> {
    const result: Record<string,string> = {};
    pathMapping.split(/\r?\n/).forEach((pathMap: string) => {
      const paths = pathMap.match(/^(.+) ?= ?(.+)$/)||[];
      for(const key in paths){
        if(paths[key]){
          if(paths[key].startsWith(' ')){
            paths[key]=paths[key].substring(1);
          }
          if(paths[key].endsWith(' ')){
            paths[key]=paths[key].slice(0, -1);
          }
        }
      }
      if(paths.length>=3){
        result[paths[1]]=paths[2];
      }
    });
    return result;
  }

  setFreeSpaceRefreshInterval(): void {
    clearInterval(freeSpaceRefreshInterval);
    freeSpaceRefreshInterval = setInterval(async () => {
      const response = await this.rpcCall("free-space",{path:this.sessionArguments["download-dir"]})
      if(response.result=="success"){
        this.sessionArguments["download-dir-free-space"]=response.arguments["size-bytes"];
      }
    },60000);
  }

  async setSessionStatsRefreshInterval(): Promise<void> {
    this.statsHistory=[];
    clearInterval(sessionStatsRefreshInterval);
    sessionStatsRefreshInterval = setInterval(() => this.getSessionStats(),10000);
    await this.getSessionStats();
  }

  async getSession(): Promise<Record<string, any>> {
    const response = await this.rpcCall("session-get")
    if(response.arguments){
      return response.arguments;
    }
    else {
      return {}
    }
  }

  getSessionArgument(arg: string): Promise<any> {
    return new Promise( (resolutionFunc,rejectionFunc) => {
      let count=0;
      const interval = setInterval(() => {
        if(this.sessionArguments && typeof this.sessionArguments[arg]!="undefined"){
          resolutionFunc(this.sessionArguments[arg]);
        }
        else if(count>=100){
          clearInterval(interval);
          rejectionFunc();
        }
        count++;
      },50);
    });
  }

  getSessionStats() {
    return this.rpcCall("session-stats")
      .then((response) => {
        this.sessionStats = response.arguments;
        this.addStatsHistory(this.sessionStats.downloadSpeed,this.sessionStats.uploadSpeed)
      })
      .catch(() => {
        this.addStatsHistory(null,null);
      })
  }

  addStatsHistory(downloadSpeed: number|null,uploadSpeed: number|null) {
    this.statsHistory.push([downloadSpeed,uploadSpeed]);
    this.statsHistory=this.statsHistory.slice(-30);
  }

  setSession(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise((resolutionFunc,rejectionFunc) => {
      this.rpcCall("session-set", args)
        .then((response) => {
          for (const key in args) {
            this.sessionArguments[key]=args[key];
          }
          resolutionFunc(response);
        })
        .catch(() => rejectionFunc())
    });
  }

  async getToken(): Promise<string> {
    let token="";
    if(this.sessionToken){
      token = this.sessionToken
    }
    else {
      const rep = await this.request("")

      if(rep.errorMessage){
        throw Error(rep.errorMessage);
      }
      else if(rep.status==401) {
        throw Error("Authentication error");
      }

      token = this.readToken(rep);

      if(token!="") {
        this.sessionToken=token;
      }
      else {
        throw Error("Unable to reach Transmission Daemon");
      }
    }
    return token;
  }

  readToken(rep: Record<string,any>): string{
    let token="";
    if(rep.headers && typeof rep.headers['x-transmission-session-id'] !== "undefined"){
      token = rep.headers['x-transmission-session-id'];
    }
    else if(rep.headers && typeof rep.headers['X-Transmission-Session-Id'] !== "undefined"){
      token = rep.headers['X-Transmission-Session-Id'];
    }
    else if(rep.headers && rep.headers.get && rep.headers.get('x-transmission-session-id')!=null){
      token = rep.headers.get('x-transmission-session-id');
    }
    return token;
  }

  async getTorrents(refresh=false) {
    let result: Record<string,Array<any>>={};
    let loadPersistent=false;
    const args: Record<string,any> = {
      format: 'table',
      fields: [
        'activityDate',           // 最近活动时间
        'addedDate',              // 添加时间
        'availability',           // 可下载块
        'bandwidthPriority',
        'comment',                // 备注 / 描述
        'creator',                // 种子创建者
        'dateCreated',            // 种子创建时间
        'doneDate',               // 种子完成时间
        'downloadDir',            // 保存路径
        'downloadedEver',         // 已下载大小
        'downloadLimit',          // 下载限制KB
        'downloadLimited',        // 是否限制下载
        'editDate',               // 
        'error',
        'errorString',
        'eta',
        'etaIdle',
        'file',
        'files',
        'fileStats',
        'group',
        'hashString',
        'haveUnchecked',
        'haveValid',
        'honorsSessionLimits',
        'id',
        'isFinished',
        'isPrivate',
        'isStalled',
        'labels',
        'leftUntilDone',
        'magnetLink',
        'manualAnnounceTime',
        'maxConnectedPeers',
        'metadataPercentComplete',
        'name',
        'peer',
        'peers',
        'peersConnected',
        'peersFrom',
        'peersGettingFromUs',
        'peersSendingToUs',
        'percentComplete',
        'percentDone',
        'pieces',
        'pieceCount',
        'pieceSize',
        'priorities',
        'primary',
        'queuePosition',
        'rateDownload',
        'rateUpload',
        'recheckProgress',
        'secondsDownloading',
        'secondsSeeding',
        'seedIdleLimit',
        'seedIdleMode',
        'seedRatioLimit',
        'seedRatioMode',
        'sequentialDownload',
        'sizeWhenDone',
        'startDate',
        'status',
        'trackers',
        'trackerList',
        'trackerStats',
        'totalSize',
        'torrentFile',
        'uploadedEver',
        'uploadLimit',
        'uploadLimited',
        'uploadRatio',
        'wanted',
        'webseeds',
        'webseedsSendingToUs',
      ]
    }
    if(refresh) {
      args.ids = "recently-active";
    }

    if(!this.persistentDataValid){
      loadPersistent=true;
      args.fields.push('trackers','downloadDir');
    }

    const response = await this.rpcCall("torrent-get", args, true, true);

    if(response.arguments){
      result=response.arguments;
      
      // Parse table mode
      if(result.torrents.length>0 && Array.isArray(result.torrents[0])){
        const header = result.torrents[0];
        result.torrents.shift();
        result.torrents = result.torrents.map(t => {
          return header.reduce((a, v, i) => ({...a, [v]:t[i]}), {});
        })
      }

      if(loadPersistent){
        this.readPersitentData(result);
      }
    }
    return result
  }

  readPersitentData(details: Record<string,Array<any>>) {
    let trackers: Array<Record<string,any>> = [];
    const downloadDirList: Array<string> = [];
    trackerId=0;

    for (const torrent of details.torrents) {

      const dir = this.readDownloadDir(torrent.downloadDir)

      if(!downloadDirList.includes(dir)){
        downloadDirList.push(dir)
      }

      trackers = this.readTrackers(trackers, torrent.trackers, torrent.id);
    }

    downloadDirList.sort();

    this.persistentData = {
      trackers: Object.values(trackers),
      downloadDir: downloadDirList
    }
    this.persistentDataValid = true;
  }

  async getPersistentData(key: string): Promise<any> {
    return new Promise((resolve) => {
      const res = (result: any) => {
        clearInterval(interval);
        resolve(result);
      }

      const check = () => {
        if(this.persistentData && this.persistentData[key]) res(this.persistentData[key]);
      }

       const interval = setInterval(check,100);
      check();
    })
  }

  readDownloadDir(downloadDir: string): string {
    let result = downloadDir
    //eslint-disable-next-line
    if(result.match(/[\/\\]$/)){
      // Remove last / or \
      result = result.substring(0,result.length-1);
    }
    return result;
  }

  readTrackers(trackers: Array<any>, newTrackers: Array<any>, torrentId: number): Array<any>{
    const result: Array<any> = trackers;

    for(const tracker of newTrackers){
      //eslint-disable-next-line
      const matchs = tracker.announce.match(/^[\w]+:\/\/[\w\d\.-]+/);
      if(matchs){
        const tr = matchs[0];
        const data = {
          id:trackerId,
          announce:tr,
          ids:[]
        }
        if(!result[data.announce]){
          result[data.announce] = data;
          trackerId++;
        }
        if(!result[data.announce].ids.includes(torrentId)){
          result[data.announce].ids.push(torrentId)
        }
      }
    }

    return result;
  }

  invalidatePersitentData() {
    this.persistentDataValid = false;
  }

  async getTorrentDetails(id: number) {
    let result: any={};
    const args = {
      ids:id,
      fields: [
        'id',
        'name',
        'percentDone',
        'uploadRatio',
        'rateDownload',
        'rateUpload',
        'downloadedEver',
        'uploadedEver',
        'totalSize',
        'addedDate',
        'status',
        'errorString',
        'activityDate',
        'sizeWhenDone',
        'leftUntilDone',
        'downloadDir',
        'comment',
        'creator',
        'dateCreated',
        'magnetLink',
        'hashString',
        'secondsDownloading',
        'secondsSeeding',
        'pieceCount',
        'pieceSize',
        'files',
        'fileStats',
        'doneDate',
        'downloadLimit',
        'downloadLimited',
        'uploadLimit',
        'uploadLimited',
        'peer-limit',
        'seedRatioLimit',
        'seedRatioMode',
        'seedIdleLimit',
        'seedIdleMode',
        'bandwidthPriority',
        'trackers',
        'trackerStats',
        'peers',
        'recheckProgress'
      ]
    }

    const response = await this.rpcCall("torrent-get", args)


    if(response.arguments && response.arguments.torrents.length > 0){
      result=response.arguments.torrents[0]
    }
    else {
      throw Error("Torrent not found");
    }

    return result;
  }

  async torrentAction(action: string, torrentIds: Array<number>, args: Record<string, any> = {}){
    if(action=="remove" || action=="set-location"){
      this.invalidatePersitentData();
    }
    return this.rpcCall("torrent-"+action, Object.assign({ids:torrentIds}, args))
  }

  async torrentAdd(args: Record<string, any> = {}){
    this.invalidatePersitentData();
    return this.rpcCall("torrent-add", args);
  }

  async rpcCall(method: string, args: Record<string, any> = {}, retry=true, ignoreError=false) {
    const argsClone = _.cloneDeep(args);
    let ret: Record<string, any>={};
    const token = await this.getToken()

    const response = await this.request(method,token,argsClone,ignoreError);

    if(response.errorMessage){
      throw Error(response.errorMessage);
    }

    if(response.status){
      if(response.status===200){
        ret = response.data;
      }
      else if(response.status===409){
        // Invalid token 
        this.sessionToken=this.readToken(response);
        if(retry){
          // Try with the new token
          ret = this.rpcCall(method,args,false);
        }
        else {
          throw Error("Invalid token");
        }
      }
      else {
        throw Error("HTTP "+response.status);
      }
    }
    
    if(ret.result && ret.result!="success"){
      throw Error(ret.result);
    }

    return ret;
  }

  async request(action: string, token?: string, args: Record<string, any> = {}, ignoreError=false) {
    let ret: Record<string, any>={};

    const requestId = ++this.lastRequestId;
    const headers = this.getHeaders();
    const requestUrl = this.getRequestUrl();

    if(token){
      headers["X-Transmission-Session-Id"]=token;
    }

    const datas = {
      method:action,
      arguments:args,
      tag:requestId
    }

    const options = {
      method: "post" as Method,
      headers:headers,
      serializer:"json" as Serializer,
      timeout:parseInt(this.options.timeout),
      data:{},
      body:null as string|null
    }

    if(window.net){
      ret = await this.electronRequest(options,datas);
    }
    else {
      ret = await this.browserRequest(requestUrl,options,datas);
    }

    // Don't return result if tags doesn't match or server has been changed
    if((ret.data && ret.data.tag && ret.data.tag!=requestId) || requestUrl!=this.getRequestUrl()){
      throw Error();
    }

    // Don't report error if there's a more recent request
    if(ret.errorMessage && ignoreError && requestId<this.lastRequestId){
      throw Error();
    }

    return ret;
  }

  /*async nativePluginRequest(requestUrl: string, options: any, datas: Record<string, any>) {
    // HTTP request using CapacitorHttp (allow CORS)
    let result: Record<string, any>={};
    options.data = datas
    
    await this.timeout(this.options.timeout*1000, CapacitorHttp.post({
      url: requestUrl,
      headers: options.headers,
      data: datas,
      connectTimeout: options.timeout*1000,
      responseType: 'json'
    })).then((response) => {
      result=response as Record<string, any>;
    }).catch((error) => {
      if(error.status){
        result=error as Record<string, any>;
      }
      else {
        result.errorMessage=(error=="TypeError: Failed to fetch") ? "Unable to reach host" : error;
      }
    });

    return result;
  }*/

  async electronRequest(options: any, datas: Record<string, any>) {
    // HTTP request using Electron net (allow CORS)
    let result: Record<string, any>={};

    Object.assign(options,{
      hostname:this.options.host,
      port:this.options.port,
      path:this.options.path,
      protocol:this.options.https ? "https:" : "http:"
    })

    await this.timeout(this.options.timeout*1000, window.net.request(options, datas))
      .then((response: any) => {
        result=response;
      })
      .catch((error) => {
        if(error.status){
          result=error;
        }
        else if(error){
          result.errorMessage=error;
        }
      });

    return result;
  }

  async browserRequest(requestUrl: string, options: any, datas: Record<string, any>) {
    // HTTP request using fetch or CapacitorHttp
    let result: Record<string, any>={};
    options.body = JSON.stringify(datas);

    await this.timeout(this.options.timeout*1000, fetch(requestUrl,options))
      .then((response) => {
        result=response as Record<string, any>;
      })
      .catch((error) => {
        result.errorMessage=(error=="TypeError: Failed to fetch") ? "Unable to reach host" : error;
      });

    if(result.json && result.ok){
      result.data = await result.json();
    }

    return result;
  }

  getRequestUrl(): string {
    let result = this.options.https ? "https":"http";
    result += "://"+this.options.host+":"+this.options.port+this.options.path;
    return result;
  }

  getHeaders(headers: any = {}) {
    if(this.options.auth){
      // console.log(this.options.auth)
      const auth = "Basic "+Buffer.from(this.options.auth.username+':'+this.options.auth.password).toString('base64');
      headers["Authorization"]=auth;
    }
    headers["Content-Type"]="application/json";
    return headers;
  }

  timeout(ms: number, promise: Promise<any>) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject("Unable to reach host (Timeout)")
      }, ms)
      promise.then(resolve, reject)
    })
  }
}

export const TransmissionRPC = new TRPC();
