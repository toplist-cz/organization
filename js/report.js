const API_URL = 'http://10.2.30.9:8000/api'

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
    console.log(v);
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

const main = () => {
    let JWT = parseJwt(getVarFromUrl('jwt'))
    if (!JWT) {
        window.location='/?err=password'
    }
    
    let orgIds = Array();
    Object.keys(JWT.sco).forEach(scope => {
        if (scope.substring(0,4) === 'org:') {
            orgIds.push(scope.substring(5))
        }
    })
    if (orgIds.length === 0) {
        alert('No organization specified. Contact profi@toplist.cz')
        return
    }
    let td = document.createElement("td")
    td.textContent = orgIds[0]
    let tr = document.createElement("tr")
    tr.appendChild(td)
    document.querySelector("#mainTable").appendChild(tr)


    getApiToken()

    getApiToken()
    getApiToken()
    getApiToken()
}

main()
