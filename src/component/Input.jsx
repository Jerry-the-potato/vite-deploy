
export default function Input({text, type, id, value}){
    return <>
        <label className="label">{text}</label>
        <input type={type} id={id} defaultValue={value}></input>
    </>
}