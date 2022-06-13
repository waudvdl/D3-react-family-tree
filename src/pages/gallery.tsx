import React, {useEffect, useState} from "react";
import Header from "../compontents/header/header";
import {Route, Routes} from "react-router-dom";
import styles from "./gallery.module.sass";
import Card from "../compontents/catCard/catCard";

function Gallery() {
    //const [count, setCount] = useState(0)
    const [catArr, setCatArr] = useState<any[]>([]);

    useEffect(() =>{
        class SPARQLQueryDispatcher {
            private endpoint: any;
            constructor( endpoint: any ) {
                this.endpoint = endpoint;
            }

            query( sparqlQuery: any ) {
                const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
                const headers = { 'Accept': 'application/sparql-results+json' };

                return fetch( fullUrl, { headers } ).then( body => body.json() );
            }
        }

        const endpointUrl = 'https://query.wikidata.org/sparql';
        const sparqlQuery = `PREFIX wdt: <http://www.wikidata.org/prop/direct/>
#Katten
SELECT ?item ?itemLabel
WHERE 
{
  ?item wdt:P31 wd:Q146. # <span lang="en" dir="ltr" class="mw-content-ltr">Must be of a cat</span>
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } # <span lang="en" dir="ltr" class="mw-content-ltr">Helps get the label in your language, if not, then en language</span>
}LIMIT 29`;

        const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
        queryDispatcher.query( sparqlQuery )
            .then(result => result.results.bindings)
            .then(setCatArr);

    },[])


    useEffect(() => {
        console.log(catArr)
    }, [catArr])

    return (
        <div className={styles.gallery}>
            {catArr.map((cat, index) => {
                return <Card key={index} name={cat.itemLabel.value}  url={cat.item.value}/>
            })}
        </div>
    )
}

export default Gallery
