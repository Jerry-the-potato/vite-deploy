export default function SlideMenuBtn({menu}){
    function handleClick(e){
        const m = menu.current;
        const b = e.target;
        const rectMenu = m.getBoundingClientRect();
        const rectButton = b.getBoundingClientRect();
        const height = rectButton.y - rectMenu.y;
        if(b.innerText == "△"){
            m.style.top = "-" + height + "px";
            b.innerText = "▽";
        }
        else{
            m.style.top = "1%";
            b.innerText = "△";
        }
    }
    return <button onClick={handleClick} className="slideMenu">△</button>
}