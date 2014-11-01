process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 
//process.env.NODE_DEBUG = 'request http soap';
var events =require('events');
var wait=require('wait.for');
var sys = require('sys');

var AxlClient = function(ip,username,password) {
    
    
  this.soap = new require('node-soap');
  this.reqid = 0;
  this.client=null;
  this.ip = ip;
  this.options = {}
  this.username =username;
  this.password =password;
  this.options.wsdl_headers={};
  this.options.wsdl_options={ 
   'auth': {
      'user': username,
      'pass': password,
      'sendImmediately': true
    }
    
  };

events.EventEmitter.call(this);   
};

AxlClient.super_= events.EventEmitter;
AxlClient.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: AxlClient,
        enumerable: false
    }
});

AxlClient.prototype.setClient = function(c)
{
    this.client = c;
}
AxlClient.prototype.getClient = function()
{
    return this.client;
}

AxlClient.prototype.initCallback = function(err,client) {
    var self = this;
    if (err)
        console.log(err)
    else
    {
        console.log("Got here!!!!")
        
        this.client = client;
        this.emit("initialized",this.client)
    }
}

AxlClient.prototype.init = function() {
    
    var self = this;
   this.url = 'https://'+self.username+':'+self.password+'@'+self.ip+':8443/axl/services/AXLAPIService?wsdl';
     // this.url = 'https://'+self.ip+':8443/axl/services/AXLAPIService?wsdl';
  
    self.soap.createClient(this.url,this.options,function(err,client) {
        if (err)
        {
            console.log(err)
             self.emit("error",err)
        }
        else
        {         
            self.setClient(client);
            self.emit("initialized",self.client)
        }
    } );
  
}

AxlClient.prototype.listUsers = function(firstname) {
 var self = this;
 var listUserReq = {

    searchCriteria : {
        firstName : '%'
    },
    returnedTags : { 
        
         
                firstName : '%'
        
    }
         
    

};

 return self.client.listUser(listUserReq,self.dCallback);
}


AxlClient.prototype.request = function(fname,args,userdata) {
    var self = this;
    var fn = self.client[fname];
    var rqid = -1;
    var udata = userdata;
    
    var callback = function (err, result) {
       if (err) {
            self.emit("error",{'fname': fname, 'reqid' : rqid, 'error' : err,'userdata':udata });
       }
       else
       { 
            self.emit("result",{'fname': fname,'reqid' : rqid, 'result' : result,'userdata':udata });
       }
    }
    
    if (fn == null)
    {
        callback("Error undefined function","");
        return -1;
    }
    
    rqid = self.reqid++;

    fn.apply(this,[args, callback]);
    
    return rqid;
        
    
};

AxlClient.prototype.dCallback = function (err, result) {
    var self = this;
    if (err) {
        console.log(err);
         self.emit("error",err);
    }
    else
    {
        console.log(JSON.stringify(result, null, 4)); 
         self.emit("result",result);
    }
}
module.exports = AxlClient;