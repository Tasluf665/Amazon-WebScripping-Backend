$("#search").keyup(function async() {
  let dInput = this.value;
  let URL = `https://completion.amazon.com/api/2017/suggestions?limit=20&prefix=${dInput}&suggestion-type=KEYWORD&page-type=Detail&alias=aps&site-variant=desktop&version=2&event=onKeyPress&wc=&lop=en_US&fb=1&session-id=144-8503021-1272102&request-id=EPCYYJ2H68QH4P71X16J&mid=ATVPDKIKX0DER&plain-mid=1&client-info=amazon-search-ui`;

  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      let suggestions = data.suggestions;
      console.log(data);
      let allSug = "";
      for (let i = 0; i < suggestions.length; i++) {
        allSug = allSug + `<p>${suggestions[i].value}</p></br>`;
      }
      document.getElementById("suggestion").innerHTML = allSug;
    });
});
