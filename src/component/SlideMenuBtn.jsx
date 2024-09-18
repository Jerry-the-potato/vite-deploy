import { useState } from 'react';

export default function SlideMenuBtn({menu, direction ="top"}){
    const [isOpen, setIsOpen] = useState(true);

    function handleClick(e){
        const m = menu.current; // 菜單元素
        const b = e.target; // 按鈕元素
        const menuRect  = m.getBoundingClientRect();
        const buttonRect  = b.getBoundingClientRect();
        const positionOffset = {
            "left": buttonRect.x - menuRect.x,
            "top": buttonRect.y - menuRect.y
        };
        m.style[direction] = !isOpen ? "" : "-" + positionOffset[direction] + "px";

        setIsOpen(!isOpen);
    }
    return <button onClick={handleClick} className="slideMenu">
        {isOpen ? "收起△" : "展開▽"}
    </button>;
}