
exports.action = function(data, callback, config, SARAH){
  
  // Called by SARAH to perform main action
  console.log('Plugin dot_itineraire is called ...');
  console.log(data);
  
  // Config is available everywhere
  // var version = Config.modules.dot_itineraire.version;
  
  // SARAH is available everywhere
  
  if (data.dictation)
  {
	var re = /de\s([a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ._\-,\s*]*)\sà\s([a-zA-Z\-áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ._,\s*]*)$/; 
    console.log("Dictation : " + data.dictation);
	var m;
 
	if ((m = re.exec(data.dictation)) !== null) {
		if (m.index === re.lastIndex) {
			re.lastIndex++;
			ville.push(m[re.lastIndex]);
		}
	console.log(m);
	var Ville1 = m[1];
	var Ville2 = m[2];

	SARAH.speak("J'ai compris:" +m[0],function() {
		SARAH.speak("Calcul d'itineraire en cours !");	
	});;
					
	}
  }
  else
  {
	SARAH.speak("je n'ai pas compris");	
  }

	callback();
}

// ------------------------------------------
//  PLUGINS FUNCITONS
// ------------------------------------------

exports.init = function(){
  // Initialize resources of this plugin
  // All declared variables are scoped to this plugin 
  console.log('Plugin dot_itineraire is initializing ...');
}

exports.dispose = function(){
  // Dispose all resources no longer need 
  // a new instance of this plugin will be called
  // This function do not stand async code !
   console.log('Plugin dot_itineraire is disposed ...');
}

exports.ajax = function(req, res, next){
  // Called before rendering portlet when clicking on 
  // <a href="/plugin/dot_itineraire" data-action="ajax">click me</a>  
  // Because portlet CAN'T do asynchronous code
  next();
}

exports.speak = function(tts, async){
  // Hook called for each SARAH.speak()
  // to perform change on string
  // return false to prevent speaking
  // info('Speaking : %s', tts, async);
  return tts;
}

exports.standBy = function(motion, device){
  // Hook called for each motion in a given device
  // to start/stop action when there is no moves
  //info('Motion on %s: %s', device, motion);
}
