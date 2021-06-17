import {get} from "./crud"


export function getChildren(parentId){
    return get('/area',"condition?parent_id=" + parentId)
}



  