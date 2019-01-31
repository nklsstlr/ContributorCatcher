const axios = require('axios');
var http = require('http');


var contributorsWithCompanyPromise = getContributorsWithCompany();
contributorsWithCompanyPromise.then(function (htmlinput) {
  server = http.createServer(function (request, response) {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end("" + htmlinput);
  });
  server.listen(3000);
});

async function getContributorsWithCompany() {
  // Checking rate limit if app hasnt a clientsecret
  // const rateLimit = await axios({
  //   method: 'GET',
  //   url: 'https://api.github.com/rate_limit',
  //   headers: {
  //     Accept: 'application/vnd.github.v3+json'
  //   }
  // })
  //

  //No Authorize endpoint for token is called, only 60 free calls available
  //For productive use --> get AuthorizationToken with ClientId and ClientSecret
  const reps = await axios({
    method: 'GET',
    url: 'https://api.github.com/repos/cla-assistant/cla-assistant/contributors',
    headers: {
      Accept: 'application/vnd.github.v3+json'
    }
  })

  // call users api from every contributor
  const promises = reps.data.map(async rep => {
    const response = await axios({
      method: 'GET',
      url: rep.url,
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })
    return {
      company: response.data.company,
      contributions: rep.contributions
    }
  })

  const promiseResult = await Promise.all(promises)
  promiseResult.sort(compareContributions)

  promiseResult.forEach(function (element) {
    console.log(element.company + ", " + element.contributions);
  });

  var html = '';

  promiseResult.forEach(function (element) {
    if (element.company == null) {
      element.company = 'Unkown'
    }
    html += element.company + ', ' + element.contributions + ' <br>'
  });
  return html;

}

function compareContributions(a, b) {
  if (a.contributions < b.contributions)
    return 1;
  if (a.contributions > b.contributions)
    return -1;
  return 0;
}



