import {FunctionComponent} from "react";
import styles from "./header.module.sass";
import {Link} from "react-router-dom";
import HeaderItem from "../headerItem/headerItem";

//const dict = {"home":"/home", "search": "/search", "gallery":"/gallery"}

const Header: FunctionComponent = () => {
    return (
        <nav>
            <div className={styles.leftSide}>
                <h1>DOGBALD</h1>
            </div>
            <ul className={styles.rightSide}>
                <HeaderItem link={"/"}>Home</HeaderItem>
                {/*<HeaderItem link={"/search"}>Search</HeaderItem>*/}
                <HeaderItem link={"/gallery"}>Gallery</HeaderItem>
            </ul>
        </nav>
    )
}

export default Header
