
import { request } from "@/utils/request"
export function remove(type, id) {
    return request("api/cfg/" + type + "/" + id, "delete")
}

export function update(type, obj, param) {
    let query = param == "" || param == undefined ? "/" : "/?" + param
    return request("api/cfg/" + type + query, "put", obj)
}
export function post(type, obj, param) {
    let query = param == "" || param == undefined ? "/" : "/?" + param
    return request("api/cfg/" + type + query, "post", obj)
}

export function put(url, obj, param) {
   
    let query = param == "" || param == undefined ? "" : param
    if (query.indexOf("?") != 0){
        query = "?" + query
    }
    return request(url + query, "put", obj)
}

function getType(type){
    if (type == undefined){
        return ""
    }
    let stype = type
    let index = type.indexOf("/")
    if (index == 0){
        stype = stype.substring(1)
    }
    if(stype.indexOf("/") != stype.length -1){
        stype = stype + "/"
    }
    return stype
}

export function get(type, id) {
    
    return request("api/cfg/" + getType(type)  + id, "get")

}

export function getEx(type, id) {
   if (id == undefined)
   {
       id = ""
   }
    return request("api/" + getType(type)  + id, "get")

}

export function getAll(type) {
   
    return request("api/cfg/" + getType(type) , "get")

}
export function getAllEx(type) {
    
    return request("api/" + getType(type), "get")

}

export function removeItem(type, id, dispatch, refreshName) {
    return new Promise((re, rej) => {
        remove(type, id).finally(() => {
            dispatch(refreshName)
        }).catch(err => {
            rej(err)
        }).then(() => {
            re()
        })
    })
}
export function search(type, condition) {
    if (condition) {
        let query = "condition?"
        for (let c in condition) {
            if (condition[c] != undefined && condition[c] != '') {
                query += (c + "=" + condition[c])
            }

        }

        return get(type, query)
    }

}

export function updateItem(type, obj, dispatch, refreshName, param,prefun,afterfun) {
    return new Promise((re, rej) => {
        prefun ? prefun(obj) : null
        update(type, obj, param).finally(() => {
            if (dispatch && refreshName && refreshName !== '') {
                dispatch(refreshName)
            }

        }).catch(err => {
            rej(err)
        }).then(() => {
            re()
        }).finally(()=>{
            afterfun ? afterfun(obj) :null
        })
    })
}

export function newItem(type, obj, dispatch, refreshName, query,prefun,afterfun) {
    prefun ? prefun(obj) : null
    return new Promise((re, rej) => {
        post(type, obj, query).finally(() => {
            afterfun ? afterfun(obj) :null
            dispatch(refreshName)
        }).catch(err => {
            rej(err)
        }).then(() => {
            re()
        })
    })
}

export function handleDataAsTree(catalogs) {
    if (!catalogs || catalogs.length == 0) {
        catalogs = [{ s_name: "根节点", uid: "root" }]
    }
    let tree = []
    //let root = null
    let cache = {}
    catalogs.forEach(c => {
        c.title = c.s_name
        c.key = c.uid
        cache[c.uid] = c
        c.value = c.key
        c.children = []
    })
    catalogs.forEach(c => {
        if (c.parent_id == "" || c.parent_id == undefined) {
            tree.push(c)
        }
        else {
            let t = cache[c.parent_id]
            if (t) {
                if (!t.children) {
                    t.children = []
                }
                t.children.push(c)
            }
        }

    })
    return { tree, cache }
}

export function refresh(commit, funName, type, rootState) {
    return refreshEx(commit, funName, "cfg/" + type, rootState)
}
export function refreshEx(commit, funName, type, rootState) {
    return new Promise((re, rej) => {
        getAllEx(type).then(res => {
            let result = res.data
            if (result && result.error) {
                return rej(result.error)
            }
            let retunValue = null
            if (result && result.result )
            {
                retunValue = result.result
            }
            if (!rootState) {
                commit(funName, retunValue)
            } else {
                commit(funName, { result: retunValue, rootState })
            }

            return re(result.result)
           
        }).catch(err => {
            rej(err)
        })
    })
}


export function refreshByID(commit, funName, type, id, rootState) {
    return new Promise((re, rej) => {
        get(type, id).then(res => {
            let result = res.data
            if (result.result) {
                if (!rootState) {
                    commit(funName, result.result)
                } else {
                    commit(funName, { result: result.result, rootState })
                }

                return re(result.result)
            }
            if (result.error) {
                return rej(result.error)
            }
        }).catch(err => {
            rej(err)
        })
    })
}
export default {
    remove,
    update,
    get,
    getAll,
    refresh,
    handleDataAsTree,
    removeItem,
    updateItem,
    newItem,
    search
}
