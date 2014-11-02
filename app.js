/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , request = require('request')
var events =require('events');
var sys = require('sys');
var AxlClient = require('./AxlClient');


var updatePhoneReq = {
         name: '%',
         newName: '%',       
};
var removePhoneReq = {
         name: '%',      
};

var axl = new AxlClient('192.168.1.90','admin','C1sco123') 
axl.init();
axl.on("initialized",function(client) {
    var self = this
    self.client.setSecurity(new self.soap.BasicAuthSecurity(self.username, self.password));
    console.log("Axl Initialized");
});

axl.on("error",function(err) {
    console.log("Received an Error Event");
    console.log("From request id: "+err.reqid);
    console.log("Request name:    "+err.fname);
   
    var response = err.userdata.res;
    
     response.render('results',
        { message : 'Error when calling '+err.fname }
      )
});
       
axl.on("result",function(r) {
    var self = this;
    if (r.reqid == -1)
       console.log("Error! reqid = -1");
    
    var udata = r.userdata;
    var response = r.userdata.res;
    if (r.fname == 'executeSQLQuery')
    {
        if (r.result.return.row)
        {
            if (udata.type === 1)
            {
             
                udata.mac = r.result.return.row.name.substring(3)
                removePhoneReq.name = "SEP"+r.userdata.mac;
                req2 = self.request("removePhone",removePhoneReq,udata);
            }
            else
            {
                updatePhoneReq.name =  r.result.return.row.name;
                updatePhoneReq.newName ="SEP"+r.userdata.mac;
                updatePhoneReq.description ="SEP"+r.userdata.mac;
                req2 = self.request("updatePhone",updatePhoneReq,udata);
            }
        }
        else
        {
            response.render('results',
                { message : 'Phone DN not found!' }
            )
        }
    }
    else if (r.fname == 'updatePhone')
    {
        
        if (r.result.return)
            message = "Phone installed!"
        else
            message = "Phone not installed";
        
        response.render('results',
        { message : message }
        )
    } 
    else if (r.fname == 'removePhone')
    {
        if (r.result.return)
        {
            udata.type = 2;
            
           var sql = {sql: 'SELECT  device.name, dnorpattern FROM Device, DeviceNumPlanMap, NumPlan WHERE DeviceNumPlanMap.fkNumPlan = NumPlan.pkid AND device.pkid=DeviceNumPlanMap.fkDevice AND NumPlan.dnorpattern ="'+udata.dn+'"'}
           reqid = axl.request("executeSQLQuery",sql,udata);
        }
        else{
            
            message = "Error removing phone";
        
            response.render('results',
                { message : message }
            )
        }
            
        
    }
    
    
});

var PhoneInstaller = function() {

    //  Scope.
    var self = this;
    app = this;
    this.reqid = 0;
    this.res= null;
    
    self.compile = function(str, path) {
      return stylus(str)
        .set('filename', path)
        .use(nib())
    }


       
    self.initializeServer = function() {
        
        this.app = express()
        this.app.set('views', __dirname + '/views')
        this.app.set('view engine', 'jade')
        
        this.app.use(stylus.middleware(
          { src: __dirname + '/public'
          , compile: this.compile
          }
        ))
        
        this.app.use(express.static(__dirname + '/public'))

        this.app.get('/', function (req, res) {
          res.render('index',
          { title : 'Home' }
          )
        })
        
        this.app.get('/changeMac', function(req, res){
         // input value from search
            var mac = req.query.mac;
            var dn = req.query.dn;
            var autodn = req.query.autodn;
            var type = 1;
            var sql={}  
            sql[2] = {sql: 'SELECT  device.name, dnorpattern FROM Device, DeviceNumPlanMap, NumPlan WHERE DeviceNumPlanMap.fkNumPlan = NumPlan.pkid AND device.pkid=DeviceNumPlanMap.fkDevice AND NumPlan.dnorpattern ="'+dn+'"'}

            sql[1] = {sql: 'SELECT  device.name, dnorpattern FROM Device, DeviceNumPlanMap, NumPlan WHERE DeviceNumPlanMap.fkNumPlan = NumPlan.pkid AND device.pkid=DeviceNumPlanMap.fkDevice AND NumPlan.dnorpattern ="'+autodn+'"'}

            console.log("%j",req.query)
            if (mac === "")
                type =1
            else if (autodn === "")
                type =2


            var udata = {'res':res,'mac':mac,'dn':dn,'autodn':autodn,'type':type};

             reqid = axl.request("executeSQLQuery",sql[type],udata);
                console.log("request id = "+reqid)
        }) 

     };

    self.startServer = function() {
        this.app.listen(3000)
    }

}

var theApp = new PhoneInstaller();
theApp.initializeServer();
theApp.startServer();

