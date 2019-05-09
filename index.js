// Upgrade 1 on functions: defining meaningfull names for variables and arguments changing from "s" to response for example;
function parseEntity(response) {
  var jsonData = JSON.parse(response);
  return {
    title: jsonData.title,
    date: new Date(jsonData.date),
    url: jsonData.url,
  };
};

// Upgrade 2 on functions: Rather then using .then() way of working with promises we can use async/await for more complex solutions and readability
// Upgrade 3 on functions: using try/catch
//** OLD **
function crawlEntity(response) {
  if (response.url) {
    return fetch(response.url).then(rawData => rawData.text()).then(result => {
      response.html = result;
      return response;
    });
  };

  return response;
};

// ** NEW **
async function crawlEntity(response) {
  if (response.url) {
    try{
      let responseData = await fetch(response.url);
      let rawData = await responseData.text();
      let result = await rawData.html;
      return result;
    }catch(err){
        return err;
    };
  };

  return response;
};


function readMetaTags(response) {
    if (response.html) {
        var description = response.html.match(/<meta name="description" content="(.*)"/)[1];
        var lang = response.html.match(/lang="(.*)"/)[1];

        response.description = description;
        response.lang = lang;
    };
  
    return response;
};
  
function translate(response) {
    if (response.title) {
      if (response.lang == "fa") {
        response.translated = translateText(response.title, "fa");
      } else if (response.lang == "fr") {
        response.translated = translateText(response.title, "fr");
      } else {
        return response;
      };
    };
  
    return response;
};
  
// UPGRADE 1 on algorithm Rather then making recursion on each function to be executed on DATA, we are making ES6 way of pipeline using
// a. spreading operator for functions
// b. arrow function to return new value
// c. Javascript built-in Array.prototype.reduce on functions to be executed on value, in our case DATA

const DATA = "{\"title\":\"Image list\",\"date\":\"May 10, 2019 02:19:46\",\"url\":\"https://api.unsplash.com/search/photos?client_id=4ba96a0c4a7aca189f577b892f66e056fca0ef5f8285ffb0e137368a85899ca0&query=cat\"}";

// ** NEW Supported ES6 version **
const pipe = (...functions) => (value) => {
    return functions
        .reduce((currentValue, currentFunction) => {
            return currentFunction(currentValue);
    }, value)
};

// inline version 
const shorterPipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// ** NEW Unsupported Version in stage 1 of ECMAScript using "|>" operator **
DATA |> parseEntity |> crawlEntity |> readMetaTags |> translate;

// Calling function on listener and returning our pipe function
listener.on('new', (event) => {
    return pipe(
        parseEntity,
        crawlEntity,
        readMetaTags,
        translate 
    )( DATA )
});

//** OLD **
var pipeline = [parseEntity, crawlEntity, readMetaTags, translate];
  
listener.on('new', function(item) {
  function process(item, i) {
    var task = pipeline[i];
    var current = task(item);
    if (current.then) {
      current.then(result => {
        item = result;
        process(item, i + 1);
      });
    } else {
      item = r;
      process(item, i + 1);
    }
  }
  process(item, 0);
});
