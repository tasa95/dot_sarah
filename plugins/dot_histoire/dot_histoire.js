var mp3     = "plugins/dot_histoire/media/link-between-worlds-title-screen.mp3";
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e9; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

exports.action = function(data, callback, config, SARAH){
  
  // Called by SARAH to perform main action
  console.log('Plugin dot_histoire is called ...');
  console.log(data);
  SARAH.play(mp3);
  console.log("play song");
  SARAH.speak("Il était une fois à l'E S G I", function()
 {
	 sleep(18000);
	 SARAH.speak("Badére est absent à 8h et sera présent après avoir au moins bu son café ", function()
	 {
		 sleep(2000);
		 SARAH.speak("Julien jouera pendant la pause midi au même jeu", function(){
			 sleep(2000);
			SARAH.speak("Marc fera du Marc", function(){
				sleep(2000);
				SARAH.speak("Une bonne partie de la classe sera au baby-foot",function(){
					sleep(2000);
					SARAH.speak("Thomas arrivera peut être à l'heure aujourd'hui",function() {
						sleep(2000);
						SARAH.speak("Le prof de marketing viendra surement pas", function(){
							sleep(2000);
							SARAH.speak("Ce fut une bonne histoire", function(){
								sleep(1000);
								SARAH.speak("Fin");	
							});
						});
					});	
				});
				
			});		
		 }); 
	 });
 });
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
