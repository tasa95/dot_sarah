
exports.action = function(data, callback, config, SARAH){
  
  // Store current user
  if (!data.dictation){
    return callback({'tts': "Je ne comprends pas"});
  }
  var search = data.dictation; 
  
  // Clean question
  var rgxp = /Sarah recherche (.+) (sur)* Wikip(é|e)dia/i
  var match = search.match(rgxp);
  if (!match || match.length <= 1){
    return callback({'tts': "Je ne comprends pas"});
  }
  search = match[1];
  
 
  // Perform search
  query(search, callback);
}

var re = /^(.*?)[.?!]\s*/
var rp = /<\/?[^>]+(>|$)/g
var ex = /^REDIRECT (\w+)\s*/g
var query = function(search, callback){
  var url = 'https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles='+search+'&format=json';
  var request = require('request');
  request({ 'uri' : url, 'json' : true }, function (err, response, body){
    
    if (err || response.statusCode != 200) {
      callback({'tts': "L'action a échoué"});
      return;
    }
    
    var extract = '';
    try {
      extract = getFirst(body.query.pages).extract;
      extract = extract.replace(rp, "");
      extract = re.exec(extract)[1];
    } catch (e){}
    
    
    var redirect = ex.exec(extract); 
    if (redirect && redirect.length > 0){
      console.log('<'+redirect[1]+'>');
      return query(redirect[1], callback);
    }
    
    callback({'tts': extract });
  });
}

var getFirst = function(obj){
  return obj[Object.keys(obj)[0]]
}