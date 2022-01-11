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
}

main()
