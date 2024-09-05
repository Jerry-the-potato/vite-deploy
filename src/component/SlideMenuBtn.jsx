export default function SlideMenuBtn({menu}){
    function handleClick(e){
        const m = menu.current;
        const b = e.target;
        const rectMenu = m.getBoundingClientRect();
        const rectButton = b.getBoundingClientRect();
        const height = rectButton.y - rectMenu.y;
        if(b.innerText == "收起△"){
            m.style.top = "-" + height + "px";
            b.innerText = "展開▽";
        }
        else{
            m.style.top = "1%";
            b.innerText = "收起△";
        }
    }
    return <button onClick={handleClick} className="slideMenu">收起△</button>
}