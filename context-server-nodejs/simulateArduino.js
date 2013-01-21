// TP Ubiquitous Computing - Context Awareness
// C. Gravier - October 11th 2011 evening
// Simulate a Web server in javacript using node.js that acts as the embedded Arduino Web servers done the first hands-on session

// process.argv[2] : IP address of the serveur
// process.argv[3] : server port to listen to

var http = require('http'),
	faye = require('faye');
var fs = require('fs');
var url = require('url');

var addr = process.argv[2];
var port = process.argv[3];

// the faye service for cross browsers publish/subscribe (CometD java client accepted for stand alone version of the client)
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});


// init shutter file to 0 (closed), synch call
var jsondefault = { };
jsondefault["temp"] = "0";
jsondefault["lumi"] = "0";
jsondefault["shutters"] = "closed";

fs.writeFileSync("./"+port+"/context.json", JSON.stringify(jsondefault), 'utf8');


// Handle non-Bayeux requests : generate JSON with current param
var server = http.createServer(function(request, response) {

	// 1 - read JSON from ./shuttters, synch call
	
	var temp = "";
	var lumi = "";
	var shutter = "";

	var data = fs.readFileSync('./'+port+'/context.json'); 
	var jsondata = JSON.parse(data);
	
	// 2 - if GET params "setshutters={closed,opened}"
		if (request.method == "GET" &&  url.parse(request.url).query != null)
		{
			// Modify JSON object accordingly and re-serialized to filesystem
			// print succeed.
			// statuses["shutters"] = getvalue
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write("<html><body>");
			//response.write(jsondata["temp"]);
			
			var query = url.parse(request.url).query;
			var params = query.split("=");
			if (params[0] == "shutters" && (params[1] == "closed" || params[1] == "opened")) 
			{
				jsondata["shutters"]=params[1];
				fs.writeFileSync("./"+port+"/context.json", JSON.stringify(jsondata), 'utf8');
				response.write("Context updated.");
			} else {
				response.write("Erreur, bad GET parameters. Expected is &shutters={closed,opened}");	
			}
			//response.write(query);
			response.write("</body></html>");
			response.end();	
		}
		else {
			// 2bis - else send a stringified JSON object of current temperature, luminosity and shutters statuses via HTTP
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(JSON.parse(data)));
			response.end();
		}
});


bayeux.attach(server);
server.listen(port);

console.log("Server is listening on http://"+addr+":"+port+". Have fun !");

function updateContext()
{
	var data = fs.readFileSync('./'+port+'/context.json'); 
	var jsondata = JSON.parse(data);

	jsondata["temp"] = Math.floor(Math.random()*41);
	jsondata["lumi"] = Math.floor(Math.random()*2001);
	
	fs.writeFileSync("./"+port+"/context.json", JSON.stringify(jsondata), 'utf8');
	
	//console.log("context updated. New temp = "+jsondata["temp"]+", New lumi = "+jsondata["lumi"]);
	
	return jsondata;
}

//console.log("Setting context updates...");
// until the end, update context (temperature and luminosity) to simulate arduino sensors (OK temp and luminosity are randomly generated, i.e. a temp of 10 degrees can be followed by a temp of 39 degrees. This is for demonstration/learning purpose, stay cool with this ! ;-)).
var client = new faye.Client('http://'+addr+':'+port+'/faye');


setInterval(function(){

	// update context and serialize
	var newcontext = updateContext();
	
	// publish updates on topic "contextupdates"
	client.publish('/foo', JSON.stringify(newcontext));
	
	//console.log("Update published on a topic."+JSON.stringify(newcontext));

}, 3000)

/*
while(true)
{
	// update context and serialize
	var newcontext = updateContext();
	
	// publish updates on topic "contextupdates"
	client.publish('/foo', JSON.stringify(newcontext));
	
	//console.log("Update published on a topic."+JSON.stringify(newcontext));
	
	var now = new Date().getTime();
	while(new Date().getTime() < now + 3000) {
   		// do nothing during 3 sec....
	}
}*/
// This is the end & France scores, whoo-whoo !
