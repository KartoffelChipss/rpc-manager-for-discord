function closeErrWindow() {
    window.api.invoke("closeErrWindow", {});
}

function openExternalLink(link) {
    window.api.invoke("openExternalLink", {
        link: link,
    })
}

window.bridge.sendErrDetails((event, data) => {
    console.log(data)
    document.getElementById("errorName").innerHTML = data.name;
    document.getElementById("errorDesc").innerHTML = data.message;
});