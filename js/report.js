const API_URL = 'http://10.2.30.9:8000/api'
let orgIds = Array();

const getVarFromUrl = (key) => {
	const vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		vars[key] = value
	})

	return vars[key]
}

const parseJwt = (token) => {
	try {
		const base64Url = token.split(".")[1]
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
		const jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) {
			return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
		}).join(""))

		return JSON.parse(jsonPayload)
	} catch (error) {
		return false
	}
}

var apiAuthPromise = null;
const auth = async () => {
    if (apiAuthPromise !== null) {
        return apiAuthPromise;
    }
    apiAuthPromise = fetch(API_URL+'/auth/cf5ac64a-ec50-11ea-9d60-a3da01a0b5f8', {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'error',
        referrerPolicy: 'origin',
        body: JSON.stringify({
            "token": getVarFromUrl('jwt')
        })
    });
    return apiAuthPromise;
}

const getApiToken = async () => {
    let v = await apiRequest()
    if (v['description'] === 'Expired') {
        window.location='/?err=Expired'
    }
    return (v.token)
}

var apiToken = null;
const apiRequest  = async () => {
    if (apiToken !== null) {
        return apiToken;
    }
    return new Promise(async (resolve) => {
        if (apiToken) {
            resolve(apiToken);
        }
        await auth().then(response => {
            if (!apiToken) {
                apiToken = response.json();
            };
            resolve(apiToken)
        })
    })
}

const getWebInfo = async(toplistId) => {
    let apiToken = await getApiToken();
    response = await fetch(API_URL+'/site/'+toplistId, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apiToken
        },
        redirect: 'error',
        referrerPolicy: 'origin'
    })
    .then(response => response.json())
    .then(data => {
        let site = data;
        const div = document.querySelector('#mainTable div#site'+toplistId);
        div.textContent = div.textContent + ' - ' + site['title'] + ':' + site['url'] + site['visitsWeek']
    })
}

const toplistIds = async() => {
    let apiToken = await getApiToken();
    response = await fetch(API_URL+'/org/'+orgIds[0]+'/ids', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apiToken
        },
        redirect: 'error',
        referrerPolicy: 'origin'
    })
    .then(response => response.json())
    .then(data => {
        let ids = data['data'];
        ids.forEach(row => {
            let divWeb = document.createElement("div");
            divWeb.textContent = row['toplistId'];
            divWeb.id = 'site'+row['toplistId'];
            divWeb.classList.add('web');
            document.querySelector("#mainTable").appendChild(divWeb)
            getWebInfo(row['toplistId'])
        })
    })
}

const main = async () => {
    let JWT = parseJwt(getVarFromUrl('jwt'))
    if (!JWT) {
        window.location='/?err=password'
    }
    
    Object.keys(JWT.sco).forEach(scope => {
        if (scope.substring(0,4) === 'org:') {
            orgIds.push(scope.substring(4))
        }
    })
    if (orgIds.length === 0) {
        alert('No organization specified. Contact profi@toplist.cz')
        return
    }

    toplistIds();
}

main()
