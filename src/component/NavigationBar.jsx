import {useEffect, useState} from "react";

function GetHyperLink(){
    const [hyperlink, setHyperlink] = useState();
    useEffect(() => {
        const sections = document.getElementById("playground").getElementsByTagName("section");
        setHyperlink(Object.keys(sections).map((key) => {
            const ID = sections[key].id;
            return <a key={ID} className="list" href={"#"+ID} id={"to"+ID}>{ID}</a>
        }));

        function handleHashChange(){
            const hash = window.location.hash;
            if (!hash) return;

            const targetElement = document.querySelector(hash);
            if (!targetElement) return;

            targetElement.scrollIntoView({ behavior: 'smooth' });
        };
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        }
    }, []);
    return hyperlink;
}

export default function NavigationBar({width}){

    const [isOpen, setIsOpen] = useState(false);
    function handleClick() {
        setIsOpen(!isOpen);
    }
    return  <nav id="nav" style={{'left': isOpen ? 0 : -width +"px"}}>
                {/* <a className="list" href="#home" id="tohome">Home</a>
                <a className="list" href="#S1" id="toS1">section1</a>
                <a className="list" href="#S2" id="toS2">section2</a>
                <a className="list" href="#S3" id="toS3">section3</a>
                <a className="list" href="#cookie" id="tocookie">cookie</a> */}
                <GetHyperLink></GetHyperLink>
                <div onClick={handleClick} id="navSlider">
                    <p>{isOpen ? "X": "≡"}</p>
                </div>
            </nav>

}