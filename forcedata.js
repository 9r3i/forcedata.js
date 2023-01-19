/* forcedata.js */
const fs = require('fs').promises;

function ForceData(dname,dbase='.'){
this.version='2.0.4';
this.dir=dbase+'/force/data/'+dname+'/data/';
this.diri=dbase+'/force/data/'+dname+'/images/';
this.init=function(){
  /* check directory */
  const _this=this;
  fs.access(this.dir).then().catch(e=>{
    fs.mkdir(_this.dir,{mode:0o755,recursive:true});
    _this.data('user',[
      {
        uname:'admin',
        upass:'123456'
      }
    ]);
  });
  fs.access(this.diri).then().catch(e=>{
    fs.mkdir(_this.diri,{mode:0o755,recursive:true});
  });
  /* return this object */
  return this;
};
/* --- async base --- */
this.isValidPkey=function(pkey){
  const _this=this;
  return new Promise(resolve=>{
    return _this.isValidPkeyCB(pkey,r=>{
      return resolve(r);
    });
  });
};
this.findById=function(id,base='data'){
  const _this=this;
  return new Promise(resolve=>{
    return _this.findByIdCB(id,base,r=>{
      return resolve(r);
    });
  });
};
this.findData=function(key,value,base='data'){
  const _this=this;
  return new Promise(resolve=>{
    return _this.findDataCB(key,value,base,r=>{
      return resolve(r);
    });
  });
};
this.data=function(name='data',data=false){
  const _this=this;
  return new Promise(resolve=>{
    return _this.dataCB(name,r=>{
      return resolve(r);
    },data);
  });
};
this.read=function(name){
  const _this=this;
  return new Promise(resolve=>{
    return _this.readCB(name,r=>{
      return resolve(r);
    });
  });
};
this.write=function(name,data){
  const _this=this;
  return new Promise(resolve=>{
    return _this.writeCB(name,data,r=>{
      return resolve(r);
    });
  });
};
/* --- callback base --- */
this.isValidPkeyCB=function(pkey,cb){
  cb=typeof cb==='function'?cb:function(){};
  let parse=this.pkeyParse(pkey),
  time=Math.ceil((new Date).getTime()/1000);
  if(!parse||!parse.valid||parse.expire<time){
    return cb(false);
  }
  this.findDataCB('uname',parse.uname,'user',r=>{
    if(!r||r.length<1){
      return cb(false);
    }return cb(r[0].uname===parse.uname?true:false);
  });
};
this.findByIdCB=function(id,base='data',cb=null){
  cb=typeof cb==='function'?cb:function(){};
  return this.findDataCB('id',id,base,cb);
};
this.findDataCB=function(key,value,base='data',cb=null){
  cb=typeof cb==='function'?cb:function(){};
  this.dataCB(base,r=>{
    r=Array.isArray(r)?r:[];
    let res=r.filter(v=>{
      return v.hasOwnProperty(key)&&v[key]==value;
    });
    return cb(res);
  });
};
this.dataCB=function(dname='data',cb=null,ndata=false){
  cb=typeof cb==='function'?cb:function(){};
  let name='__'+dname+'.json';
  if(ndata){
    return this.writeCB(name,ndata,cb);
  }return this.readCB(name,cb);
};
this.readCB=function(name,cb){
  cb=typeof cb==='function'?cb:function(){};
  let file=this.dir+name;
  return fs.readFile(file).then(r=>{
    let td=new TextDecoder(),
    res=false;
    try{
      res=JSON.parse(td.decode(r));
    }catch(e){}
    cb(Array.isArray(res)?res:[]);
  }).catch(e=>{
    return cb([]);
  });
};
this.writeCB=function(name,data,cb){
  cb=typeof cb==='function'?cb:function(){};
  data=Array.isArray(data)?data:[data];
  let file=this.dir+name,
  json=JSON.stringify(data);
  return fs.writeFile(file,json).then(cb).catch(cb);
};
/* --- stand-alone base --- */
this.toSlug=function(str){
  if(typeof str!=='string'){return str;}
  return str.trim().toLowerCase().replace(/[^0-9a-z]+/g,'-');
};
this.pkeyCreate=function(uname,expire){
  let ex=expire.toString(36),
  hash=btoa(uname+expire+ex).toLowerCase().replace(/[^0-9a-z]+/g,'');
  return [uname,ex,hash].join('.');
};
this.pkeyParse=function(pkey){
  let raw=pkey.split('.');
  if(raw.length!=3){return false;}
  let uname=raw[0],
  ex=raw[1],
  expire=parseInt(ex,36,10),
  hash=btoa(uname+expire+ex).toLowerCase().replace(/[^0-9a-z]+/g,'');
  return {
    uname:uname,
    expire:expire,
    key:raw[2],
    hash:hash,
    valid:hash===raw[2],
  }
};
return this.init();
}

exports.ForceData=ForceData;
