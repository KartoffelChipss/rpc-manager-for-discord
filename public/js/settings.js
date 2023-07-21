function closeSettingsWindow() {
    window.api.invoke("closeSettingsWindow", {});
}

window.bridge.sendSettings((event, data) => {
    if (data.theme) {
        if (data.theme === "light") {
            document.getElementById("theme_dark").selected = false;
            document.getElementById("theme_light").selected = true;
        } else if (data.theme === "extra_dark") {
            document.getElementById("theme_dark").selected = false;
            document.getElementById("theme_xtradark").selected = true;
        } else if (data.theme === "turquoise") {
            document.getElementById("theme_dark").selected = false;
            document.getElementById("theme_turquoise").selected = true;
        }
    }

    if (data.zoom) {
        document.getElementById("zoomInput").value = data.zoom;
        document.getElementById("zoomLabel").innerText = data.zoom.toFixed(2);
    }
});