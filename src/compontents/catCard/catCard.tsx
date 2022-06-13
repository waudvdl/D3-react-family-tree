import React, {FunctionComponent, ReactNode, useEffect, useState} from "react";

import {Route, Routes} from "react-router-dom";
import styles from "./catCard.module.sass";

const Card: FunctionComponent<{name: string, url: string}> = ({name,url})=> {
    const [count, setCount] = useState(0)

    return (
        <div className={styles.catCard}>
            <h2>{name}</h2>
            <a href={url}>view cat's wikidata</a>
        </div>
    )
}

export default Card
