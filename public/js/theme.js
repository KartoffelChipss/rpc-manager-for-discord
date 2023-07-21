function changeTheme(selectEle) {
    window.api.invoke("changeTheme", {
        theme: selectEle.value,
    })
}

function setTheme(theme) {
    let r = document.querySelector(':root');

    switch (theme) {
        case "dark":
            r.style.setProperty('--bg-color', '313338');
            r.style.setProperty('--grey-1', '1A1B1E');
            r.style.setProperty('--grey-2', '2B2D31');
            r.style.setProperty('--grey-25', '27282b');
            r.style.setProperty('--grey-3', '43444B');
            r.style.setProperty('--light-grey', 'B5BAC1');
            r.style.setProperty('--white-1', 'fefefe');
            r.style.setProperty('--danger', 'DC4C64');
            r.style.setProperty('--success', '14A44D');
            r.style.setProperty('--accent-1', '7c5dc6');
            break;
        
        default:
            r.style.setProperty('--bg-color', '313338');
            r.style.setProperty('--grey-1', '1A1B1E');
            r.style.setProperty('--grey-2', '2B2D31');
            r.style.setProperty('--grey-25', '27282b');
            r.style.setProperty('--grey-3', '43444B');
            r.style.setProperty('--light-grey', 'B5BAC1');
            r.style.setProperty('--white-1', 'fefefe');
            r.style.setProperty('--danger', 'DC4C64');
            r.style.setProperty('--success', '14A44D');
            r.style.setProperty('--accent-1', '7c5dc6');
            break;
    }
}

window.bridge.sendSettings((event, data) => {

});