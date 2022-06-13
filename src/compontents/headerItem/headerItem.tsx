import {FunctionComponent, ReactNode} from "react";
import styles from "./headerItem.module.sass";
import {Link} from "react-router-dom";

const HeaderItem: FunctionComponent<{link: string, children: ReactNode}> = ({link, children}) => {
    return (
        <li>
            <Link className={styles.link} to={`${link}`}>{children}</Link>
        </li>
    )
}

export default HeaderItem
