import style from "./BoxItem.module.css";

export default function BoxItem({children, href="#"}){
    return(
        <a href={href}>
            <div className={style.boxItem}>
                {children}
            </div>
        </a>
    );
}