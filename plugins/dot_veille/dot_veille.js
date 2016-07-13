

var reveil;
exports.action = function(data, callback, config, SARAH){
  //console.log(data);
  console.log('Plugin dot_veille is called ...', data);
  // Called by SARAH to perform main action
  console.log(SARAH.context); 
  if(data.reveil == "false")
	{
		SARAH.speak("Je me met en veille");
		 callback({"listen":"False"});
		   SARAH.context.reveil = false;
	}
	else
	{
		if(data.reveil == "true")
		{
			SARAH.speak("Je me réveille");
			callback({"listen":"True"});
			  SARAH.context.reveil = true;
		}	
	}
  // The function next() MUST be called ONCE when job is done, 
  // with relevant data to call the next plugin by rule engine.
 // next({ });
}

// ------------------------------------------
//  PLUGINS FUNCITONS
// ------------------------------------------

exports.init = function(SARAH){
  // Initialize resources of this plugin
  // All declared variables are scoped to this plugin 
  SARAH.context.reveil = true;
  console.log('Plugin dot_meteo is initializing ...');
}

exports.dispose = function(){
  // Dispose all resources no longer need 
  // a new instance of this plugin will be called
  // This function do not stand async code !
  
  console.log('Plugin dot_meteo is disposed ...');
}

exports.ajax = function(req, res, next){
  // Called before rendering portlet when clicking on 
  // <a href="/plugin/dot_meteo" data-action="ajax">click me</a>  
  // Because portlet CAN'T do asynchronous code
  //next();
}

exports.speak = function(tts, async){
  // Hook called for each SARAH.speak()
  // to perform change on string
  // return false to prevent speaking
  console.log("Speaking : %s", tts, async);
  // info('Speaking : %s', tts, async);
  
  return tts;
}

exports.standBy = function(motion, device){
  // Hook called for each motion in a given device
  // to start/stop action when there is no moves
  //info('Motion on %s: %s', device, motion);
}
