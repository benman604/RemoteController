const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
document.getElementById("title").innerText = (urlParams.getAll('title'))
document.title = (urlParams.getAll('title'))
document.getElementById("body").innerText = (urlParams.getAll('body'))