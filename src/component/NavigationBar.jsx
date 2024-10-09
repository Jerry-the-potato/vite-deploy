import {useEffect, useState} from "react";

function GetHyperLink({divRef}){
    const [hyperlink, setHyperlink] = useState();
    useEffect(() => {
        const sections = divRef.current.getElementsByTagName("section");
        setHyperlink(Object.keys(sections).map((key) => {
            const ID = sections[key].id;
            return <a key={ID} className="list" href={"#"+ID} id={"to"+ID}
                        onClick={(e) => document.getElementById(ID).scrollIntoView({ behavior: 'smooth' })}
                    >{ID}</a>
        }));
    }, []);
    return hyperlink;
}

function handleHashChange(){
    const hash = window.location.hash;
    if (!hash) return;

    const targetElement = document.querySelector(hash);
    if (!targetElement) return;

    targetElement.scrollIntoView({ behavior: 'smooth' });
};

export default function NavigationBar({width, divRef}){
    useEffect(() => {
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        }
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    return  <nav id="nav" style={{
                'left': (isOpen ? 0 : -width) + "px",
                'width': width
            }}>
                {/* <a className="list" href="#home" id="tohome">Home</a>
                <a className="list" href="#S1" id="toS1">section1</a>
                <a className="list" href="#S2" id="toS2">section2</a>
                <a className="list" href="#S3" id="toS3">section3</a>
                <a className="list" href="#cookie" id="tocookie">cookie</a> */}
                <GetHyperLink divRef={divRef}></GetHyperLink>
                <div onClick={() => setIsOpen(!isOpen)} id="navSlider">
                    <p>{isOpen ? "X": "≡"}</p>
                </div>
            </nav>

}