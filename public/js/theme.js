function changeTheme(selectEle) {
    window.api.invoke("changeTheme", {
        theme: selectEle.value,
    })
}

function changeZoom(zoomInputEle) {
    //zoomInputEle.parentElement.querySelector("span").innerHTML = zoomInputEle.value;
    window.api.invoke("changeZoom", {
        zoomLevel: Number(zoomInputEle.value),
    })
}

function setZoom(zoomLevel) {
    let r = document.querySelector(':root');
    r.style.setProperty('--zoom', zoomLevel.toString());
}

function setTheme(theme) {
    let r = document.querySelector(':root');

    switch (theme) {
        case "dark":
            r.style.setProperty('--bg-color', '#313338');
            r.style.setProperty('--grey-1', '#1A1B1E');
            r.style.setProperty('--grey-2', '#2B2D31');
            r.style.setProperty('--grey-25', '#27282b');
            r.style.setProperty('--grey-3', '#43444B');
            r.style.setProperty('--light-grey', '#B5BAC1');
            r.style.setProperty('--white-1', '#fefefe');
            r.style.setProperty('--danger', '#DC4C64');
            r.style.setProperty('--success', '#14A44D');
            r.style.setProperty('--accent-1', '#7c5dc6');
            break;

        case "extra_dark":
            r.style.setProperty('--bg-color', '#121212');
            r.style.setProperty('--grey-1', '#000');
            r.style.setProperty('--grey-2', '#141414');
            r.style.setProperty('--grey-25', '#27282b');
            r.style.setProperty('--grey-3', '#2b2b2b');
            r.style.setProperty('--light-grey', '#5f5f5f');
            r.style.setProperty('--white-1', '#b9b9b9');
            r.style.setProperty('--danger', '#DC4C64');
            r.style.setProperty('--success', '#11773a');
            r.style.setProperty('--accent-1', '#7c5dc6');
            break;

        case "turquoise":
            r.style.setProperty('--bg-color', '#303036');
            r.style.setProperty('--grey-1', 'hsl(240, 4%, 24%)');
            r.style.setProperty('--grey-2', '#4a4a50');
            r.style.setProperty('--grey-25', '#23967F');
            r.style.setProperty('--grey-3', '#23967F');
            r.style.setProperty('--light-grey', '#D9DBF1');
            r.style.setProperty('--white-1', '#fefefe');
            r.style.setProperty('--danger', '#DC4C64');
            r.style.setProperty('--success', '#14A44D');
            r.style.setProperty('--accent-1', '#23967F');
            break;

        case "light":
            r.style.setProperty('--accent-1', '#7c5dc6');
            r.style.setProperty('--bg-color', '#FFFFFF');
            r.style.setProperty('--grey-1', '#E1E2E4');
            r.style.setProperty('--grey-2', '#F2F3F5');
            r.style.setProperty('--grey-25', '#EBEDEF');
            r.style.setProperty('--grey-3', '#F2F3F5');
            r.style.setProperty('--light-grey', '#686868');
            r.style.setProperty('--white-1', '#222');
            r.style.setProperty('--danger', '#DC4C64');
            r.style.setProperty('--success', '#7fed5a');
            break;
        
        default:
            r.style.setProperty('--bg-color', '#313338');
            r.style.setProperty('--grey-1', '#1A1B1E');
            r.style.setProperty('--grey-2', '#2B2D31');
            r.style.setProperty('--grey-25', '#27282b');
            r.style.setProperty('--grey-3', '#43444B');
            r.style.setProperty('--light-grey', '#B5BAC1');
            r.style.setProperty('--white-1', '#fefefe');
            r.style.setProperty('--danger', '#DC4C64');
            r.style.setProperty('--success', '#14A44D');
            r.style.setProperty('--accent-1', '#7c5dc6');
            break;
    }
}

window.bridge.sendSettings((event, data) => {
    if (data.theme) setTheme(data.theme);
    if (data.zoom) setZoom(data.zoom);
});