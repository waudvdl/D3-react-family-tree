import {FunctionComponent, useEffect} from "react";
import './home.sass'
//import * as d3 from "d3";
// @ts-ignore
import * as dTree from "d3-dtree";
// @ts-ignore
import _ from 'lodash-es'

const Home: FunctionComponent = () => {
    // @ts-ignore
    const svg = d3.select("#my_dataviz>g")

    //Start of D3 incest family tree
    let queryCouples: Couple[];

    interface Person{
        id: string,
        name: string,
        //gender: string
    }

    interface Couple{
        id: string
        children: Person[],
        female: Person,
        male: Person
    }

    interface Data{
        queryCouple:Couple[]
    }

    interface TreeData{
        name: string,
        class: "male" | "female",
        textClass?: "threeText",
        marriages?: Array<{
            spouse: {
                name: string,
                class: "female" | "male",
                extra?: {}
            },
            children: TreeData[]
        }>
    }

    //let treeData: TreeData[];


    let margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    async function fetchGraphQL(operationsDoc: string, operationName: string, variables:{}) {
        const result = await fetch(
            "https://nameless-brook-330465.eu-central-1.aws.cloud.dgraph.io/graphql",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJzL3Byb3h5IiwiZHVpZCI6IjB4M2E4YjUzZCIsImV4cCI6MTY1NTAzODMxNiwiaXNzIjoicy9hcGkifQ.0u8oKhDRFGBWwUAqK4og_btdBgXH2A9Ts3DNgnRzbzs"
                },
                body: JSON.stringify({
                    query: operationsDoc,
                    variables: variables,
                    operationName: operationName
                })
            }
        );

        return await result.json();
    }

    const query = `
query MyQuery {
queryCouple {
  children {
    id
    name
  }
  female {
    name
    id
  }
  male {
    name
    id
  }
}
}
`;

    function fetchMyQuery(query: string) {
        return fetchGraphQL(
            query,
            "MyQuery",
            {}
        );
    }

    async function fetchCouples(query :string) {
        const { errors, data } = await fetchMyQuery(query);

        if (errors) {
            // handle those errors like a pro
            console.error(errors);
        }
        return await processData(data)
        //console.log(data);
    }

    //fetchCouples(query).then(data => console.log(JSON.stringify(data)))

    async function processData(data : Data){
        //console.log(data)
        queryCouples = data.queryCouple;
        //console.log(queryCouples);
        let startName = "Philip I"
        let startElement = data.queryCouple.find(e => {return e.male.name === startName})
        let startId : string;
        if(startElement === undefined){
            throw "data could not be loaded correctly"
        }
        else{
             startId= startElement.male.id
        }

        //let treeData: TreeData;
        //console.log(startId)
        return await createTreeData(startId);
    }

    async function createTreeData(id: string, /*treedata: TreeData|{}*/){
        let treedata: TreeData;
        let coupleElement = queryCouples.find((e) => {return e.male.id == id})
        /*let name:string;
        let genderMain:string = "male";
        let genderSpouse:string ="female";*/
        //if men id is not found
        if(coupleElement === undefined){
            coupleElement =  queryCouples.find((e) => {return e.female.id == id})
            /*let genderMain:string = "female";
            let genderSpouse:string ="male";*/
            //if woman nor men aren't in couple query they are alone and don't have any child so end of tree;
            if(coupleElement === undefined){
                let query = `
query MyQuery {
getPerson(id: "${id}") {
  name
  id
}
}
`;

                const person = await fetchPersons(query)
                treedata = {
                    name: person.getPerson.name,
                    class:"male",
                }
                return treedata;
            }
            else{
                const index = queryCouples.indexOf(coupleElement);
                if (index > -1) {
                    queryCouples.splice(index, 1); // 2nd parameter means remove one item only
                }
                if(coupleElement.children.length ===0) {
                    treedata = {
                        name: coupleElement.female.name,
                        class: "female",
                        marriages: [{
                            spouse: {
                                name: coupleElement.male.name,
                                class: "male",
                            },
                            children: []
                        }]
                    }
                    return treedata;
                }

                let parentsChildren: TreeData[] = [];
                for(let i=0; i<coupleElement.children.length; i++){
                    let newTreeData = await createTreeData(coupleElement.children[i].id)
                    if(newTreeData !== undefined)
                        parentsChildren.push(newTreeData);
                }
                treedata = {
                    name: coupleElement.female.name,
                    class: "female",
                    marriages: [{
                        spouse: {
                            name: coupleElement.male.name,
                            class: "male",
                        },
                        children: parentsChildren
                    }]
                }
                return treedata
            }
        }

        if(coupleElement.children.length === 0){
            treedata = {
                name: coupleElement.male.name,
                class:"male",
                //mariage optional
                marriages: [{
                    spouse: {
                        name: coupleElement.female.name,
                        class: "female",
                    },
                    children: []
                }]
            }
            return treedata;
        }
        //if couple does have children and do not end the tree;
        else{
            const index = queryCouples.indexOf(coupleElement);
            if (index > -1) {
                queryCouples.splice(index, 1); // 2nd parameter means remove one item only
            }
            let parentsChildren: TreeData[] = [];
            for(let i=0; i<coupleElement.children.length; i++){
                let newTreeData = await createTreeData(coupleElement.children[i].id)
                if(newTreeData !== undefined)
                    parentsChildren.push(newTreeData);
            }
            treedata = {
                name: coupleElement.male.name,
                class: "male",
                marriages: [{
                    spouse: {
                        name: coupleElement.female.name,
                        class: "female",
                    },
                    children: parentsChildren
                }]
            }
            return treedata;
        }
    }

    async function fetchPersons(query: string) {
        const { errors, data } = await fetchMyQuery(query);

        if (errors) {
            // handle those errors like a pro
            console.error(errors);
        }

        // do something great with this precious data
        //console.log(data);
        return data;
    }

    useEffect(()=>{
        fetchCouples(query)
            .then((data) =>{
                const arrData = [data]
                //console.log(arrData)
                dTree.init(arrData, {
                    target: "#graph",
                    debug: true,
                    height: 800,
                    width: 1200,
                    callbacks: {
                        nodeClick: function(name: string, extra: any) {
                            console.log(name);
                        },
                        textRenderer: function(name: string, extra: { nickname: string; }, textClass: string) {
                            // THis callback is optinal but can be used to customize
                            // how the text is rendered without having to rewrite the entire node
                            // from screatch.
                            /*if (extra && extra.nickname)
                                name = name + " (" + extra.nickname + ")";*/
                            return "<p align='center' class='" + textClass + "'>" + name + "</p>";
                        },
                        nodeRenderer: function(name: string, x: number, y: number, height: number, width: number, extra: any, id: string, nodeClass: string, textClass: any, textRenderer: (arg0: any, arg1: any, arg2: any) => string) {
                            // This callback is optional but can be used to customize the
                            // node element using HTML.
                            let node = '';
                            node += '<div ';
                            node += 'style="height:100%;width:100%;" ';
                            node += 'class="' + nodeClass + '" ';
                            node += 'id="node' + id + '">\n';
                            node += textRenderer(name, extra, textClass);
                            node += '</div>';
                            return node;
                        }
                    }
                });

            })
    },[])

    //EINDE incest tree start normale graph network tree.
    interface Node{
        //id: string,
        name: string,
        //gender: "male" | "female"
    }

    interface Link{
        source: string
        target: string
    }

    let links : Link[] = []
    //let nodes : Node[]

    async function fetchGraphQLNormalFamily(query: string, operationName: string, variables:{}) {
        const result = await fetch(
            "https://nameless-brook-330469.eu-central-1.aws.cloud.dgraph.io/graphql",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJzL3Byb3h5IiwiZHVpZCI6IjB4M2FhZWMxNyIsImV4cCI6MTY1NTEzNzEwNCwiaXNzIjoicy9hcGkifQ.Xig9T8-col2aSsmr97kf_U5hrMOLhTOtU7P-0UD3YqE"
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables,
                    operationName: operationName
                })
            }
        );

        return await result.json();
    }

    const queryNormalFamily = `
  query MyQuery {
    queryCouple {
      children {
        id
        name
        gender
      }
      female {
        id
        name
        gender
      }
      male {
        gender
        id
        name
      }
    }
  }
`;

    function fetchMyQueryNormalFamily(query :string) {
        return fetchGraphQLNormalFamily(
            query,
            "MyQuery",
            {}
        );
    }

    async function startFetchNormalFamily(query: string) {
        const { errors, data } = await fetchMyQueryNormalFamily(query);

        if (errors) {
            // handle those errors like a pro
            console.error(errors);
        }
        // do something great with this precious data
        //console.log(data);
        return data;
    }

    useEffect(() =>{
        startFetchNormalFamily(queryNormalFamily).
        then((data) =>{
            //console.log(data)
            let queryCoupleArr = data.queryCouple;
            for(let i=0; i<queryCoupleArr.length; i++){
                let male:string = queryCoupleArr[i].male.name;
                let female:string = queryCoupleArr[i].female.name
                if(!checkIfLinkExists(male,female)){
                    links.push({source:male,target:female})
                    for (let j=0; j<queryCoupleArr[i].children.length; j++){
                        let child:string = queryCoupleArr[i].children[j].name
                        if (!checkIfLinkExists(male, child)){
                            links.push({source:male,target:child})
                        }

                        if(!checkIfLinkExists(female,child)){
                            links.push({source:female,target:child})
                        }
                    }
                }
            }
            let Nodes = createNodes()
            //console.log(links)

            /* //legacy try out
            let width = 640;
            let height = 480;

            // @ts-ignore
            document.getElementById("normal_graph").innerHTML= ""
            // @ts-ignore
            let svg = d3.select("normal_graph").append("svg")
                .attr('width', width)
                .attr('height', height);

            /* //legacy try out
            // @ts-ignore
            let force = d3.layout.force().size([width,height]).nodes(d3.values(Nodes)).links(links).on("tick", tick).linkDistance(300).start();
            let link = svg.selectAll('.link').data(links).enter().append('line').attr('class','link');
            let node = svg.selectAll('.node').data(force.nodes()).enter().append('circle').attr('class','node').attr('r', width*0.03);;
    */

            // @ts-ignore
            let simulation = d3.forceSimulation(Nodes).force('charge', d3.forceManyBody().strength(-100)).force('center', d3.forceCenter(width / 2, height / 2)).force('link', d3.forceLink().links(links));
            /*
            function tick(e :any){
                node.attr('cx', (d:any)=>{return d.x})
                    .attr('cy', (d:any)=>{return d.y})
                    .call(force.drag);
                link.attr('x1',(d:any)=>{return d.source.x})
                    .attr('y1',(d:any)=>{return d.source.y})
                    .attr('x2',(d:any)=>{return d.target.x})
                    .attr('y2',(d:any)=>{return d.target.y})
            }*/
        });
    },[])

    /*useEffect(() =>{
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
        queryDispatcher.query( sparqlQuery ).then( console.log );
    },[])*/

    function createNodes(): Node[]{
        let nodes: any = {}
        links.forEach(function (link) {
            nodes[link.source] = {name: link.source};
            nodes[link.target] = {name: link.source};
        });

        return nodes
    }

    function checkIfLinkExists(source: string, target: string): boolean{
        for(let i=0; i<links.length; i++){
            if((links[i].source === source && links[i].target === target) || (links[i].target === source && links[i].source === target)){
                return true
            }
        }
        return false;
    }


    return (
        <div>
            <div id="graph">

            </div>
            {/*<svg id="my_dataviz" viewBox={"0 0 1000 1000"}>
                <g>

                </g>
            </svg>*/}
            <div id="normal_graph">

            </div>
        </div>
    )
}

export default Home
